import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import * as p from "@clack/prompts";
import { generateCode, loadFile, type ProxifiedModule } from "magicast";
import {
	addVitePlugin,
	getConfigFromVariableDeclaration,
	getDefaultExportOptions,
} from "magicast/helpers";
import { installPackages } from "./install";
import { m } from "./messages";
import {
	existingCssConfig,
	newCssConfig,
	detectFramework,
	detectPackageManager,
	MARKER,
	readPackageJson,
} from "./project";
import type { RegistryTheme, ThemeColor } from "./registry";
import { cancelled, say, tag } from "./ui";

const EXTENSIONS = "{js,jsx,ts,tsx,mdx}";

type Bundler = "vite" | "postcss";

// one change to the project; `apply` returns what it did, to print
export interface Step {
	stage: string;
	file: string;
	apply: () => Promise<string>;
}

export interface Plan {
	packages: string[];
	steps: Step[];
	// what the CLI cannot do here, said in a line each
	manual: string[];
	// worth knowing, nothing to do
	notes: string[];
	// what an existing config lacks for the components; added without asking,
	// the same way the component files are, and said by hand if the edit fails
	theme: (Step & { fallback: string }) | null;
}

const first = (root: string, paths: string[]) =>
	paths.find((path) => existsSync(join(root, path))) ?? null;

const has = (root: string, path: string, text: string) =>
	readFileSync(join(root, path), "utf8").includes(text);

export function bundlerFor(framework: string | null): Bundler | null {
	if (!framework) return null;
	return framework.startsWith("Next.js") ? "postcss" : "vite";
}

// the folders the classes live in, as globs for `source`
export function sources(root: string, componentsDir: string): string[] {
	const top = componentsDir.split("/")[0] ?? "src";
	const dirs = existsSync(join(root, "src"))
		? ["src"]
		: ["app", "pages", "components", top].filter((dir) =>
				existsSync(join(root, dir)),
			);
	if (!dirs.includes(top)) dirs.push(top);
	return [...new Set(dirs)].map((dir) => `./${dir}/**/*.${EXTENSIONS}`);
}

// the stylesheet the app already loads: globals.css on Next.js, or the
// first CSS file the Vite entry imports
export function stylesheet(root: string, bundler: Bundler): string | null {
	if (bundler === "postcss") {
		return first(root, [
			"app/globals.css",
			"src/app/globals.css",
			"styles/globals.css",
			"src/styles/globals.css",
		]);
	}

	const entry = first(
		root,
		["main", "index"].flatMap((name) =>
			["tsx", "ts", "jsx", "js"].map((ext) => `src/${name}.${ext}`),
		),
	);
	if (entry) {
		const source = readFileSync(join(root, entry), "utf8");
		const css = /import\s+["'](\.{1,2}\/[^"']+\.css)["']/.exec(source)?.[1];
		if (css) {
			const path = relative(root, join(root, dirname(entry), css));
			if (existsSync(join(root, path))) return path.replace(/\\/g, "/");
		}
	}
	return first(root, [
		"src/index.css",
		"src/style.css",
		"src/styles.css",
		"src/App.css",
	]);
}

// a name with a dash, such as out-quart, is a quoted key
const quoted = (key: string) =>
	/^[a-z]+$/.test(key) ? key : JSON.stringify(key);

// a pair is written as an object, so the config reads like the docs
const literal = (value: ThemeColor) =>
	typeof value === "string"
		? JSON.stringify(value)
		: `{ light: ${JSON.stringify(value.light)}, dark: ${JSON.stringify(value.dark)} }`;

const block = (name: string, table: Record<string, ThemeColor>) =>
	Object.keys(table).length
		? `    ${name}: {\n${Object.entries(table)
				.map(([key, value]) => `      ${quoted(key)}: ${literal(value)},`)
				.join("\n")}\n    },\n`
		: "";

const KINDS = [
	"states",
	"easings",
	"keyframes",
	"colors",
	"boxShadow",
] as const;

