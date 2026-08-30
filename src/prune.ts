import { type Dirent, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import type { RegistryIndex } from "./registry";

/**
 * Finding component files nothing in the project reaches.
 *
 * The obvious test - "does anything import this file" - is wrong here, because
 * blocks import the component they are built from: an unused
 * `button-group-pill` imports `button`, so `button` looks used. What matters is
 * **reachability from outside `componentsDir`**, which drops a whole unused
 * chain rather than only its head.
 *
 * Every judgement call below leans towards keeping a file. A file kept by
 * mistake costs nothing; a file deleted by mistake breaks a build.
 */

/** Scanned for imports. Anything that can name a module. */
const SOURCE_EXTENSIONS = new Set([
	".astro",
	".cjs",
	".cts",
	".js",
	".jsx",
	".md",
	".mdx",
	".mjs",
	".mts",
	".svelte",
	".ts",
	".tsx",
	".vue",
]);

/** Stripped when comparing a specifier to a file on disk. */
const MODULE_EXTENSIONS = [
	".tsx",
	".ts",
	".jsx",
	".js",
	".mjs",
	".cjs",
	".mts",
	".cts",
];

/**
 * Never walked. Build output holds compiled copies of imports that are already
 * in the source, so skipping it cannot lose a reference - unlike, say,
 * `.storybook`, which holds real ones and is deliberately not on this list.
 */
const SKIP_DIRS = new Set([
	".cache",
	".git",
	".next",
	".output",
	".svelte-kit",
	".turbo",
	".vercel",
	"build",
	"coverage",
	"dist",
	"node_modules",
	"out",
]);

/**
 * Module specifiers, from every form that can name one.
 *
 * These are anchored on the keyword rather than pairing quotes across the
 * file, so one odd string cannot desync the rest of the pass. A specifier
 * written inside a comment or a string is still collected, which counts as a
 * use and keeps the file - the safe direction.
 */
const SPECIFIER_PATTERNS = [
	/\bfrom\s*["']([^"'\n]+)["']/g,
	/\bimport\s*\(\s*["']([^"'\n]+)["']/g,
	/\brequire\s*\(\s*["']([^"'\n]+)["']/g,
	/\bimport\s+["']([^"'\n]+)["']/g,
];

export function extractSpecifiers(source: string): string[] {
	const found = new Set<string>();
	for (const pattern of SPECIFIER_PATTERNS) {
		pattern.lastIndex = 0;
		for (const match of source.matchAll(pattern)) {
			if (match[1]) found.add(match[1]);
		}
	}
	return [...found];
}

/**
 * A module specifier built at runtime - `import(\`./${name}\`)` - names a file
 * this cannot know. There is no safe answer, so it is counted and reported
 * rather than guessed at.
 */
const COMPUTED_SPECIFIER = /\b(?:from|import\s*\(|require\s*\()\s*`/;

export function hasComputedSpecifier(source: string): boolean {
	return COMPUTED_SPECIFIER.test(source);
}

/** Posix separators and no extension, so paths from either OS compare equal. */
function normalizeKey(path: string): string {
	const posix = path.split(sep).join("/").replace(/^\.\//, "");
	for (const ext of MODULE_EXTENSIONS) {
		if (posix.endsWith(ext)) return posix.slice(0, -ext.length);
	}
	return posix;
}

export interface ProjectShape {
	root: string;
	componentsDir: string;
	/** The full alias prefix `init` writes, e.g. `@/components/ui`. */
	alias: string | null;
}

/**
 * What a specifier points at inside `componentsDir`, as a key comparable with
 * `componentKey`, or null when it points anywhere else.
 *
 * `alias` is the whole prefix rather than just `@`, which is what `init`
 * stores, so no tsconfig `paths` resolution is needed to recognise one.
 */
export function resolveToComponent(
	specifier: string,
	fromFile: string,
	shape: ProjectShape,
): string | null {
	const dir = resolve(shape.root, shape.componentsDir);

	if (shape.alias) {
		const prefix = `${shape.alias}/`;
		if (specifier === shape.alias) return "index";
		if (specifier.startsWith(prefix)) {
			const rest = specifier.slice(prefix.length);
			return rest ? normalizeKey(rest) : "index";
		}
	}

	if (!specifier.startsWith(".")) return null;

	const target = resolve(dirname(fromFile), specifier);
	const rel = relative(dir, target);
	// `""` is the directory itself, which resolves to its index file.
	if (!rel) return "index";
	if (rel === ".." || rel.startsWith(`..${sep}`)) return null;
	return normalizeKey(rel);
}

/** A file's key relative to `componentsDir`, matching `resolveToComponent`. */
export function componentKey(file: string, shape: ProjectShape): string {
	return normalizeKey(relative(resolve(shape.root, shape.componentsDir), file));
}

function walk(dir: string, skip: string, out: string[] = []): string[] {
	let entries: Dirent[];
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		// An unreadable directory is not a reason to stop, and it cannot hold a
		// reference we would otherwise have seen.
		return out;
	}
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name) || path === skip) continue;
			walk(path, skip, out);
		} else if (entry.isFile()) {
			const dot = entry.name.lastIndexOf(".");
			if (dot > 0 && SOURCE_EXTENSIONS.has(entry.name.slice(dot)))
				out.push(path);
		}
	}
	return out;
}

/**
 * Every file name `add` could have written, so `prune` can only ever delete
 * files it put there. Anything else under `componentsDir` is the project's own
 * and is left alone - and, being kept, is treated as a root below.
 *
 * Stays in step with `targetFileName` in `commands/add.ts`; a test asserts it.
 */
export function installableFileNames(index: RegistryIndex): Set<string> {
	const names = new Set<string>();
	for (const component of index.components)
		names.add(`${component.component}.tsx`);
	for (const block of index.blocks) names.add(`${block.id}.tsx`);
	return names;
}

export interface PruneResult {
	/** Absolute paths safe to delete, sorted. */
	unused: string[];
	/** Installed files something outside `componentsDir` still reaches. */
	kept: number;
	/** Files under `componentsDir` that `add` did not write, so never candidates. */
	foreign: number;
	/** Source files scanned for references. */
	scanned: number;
	/** Files whose imports are built at runtime, so this could not read them. */
	computed: string[];
}

/**
 * Which installed component files nothing reaches.
 *
 * Roots are every file outside `componentsDir`, **plus** every file inside it
 * that is not a candidate. That second half is what stops a project's own
 * `components/ui/my-card.tsx` from having `button` deleted out from under it:
 * whatever survives has to keep what it imports.
 */
export function findUnused(
	shape: ProjectShape,
	installable: Set<string>,
): PruneResult {
	const dir = resolve(shape.root, shape.componentsDir);
	const inside = walk(dir, "");
	const outside = walk(shape.root, dir);

	const candidates = new Map<string, string>();
	const roots = new Set<string>();
	const edges = new Map<string, Set<string>>();
	const computed: string[] = [];

	for (const file of inside) {
		const key = componentKey(file, shape);
		// A candidate is a file `add` writes: an installable name, directly in
		// `componentsDir`. A nested one of the same name is the project's own.
		if (
			file.endsWith(".tsx") &&
			!key.includes("/") &&
			installable.has(`${key}.tsx`)
		) {
			candidates.set(key, file);
		} else {
			roots.add(key);
		}
		const source = readFileSync(file, "utf8");
		if (hasComputedSpecifier(source)) computed.push(file);
		const out = new Set<string>();
		for (const specifier of extractSpecifiers(source)) {
			const hit = resolveToComponent(specifier, file, shape);
			if (hit) out.add(hit);
		}
		edges.set(key, out);
	}

	for (const file of outside) {
		const source = readFileSync(file, "utf8");
		if (hasComputedSpecifier(source)) computed.push(file);
		for (const specifier of extractSpecifiers(source)) {
			const hit = resolveToComponent(specifier, file, shape);
			if (hit) roots.add(hit);
		}
	}

	const reached = new Set<string>();
	const queue = [...roots];
	while (queue.length > 0) {
		const key = queue.pop() as string;
		if (reached.has(key)) continue;
		reached.add(key);
		for (const next of edges.get(key) ?? []) {
			if (!reached.has(next)) queue.push(next);
		}
	}

	const unused: string[] = [];
	for (const [key, file] of candidates) {
		if (!reached.has(key)) unused.push(file);
	}

	return {
		unused: unused.sort(),
		kept: candidates.size - unused.length,
		foreign: inside.length - candidates.size,
		scanned: inside.length + outside.length,
		computed,
	};
}
