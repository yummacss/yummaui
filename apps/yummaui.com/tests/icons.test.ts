import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { exampleIconNames, rootDir } from "./helpers";

const DIRECT = /from\s+["']@tabler\/icons-react["']/;
const SHARED = /from\s+["']@\/icons["']/;

function sources(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) out.push(...sources(path));
		else if (/\.tsx?$/.test(entry)) out.push(path);
	}
	return out;
}

describe("icons", () => {
	const src = join(rootDir, "src");
	const registryDir = join(src, "registry/ui");
	const module = join(src, "icons.tsx");
	// renders the registry's demos, so it imports what the registry imports
	const demos = join(src, "utils/demo.tsx");

	const all = sources(src);
	const registry = all.filter((file) => file.startsWith(registryDir));
	const site = all.filter(
		(file) =>
			!file.startsWith(registryDir) && file !== module && file !== demos,
	);

	it("routes every site import through the module", () => {
		const direct = site
			.filter((file) => DIRECT.test(readFileSync(file, "utf8")))
			.map((file) => relative(rootDir, file));

		expect(direct).toEqual([]);
	});

	it("keeps the registry importing the package itself", () => {
		const shared = registry
			.filter((file) => SHARED.test(readFileSync(file, "utf8")))
			.map((file) => relative(rootDir, file));

		expect(shared).toEqual([]);
	});

	it("re-exports every icon the site asks for", () => {
		const exported = new Set(
			readFileSync(module, "utf8").matchAll(
				/^export const ([A-Z][A-Za-z0-9]*) = line\(/gm,
			),
		);
		const names = new Set([...exported].map((match) => match[1]));

		const wanted = new Set<string>();
		for (const file of site) {
			const source = readFileSync(file, "utf8");
			for (const [, block] of source.matchAll(
				/import\s*\{([^}]*)\}\s*from\s*["']@\/icons["']/g,
			)) {
				for (const name of block.split(",")) {
					const trimmed = name.trim();
					if (trimmed) wanted.add(trimmed);
				}
			}
		}

		expect([...wanted].filter((name) => !names.has(name))).toEqual([]);
		expect(wanted.size).toBeGreaterThan(10);
	});

	it("draws the registry and demos from Tabler alone", () => {
		const solar = [...registry, demos]
			.filter((file) => readFileSync(file, "utf8").includes("@solar-icons"))
			.map((file) => relative(rootDir, file));
		expect(solar).toEqual([]);
	});

	it("gives a component filled or outline objects, never both", () => {
		const mixed: string[] = [];
		for (const file of registry) {
			const source = readFileSync(file, "utf8");
			const block =
				source.match(/import \{([^}]*)\} from "@tabler\/icons-react"/)?.[1] ??
				"";
			const names = block.split(",").map((name) => name.trim());
			const filled = names.filter((name) => name.endsWith("Filled"));
			// marks (check, x, chevrons, plus, minus, search, selector) stay outline
			const objects = names.filter(
				(name) =>
					name &&
					!name.endsWith("Filled") &&
					!/^Icon(Check|X|Chevron\w+|Plus|Minus|Search|Selector|AlertTriangle)$/.test(
						name,
					),
			);
			if (filled.length && objects.length)
				mixed.push(`${relative(rootDir, file)}: ${objects.join(", ")}`);
		}
		expect(mixed).toEqual([]);
	});

	it("resolves every icon a schema names", () => {
		const known = exampleIconNames();
		const missing: string[] = [];
		for (const file of readdirSync(join(rootDir, "src/registry/meta"))) {
			const text = readFileSync(
				join(rootDir, "src/registry/meta", file),
				"utf8",
			);
			for (const [, name] of text.matchAll(
				/"(?:\$icon|exampleIcon)": "([A-Za-z0-9]+)"/g,
			)) {
				if (!known.has(name)) missing.push(`${file}: ${name}`);
			}
		}
		expect(missing).toEqual([]);
	});
});