export function configSource(globs: string[], theme?: RegistryTheme): string {
	const body = theme
		? KINDS.map((kind) => block(kind, theme[kind] ?? {})).join("")
		: "";
	return `import { defineConfig } from "yummacss";

export default defineConfig({
  source: [${globs.map((glob) => `"${glob}"`).join(", ")}],
${body ? `  theme: {\n${body}  },\n` : ""}});
`;
}

// the names a config does not define yet
export function missingTheme(source: string, theme?: RegistryTheme): string[] {
	return Object.keys({
		...theme?.states,
		...theme?.easings,
		...theme?.keyframes,
		...theme?.colors,
		...theme?.boxShadow,
	}).filter(
		(name) => !new RegExp(`(?<![\\w-])["']?${name}["']?\\s*:`).test(source),
	);
}

// generating from the module, not its AST, keeps the file's own quotes and semicolons
const save = (mod: ProxifiedModule, path: string) =>
	writeFileSync(path, generateCode(mod).code);

// `export default { ... }`, `defineConfig({ ... })`, or `const config = { ... }`
// exported by name
function editExport(
	mod: ProxifiedModule,
	change: (options: ReturnType<typeof getDefaultExportOptions>) => void,
): void {
	const options = getDefaultExportOptions(mod);
	const named = (options.$type as string) === "identifier";
	const { config, declaration } = named
		? getConfigFromVariableDeclaration(mod)
		: { config: options, declaration: null };
	if (!config) throw new Error("no config object");
	change(config);
	if (declaration) {
		if (declaration.init?.type !== "ObjectExpression") {
			throw new Error("config is not an object literal");
		}
		// a variable's object is a copy; write it back
		declaration.init = generateCode(config).code as never;
	}
}

function addPostcssPlugin(mod: ProxifiedModule): void {
	editExport(mod, (options) => {
		options.plugins ??= {};
		options.plugins["@yummacss/postcss"] = {};
	});
}

// adds what the theme lacks and never replaces what the config has
export function addTheme(mod: ProxifiedModule, theme: RegistryTheme): string[] {
	const added: string[] = [];
	editExport(mod, (options) => {
		options.theme ??= {};
		for (const kind of KINDS) {
			const entries = Object.entries(theme[kind] ?? {});
			if (!entries.length) continue;
			options.theme[kind] ??= {};
			const table = options.theme[kind];
			for (const [name, value] of entries) {
				if (table[name] !== undefined) continue;
				table[name] = value;
				added.push(name);
			}
		}
	});
	return added;
}

