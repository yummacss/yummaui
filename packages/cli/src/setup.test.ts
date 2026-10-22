import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import {
	configSource,
	missingTheme,
	planSetup,
	sources,
	stylesheet,
} from "./setup";

const dirs: string[] = [];

function project(files: Record<string, string | object>): string {
	const dir = mkdtempSync(join(tmpdir(), "yummaui-"));
	dirs.push(dir);
	for (const [name, body] of Object.entries(files)) {
		const path = join(dir, name);
		mkdirSync(join(path, ".."), { recursive: true });
		writeFileSync(
			path,
			typeof body === "string" ? body : JSON.stringify(body, null, 2),
		);
	}
	return dir;
}

afterEach(() => {
	for (const dir of dirs.splice(0))
		rmSync(dir, { recursive: true, force: true });
});

async function run(dir: string) {
	const plan = planSetup(dir, "components/ui");
	for (const step of plan.steps) await step.apply();
	return plan;
}

const read = (dir: string, file: string) =>
	readFileSync(join(dir, file), "utf8");

describe("planSetup on Vite", () => {
	const vite = () =>
		project({
			"package.json": { devDependencies: { vite: "7" } },
			"vite.config.ts": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n});\n`,
			"src/main.tsx": `import "./index.css";\n`,
			"src/index.css": "body { margin: 0; }\n",
		});

	it("installs both packages and registers the plugin", async () => {
		const dir = vite();
		const plan = await run(dir);
		expect(plan.packages).toEqual(["yummacss", "@yummacss/vite"]);
		expect(plan.manual).toEqual([]);
		const config = read(dir, "vite.config.ts");
		expect(config).toContain(`import yummacss from "@yummacss/vite"`);
		expect(config).toMatch(/plugins: \[react\(\), yummacss\(\)\]/);
	});

	it("writes the config and marks the stylesheet the entry imports", async () => {
		const dir = vite();
		await run(dir);
		expect(read(dir, "yumma.config.mjs")).toContain(
			`source: ["./src/**/*.{js,jsx,ts,tsx,mdx}", "./components/**/*.{js,jsx,ts,tsx,mdx}"]`,
		);
		expect(read(dir, "src/index.css")).toBe(
			"@yummacss;\n\nbody { margin: 0; }\n",
		);
	});

	it("has nothing left to do the second time", async () => {
		const dir = vite();
		await run(dir);
		const deps = { yummacss: "4", "@yummacss/vite": "4", vite: "7" };
		writeFileSync(
			join(dir, "package.json"),
			JSON.stringify({ devDependencies: deps }),
		);
		expect(planSetup(dir, "components/ui")).toEqual({
			packages: [],
			steps: [],
			manual: [],
			notes: [],
			theme: null,
		});
	});
});

describe("planSetup on Next.js", () => {
	it("extends an existing PostCSS config", async () => {
		const dir = project({
			"package.json": { dependencies: { next: "16" } },
			"app/globals.css": "",
			"postcss.config.mjs": `const config = {\n  plugins: {\n    autoprefixer: {},\n  },\n};\n\nexport default config;\n`,
		});
		await run(dir);
		const config = read(dir, "postcss.config.mjs");
		expect(config).toContain(`"@yummacss/postcss": {}`);
		expect(config).toContain("autoprefixer");
		expect(read(dir, "app/globals.css")).toBe("@yummacss;\n\n");
	});

	it("writes a PostCSS config when there is none", async () => {
		const dir = project({
			"package.json": { dependencies: { next: "16" } },
			"src/app/globals.css": "",
		});
		const plan = await run(dir);
		expect(plan.packages).toContain("@yummacss/postcss");
		expect(read(dir, "postcss.config.mjs")).toContain("@yummacss/postcss");
	});
});

describe("planSetup without a known build", () => {
	it("leaves the build to the reader and says so", () => {
		const dir = project({ "package.json": {} });
		const plan = planSetup(dir, "components/ui");
		expect(plan.packages).toEqual(["yummacss"]);
		expect(plan.manual).toHaveLength(2);
	});
});

describe("stylesheet", () => {
	it("falls back to a conventional name when the entry imports none", () => {
		const dir = project({ "src/main.ts": "", "src/style.css": "" });
		expect(stylesheet(dir, "vite")).toBe("src/style.css");
	});

	it("finds nothing rather than guessing", () => {
		expect(stylesheet(project({}), "vite")).toBeNull();
	});
});

describe("sources", () => {
	it("covers the components folder even before it exists", () => {
		const dir = project({ "app/page.tsx": "" });
		expect(sources(dir, "components/ui")).toEqual([
			"./app/**/*.{js,jsx,ts,tsx,mdx}",
			"./components/**/*.{js,jsx,ts,tsx,mdx}",
		]);
	});
});

describe("theme", () => {
	const theme = {
		states: { opening: "[data-starting-style]" },
		easings: { "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)" },
		keyframes: { spin: "to { rotate: 360deg; }" },
	};

	it("writes the components' states, easings and keyframes into a new config", async () => {
		const dir = project({ "package.json": {}, "src/main.ts": "" });
		for (const step of planSetup(dir, "components/ui", theme).steps)
			await step.apply();
		const config = read(dir, "yumma.config.mjs");
		expect(config).toContain(`opening: "[data-starting-style]",`);
		expect(config).toContain(`spin: "to { rotate: 360deg; }",`);
		expect(config).toContain(`"out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",`);
	});

	it("names what an existing config lacks", () => {
		expect(missingTheme(`theme: { states: { opening: "x" } }`, theme)).toEqual([
			"out-quart",
			"spin",
		]);
		expect(
			missingTheme(`opening: "x", "out-quart": "y", 'spin': "z"`, theme),
		).toEqual([]);
	});

	it("writes colors into a new config, a pair as light and dark", () => {
		const source = configSource(["./src/**/*.tsx"], {
			...theme,
			colors: {
				ink: "#1e232a",
				surface: { light: "#ffffff", dark: "#2d2f33" },
			},
		});
		expect(source).toContain(`ink: "#1e232a",`);
		expect(source).toContain(`surface: { light: "#ffffff", dark: "#2d2f33" },`);
	});

	it("reads an index published before easings existed", () => {
		const { easings: _, ...older } = theme;
		expect(configSource(["./src/**/*.tsx"], older)).not.toContain("easings");
	});
});

describe("theme in an existing config", () => {
	const theme = {
		states: {
			opening: "[data-starting-style]",
			closing: "[data-ending-style]",
		},
		keyframes: { spin: "to { rotate: 360deg; }" },
		colors: {
			surface: { light: "#ffffff", dark: "#2d2f33" },
			ink: { light: "#1e232a", dark: "#ececee" },
		},
	};
	const configured = (config: string) =>
		project({
			"package.json": { dependencies: { yummacss: "4" } },
			"src/main.ts": "",
			"yumma.config.mjs": config,
		});
	const apply = async (dir: string) => {
		const plan = planSetup(dir, "components/ui", theme);
		await plan.theme?.apply();
		return plan;
	};

	it("adds only what it lacks and keeps the project's own colors", async () => {
		const dir = configured(
			`import { defineConfig } from "yummacss";\n\nexport default defineConfig({\n  source: ["./src/**/*.tsx"],\n  theme: {\n    states: { opening: "[data-open]" },\n    colors: { surface: "#fafafa" },\n  },\n});\n`,
		);
		const plan = await apply(dir);
		const config = read(dir, "yumma.config.mjs");
		expect(config).toContain(`opening: "[data-open]"`);
		expect(config).toContain(`surface: "#fafafa"`);
		expect(config).toContain(`closing: "[data-ending-style]"`);
		expect(config).toContain(`spin: "to { rotate: 360deg; }"`);
		expect(config).toMatch(
			/ink: \{\s*light: "#1e232a",\s*dark: "#ececee",?\s*\}/,
		);
		expect(plan.notes).toEqual([
			"yumma.config.mjs already defines surface, so components use your colors",
		]);
		expect(planSetup(dir, "components/ui", theme).theme).toBeNull();
	});

	it("adds a theme to a config that has none", async () => {
		const dir = configured(
			`export default {\n  source: ["./src/**/*.tsx"],\n};\n`,
		);
		await apply(dir);
		const config = read(dir, "yumma.config.mjs");
		expect(config).toContain(`closing: "[data-ending-style]"`);
		expect(config).toMatch(/surface: \{\s*light: "#ffffff"/);
	});

	it("edits a config exported through a variable", async () => {
		const dir = configured(
			`const config = {\n  source: ["./src/**/*.tsx"],\n};\n\nexport default config;\n`,
		);
		await apply(dir);
		expect(read(dir, "yumma.config.mjs")).toContain(
			`opening: "[data-starting-style]"`,
		);
	});

	it("falls back to a line to add when the config is not an object", async () => {
		const dir = configured(`export default makeConfig();\n`);
		const plan = planSetup(dir, "components/ui", theme);
		await expect(plan.theme?.apply()).rejects.toThrow();
		expect(plan.theme?.fallback).toContain(
			"opening, closing, spin, surface, ink",
		);
		expect(read(dir, "yumma.config.mjs")).toBe(
			`export default makeConfig();\n`,
		);
	});
});
