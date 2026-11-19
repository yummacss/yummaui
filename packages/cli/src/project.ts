import {
	existsSync,
	readFileSync,
	statSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { registryUrl } from "./registry";

export const CONFIG_FILE = "yummaui.config.mjs";
// the config before 1.0, moved to CONFIG_FILE on the next run
export const LEGACY_CONFIG_FILE = "yummaui.json";
export const CSS_CONFIG_FILE = "yummacss.config.mjs";
// the name Yumma CSS read before 4.11, and still reads until 5.0
export const LEGACY_CSS_CONFIG_FILE = "yumma.config.mjs";
export const DOCS = "https://yummacss.com/docs/installation";
export const UI_DOCS = "https://www.yummaui.com/docs/installation";
export const MARKER = "@yummacss;";

export interface Config {
	componentsDir: string;
	alias: string | null;
	registry: string;
	shape?: string;
}

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

const LOCKFILES: Record<string, PackageManager> = {
	"pnpm-lock.yaml": "pnpm",
	"bun.lockb": "bun",
	"bun.lock": "bun",
	"yarn.lock": "yarn",
	"package-lock.json": "npm",
};

export function findProjectRoot(from = process.cwd()): string | null {
	let dir = resolve(from);
	for (;;) {
		if (existsSync(join(dir, "package.json"))) return dir;
		const parent = dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

export function readPackageJson(root: string): Record<string, unknown> {
	try {
		return JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
	} catch {
		return {};
	}
}

export function detectPackageManager(root: string): PackageManager {
	for (const [lockfile, pm] of Object.entries(LOCKFILES)) {
		if (existsSync(join(root, lockfile))) return pm;
	}
	const field = readPackageJson(root).packageManager;
	if (typeof field === "string") {
		const name = field.split("@")[0];
		if (
			name === "pnpm" ||
			name === "npm" ||
			name === "yarn" ||
			name === "bun"
		) {
			return name;
		}
	}
	return "npm";
}

export function detectFramework(root: string): string | null {
	const pkg = readPackageJson(root);
	const deps = {
		...(pkg.dependencies as Record<string, string> | undefined),
		...(pkg.devDependencies as Record<string, string> | undefined),
	};
	if (deps.next) {
		const app = ["app", "src/app"].some((d) => existsSync(join(root, d)));
		return app ? "Next.js (App Router)" : "Next.js (Pages Router)";
	}
	if (deps.astro) return "Astro";
	if (deps["react-router"] || deps["@remix-run/react"]) return "React Router";
	if (deps.vite) return "Vite";
	return null;
}

export function detectAlias(root: string): string | null {
	for (const file of ["tsconfig.json", "jsconfig.json"]) {
		const path = join(root, file);
		if (!existsSync(path)) continue;
		try {
			const raw = readFileSync(path, "utf8")
				.replace(/\/\*[\s\S]*?\*\//g, "")
				.replace(/(^|\s)\/\/.*$/gm, "$1");
			const parsed = JSON.parse(raw);
			const paths = parsed?.compilerOptions?.paths as
				| Record<string, string[]>
				| undefined;
			if (paths?.["@/*"]) return "@";
		} catch {}
	}
	return null;
}

export function configPath(root: string): string {
	return join(root, CONFIG_FILE);
}

function normalize(parsed: Partial<Config>): Config {
	return {
		componentsDir: parsed.componentsDir ?? "components/ui",
		alias: parsed.alias ?? null,
		registry: registryUrl(parsed.registry),
		...(parsed.shape ? { shape: parsed.shape } : {}),
	};
}

/** Moves a `yummaui.json` to `yummaui.config.mjs`, and says whether it did. */
export function moveLegacyConfig(root: string): boolean {
	const legacy = join(root, LEGACY_CONFIG_FILE);
	if (existsSync(configPath(root)) || !existsSync(legacy)) return false;
	let parsed: Partial<Config>;
	try {
		parsed = JSON.parse(readFileSync(legacy, "utf8"));
	} catch {
		return false;
	}
	writeConfig(root, normalize(parsed));
	unlinkSync(legacy);
	return true;
}

export async function readConfig(root: string): Promise<Config | null> {
	const path = configPath(root);
	if (!existsSync(path)) return null;
	try {
		// the modified time busts the module cache, so a rewritten file is read again
		const url = `${pathToFileURL(path).href}?v=${statSync(path).mtimeMs}`;
		const parsed: unknown = (await import(url)).default;
		if (typeof parsed !== "object" || parsed === null) return null;
		return normalize(parsed as Partial<Config>);
	} catch {
		return null;
	}
}

export function writeConfig(root: string, config: Config): void {
	const fields = Object.entries(config)
		.map(([key, value]) => `\t${key}: ${JSON.stringify(value)},`)
		.join("\n");
	writeFileSync(configPath(root), `export default {\n${fields}\n};\n`);
}

export function missingDependencies(
	root: string,
	deps: { name: string; version: string }[],
): { name: string; version: string }[] {
	const pkg = readPackageJson(root);
	const installed = new Set([
		...Object.keys((pkg.dependencies as object) ?? {}),
		...Object.keys((pkg.devDependencies as object) ?? {}),
		...Object.keys((pkg.peerDependencies as object) ?? {}),
	]);
	return deps.filter((d) => !installed.has(d.name));
}

export function installCommand(
	pm: PackageManager,
	specs: string[],
	dev = false,
): { command: string; args: string[] } {
	const args = [
		pm === "npm" ? "install" : "add",
		...(dev ? ["-D"] : []),
		...specs,
	];
	return { command: pm, args };
}

export function runner(root: string | null = findProjectRoot()): string {
	const pm = root ? detectPackageManager(root) : "npm";
	switch (pm) {
		case "pnpm":
			return "pnpm dlx yummaui";
		case "yarn":
			return "yarn dlx yummaui";
		case "bun":
			return "bunx yummaui";
		default:
			return "npx yummaui";
	}
}

/** The Yumma CSS config a project already has, under either name. */
export function existingCssConfig(root: string): string | null {
	return (
		[CSS_CONFIG_FILE, LEGACY_CSS_CONFIG_FILE].find((name) =>
			existsSync(join(root, name)),
		) ?? null
	);
}

/** The name to write: the legacy one when an installed Yumma CSS predates 4.11. */
export function newCssConfig(pkg: Record<string, unknown>): string {
	const range = {
		...(pkg.devDependencies as Record<string, string>),
		...(pkg.dependencies as Record<string, string>),
	}.yummacss;
	const [major, minor] = (/(\d+)\.(\d+)/.exec(range ?? "") ?? [])
		.slice(1)
		.map(Number);
	if (major === undefined || minor === undefined) return CSS_CONFIG_FILE;
	return major < 4 || (major === 4 && minor < 11)
		? LEGACY_CSS_CONFIG_FILE
		: CSS_CONFIG_FILE;
}