export function planSetup(
	root: string,
	componentsDir: string,
	theme?: RegistryTheme,
): Plan {
	const pkg = readPackageJson(root);
	const deps = new Set([
		...Object.keys((pkg.dependencies as object) ?? {}),
		...Object.keys((pkg.devDependencies as object) ?? {}),
	]);
	const bundler = bundlerFor(detectFramework(root));
	const plugin = bundler && `@yummacss/${bundler}`;

	const plan: Plan = {
		packages: [],
		steps: [],
		manual: [],
		notes: [],
		theme: null,
	};
	if (!deps.has("yummacss")) plan.packages.push("yummacss");
	if (plugin && !deps.has(plugin)) plan.packages.push(plugin);

	if (bundler === "postcss") {
		const file = first(root, [
			"postcss.config.mjs",
			"postcss.config.js",
			"postcss.config.cjs",
		]);
		if (!file) {
			plan.steps.push({
				stage: "write",
				file: "postcss.config.mjs",
				apply: async () => {
					writeFileSync(
						join(root, "postcss.config.mjs"),
						`export default {\n  plugins: {\n    "@yummacss/postcss": {},\n  },\n};\n`,
					);
					return "postcss.config.mjs";
				},
			});
		} else if (!has(root, file, "@yummacss/postcss")) {
			plan.steps.push({
				stage: "edit",
				file,
				apply: async () => {
					const mod = await loadFile(join(root, file));
					addPostcssPlugin(mod);
					save(mod, join(root, file));
					return m.setup.registered(file, "@yummacss/postcss");
				},
			});
		}
	} else if (bundler === "vite") {
		const file = first(
			root,
			["ts", "mts", "js", "mjs"].map((ext) => `vite.config.${ext}`),
		);
		if (!file) {
			plan.manual.push(m.setup.noVite);
		} else if (!has(root, file, "@yummacss/vite")) {
			plan.steps.push({
				stage: "edit",
				file,
				apply: async () => {
					const mod = await loadFile(join(root, file));
					addVitePlugin(mod, {
						from: "@yummacss/vite",
						constructor: "yummacss",
					});
					save(mod, join(root, file));
					return m.setup.registered(file, "yummacss()");
				},
			});
		}
	} else {
		plan.manual.push(m.setup.noBuild);
	}

	const existing = existingCssConfig(root);
	if (existing) {
		const source = readFileSync(join(root, existing), "utf8");
		const missing = missingTheme(source, theme);
		const own = Object.keys(theme?.colors ?? {}).filter(
			(name) => !missing.includes(name),
		);
		if (own.length) plan.notes.push(m.setup.ownColors(existing, own));
		if (missing.length && theme) {
			plan.theme = {
				stage: "edit",
				file: existing,
				apply: async () => {
					const path = join(root, existing);
					const mod = await loadFile(path);
					const added = addTheme(mod, theme);
					save(mod, path);
					return m.setup.themeAdded(existing, added);
				},
				fallback: m.setup.missingTheme(existing, missing),
			};
		}
	} else {
		const file = newCssConfig(pkg);
		plan.steps.push({
			stage: "write",
			file,
			apply: async () => {
				writeFileSync(
					join(root, file),
					configSource(sources(root, componentsDir), theme),
				);
				return file;
			},
		});
	}

	const css = bundler && stylesheet(root, bundler);
	if (!css) {
		plan.manual.push(m.setup.noStylesheet);
	} else if (!has(root, css, "@yummacss")) {
		plan.steps.push({
			stage: "edit",
			file: css,
			apply: async () => {
				const path = join(root, css);
				writeFileSync(path, `${MARKER}\n\n${readFileSync(path, "utf8")}`);
				return m.setup.marked(css);
			},
		});
	}

	return plan;
}

// offers to finish setting up Yumma CSS; false only when a step failed
export async function setUpStyling(
	root: string,
	componentsDir: string,
	yes: boolean,
	theme?: RegistryTheme,
): Promise<boolean> {
	const plan = planSetup(root, componentsDir, theme);
	if (plan.theme) {
		try {
			say.done(plan.theme.stage, await plan.theme.apply());
		} catch {
			say.warn("manual", plan.theme.fallback);
		}
	}
	for (const line of plan.notes) say.info("theme", line);
	if (!plan.packages.length && !plan.steps.length) {
		// set up already; anything left is a line to add, not a question
		for (const line of plan.manual) say.warn("check", line);
		return true;
	}

	if (!yes && !process.stdout.isTTY) {
		say.warn("check", m.setup.unstyled());
		return true;
	}

	if (!yes) {
		const answer = await p.confirm({
			message: tag("setup", m.setup.ask),
		});
		if (p.isCancel(answer)) {
			cancelled();
			return false;
		}
		if (!answer) {
			say.warn("check", m.setup.declined());
			return true;
		}
	}

	if (plan.packages.length) {
		const pm = detectPackageManager(root);
		if (!(await installPackages(root, pm, plan.packages, true))) return false;
	}

	for (const step of plan.steps) {
		try {
			say.done(step.stage, await step.apply());
		} catch {
			say.warn(step.stage, m.setup.failed(step.file));
		}
	}
	for (const line of plan.manual) say.warn("manual", line);
	if (plan.manual.length) say.info("docs", m.setup.docs());

	return true;
}
