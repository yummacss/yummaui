import { existsSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import c from "picocolors";
import { detectFramework, readPackageJson } from "./project";

/** The one name the config loader looks for, across every plugin. */
export const CSS_CONFIG_FILE = "yumma.config.mjs";

export const DOCS = "https://yummacss.com/docs/installation";

/**
 * The plugin that makes Yumma CSS generate, by framework.
 *
 * Next.js goes through PostCSS, which covers both Turbopack and Webpack.
 * Everything else here is Vite underneath - Astro and React Router included -
 * so it gets the Vite plugin. An unrecognised project gets neither: there is
 * no honest guess, and naming the wrong package is worse than naming none.
 */
function pluginFor(framework: string | null): string | null {
	if (!framework) return null;
	if (framework.startsWith("Next.js")) return "@yummacss/postcss";
	return "@yummacss/vite";
}

export interface Styling {
	/** `yummacss` itself. Without it no class in a component means anything. */
	core: boolean;
	/** The framework plugin, when the framework is one with a known answer. */
	plugin: { name: string; installed: boolean } | null;
	config: boolean;
}

/**
 * Whether Yumma CSS is set up, by package name and config file.
 *
 * By name only, like `missingDependencies`: a version range would mean
 * resolving semver against a lockfile, and the question here is whether the
 * component that just landed will have any styling at all.
 */
export function detectStyling(root: string): Styling {
	const pkg = readPackageJson(root);
	const deps = new Set([
		...Object.keys((pkg.dependencies as object) ?? {}),
		...Object.keys((pkg.devDependencies as object) ?? {}),
	]);
	const plugin = pluginFor(detectFramework(root));

	return {
		core: deps.has("yummacss"),
		plugin: plugin ? { name: plugin, installed: deps.has(plugin) } : null,
		config: existsSync(join(root, CSS_CONFIG_FILE)),
	};
}

/** What is missing, in the order you would fix it. Empty means set up. */
export function missingStyling(styling: Styling): string[] {
	const missing: string[] = [];
	if (!styling.core) missing.push("yummacss");
	if (styling.plugin && !styling.plugin.installed)
		missing.push(styling.plugin.name);
	if (!styling.config) missing.push(CSS_CONFIG_FILE);
	return missing;
}

/**
 * Says so when a component would land unstyled.
 *
 * The docs used to carry a framework setup tab on every component page, which
 * put the answer where nobody had asked the question. Here the CLI already
 * knows the project, so it can ask it.
 */
export function warnStyling(root: string): void {
	const missing = missingStyling(detectStyling(root));
	if (missing.length === 0) return;

	const lines = missing.map((name) => `  ${c.yellow("+")} ${name}`);
	p.log.warn(
		[
			"Yumma CSS is not set up here, so these components render unstyled.",
			...lines,
			"",
			`  ${c.cyan(DOCS)}`,
		].join("\n"),
	);
}
