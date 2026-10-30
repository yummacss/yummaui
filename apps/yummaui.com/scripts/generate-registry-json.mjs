#!/usr/bin/env node

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { targetPath } from "../src/utils/install.mjs";
import { ROLES } from "../src/utils/roles.mjs";
import { applyShape, DEFAULT_SHAPE, SHAPES } from "../src/utils/shapes.mjs";
import config from "../yummacss.config.mjs";
import { COMPONENT_PAGES } from "../src/utils/component-pages.mjs";
import { pageSlugs, splitId } from "./lib/registry-ids.mjs";

const cwd = process.cwd();
const uiDir = join(cwd, "src/registry/ui");
const metaDir = join(cwd, "src/registry/meta");
const contentDir = join(cwd, "src/content/ui");
const outDir = join(cwd, "public/ui/registry");

const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
const versions = { ...pkg.dependencies, ...pkg.devDependencies };

const IMPLIED = new Set(["react", "react-dom"]);

function packageName(specifier) {
	if (specifier.startsWith(".") || specifier.startsWith("@/")) return null;
	const parts = specifier.split("/");
	return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function dependenciesOf(source) {
	const found = new Set();
	for (const [, spec] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
		const name = packageName(spec);
		if (!name || IMPLIED.has(name)) continue;
		found.add(name);
	}

	return [...found]
		.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
		.map((name) => ({
			name,
			version: versions[name] ?? "latest",
		}));
}

function registryDepsOf(source, id, allIds) {
	const found = new Set();
	for (const [, spec] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
		if (!spec.startsWith("./")) continue;
		const dep = spec.slice(2);
		if (dep !== id && allIds.has(dep)) found.add(dep);
	}
	return [...found].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

// the states, easings, keyframes, colors and shadows the components use, for yummaui to add to a project's config
function themeOf(sources) {
	const {
		states = {},
		easings = {},
		keyframes = {},
		boxShadow = {},
	} = config.theme ?? {};
	const used = (pattern) =>
		new Set(
			sources.flatMap((source) =>
				[...source.matchAll(pattern)].map(([, name]) => name),
			),
		);
	const pick = (table, names) =>
		Object.fromEntries(
			Object.entries(table).filter(([name]) => names.has(name)),
		);
	return {
		// a state can lead a class or follow another one: opening:from-left:ttx:-12
		states: Object.fromEntries(
			Object.entries(states).filter(([name]) =>
				sources.some((source) =>
					new RegExp(`(?<![\\w@-])${name}:[a-z@-]`).test(source),
				),
			),
		),
		easings: pick(easings, used(/\b(?:ttf|atf):([a-z][a-z0-9-]*)/g)),
		keyframes: pick(keyframes, used(/\ban:([a-z]+)/g)),
		boxShadow: pick(boxShadow, used(/\bbs-o:([a-z][a-z0-9-]*)/g)),
		colors: pick(
			ROLES,
			used(/:([a-z][a-z-]*?)(?:-\d+)?(?:\/\d+)?(?=[\s"'`]|$)/g),
		),
	};
}

const slugs = pageSlugs(contentDir);

function metaOf(id) {
	const file = join(metaDir, `${id}.json`);
	if (!existsSync(file)) return null;
	try {
		return JSON.parse(readFileSync(file, "utf8"));
	} catch (error) {
		throw new Error(`Invalid registry meta for "${id}": ${error.message}`);
	}
}

function titleOf(slug) {
	const row = COMPONENT_PAGES.find((page) => page.slug === slug);
	if (row) return row.title;
	const raw = readFileSync(join(contentDir, `${slug}.mdx`), "utf8");
	return raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? slug;
}

const ids = readdirSync(uiDir)
	.filter((f) => f.endsWith(".tsx"))
	.map((f) => basename(f, ".tsx"))
	.sort();

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const idSet = new Set(ids);
const components = new Map();
const entries = new Map();
let orphans = 0;

for (const id of ids) {
	const { component, variant, orphan } = splitId(id, slugs);
	if (orphan) orphans++;

	const source = readFileSync(join(uiDir, `${id}.tsx`), "utf8");

	const kind = variant === "base" ? "component" : "example";

	const entry = {
		id,
		component,
		variant,
		kind,
		...metaOf(id),
		useClient: /^\s*["']use client["']/.test(source),
		dependencies: dependenciesOf(source),
		registryDeps: registryDepsOf(source, id, idSet),
		files: [
			{
				path: `${id}.tsx`,
				target: targetPath(id),
				content: source,
			},
		],
	};

	entries.set(id, { entry, source });

	if (!orphan) {
		if (!components.has(component)) {
			components.set(component, {
				component,
				title: titleOf(component),
				base: null,
				fallback: null,
			});
		}
		const group = components.get(component);
		if (variant === "base") group.base = id;
		else if (!group.fallback) group.fallback = id;
	}
}

const index = [...components.values()]
	.sort((a, b) => a.component.localeCompare(b.component))
	.map(({ fallback, ...g }) => ({ ...g, base: g.base ?? fallback }));

// only what the index reaches: each component's base and what it depends on
const published = new Set();
const reach = (id) => {
	if (published.has(id)) return;
	published.add(id);
	for (const dep of entries.get(id).entry.registryDeps) reach(dep);
};
for (const group of index) if (group.base) reach(group.base);

for (const id of published) {
	const { entry, source } = entries.get(id);
	writeFileSync(
		join(outDir, `${id}.json`),
		`${JSON.stringify(entry, null, 2)}\n`,
	);

	// one folder per shape, so the CLI only swaps its base URL
	for (const shape of SHAPES) {
		const dir = join(outDir, shape);
		mkdirSync(dir, { recursive: true });
		const shaped = {
			...entry,
			files: [
				{
					...entry.files[0],
					// the default keeps each component's own, as the site does
					content: shape === DEFAULT_SHAPE ? source : applyShape(source, shape),
				},
			],
		};
		writeFileSync(
			join(dir, `${id}.json`),
			`${JSON.stringify(shaped, null, 2)}\n`,
		);
	}
}

writeFileSync(
	join(outDir, "index.json"),
	`${JSON.stringify(
		{
			components: index,
			theme: themeOf(
				ids.map((id) => readFileSync(join(uiDir, `${id}.tsx`), "utf8")),
			),
			generated: ids.length,
		},
		null,
		2,
	)}\n`,
);

const missingBase = index.filter((g) => !g.base).length;
const unpublished = ids.length - published.size;
console.log(
	`registry json: ${index.length} components, ${published.size} items (${unpublished} kept to the site), ${SHAPES.length} shape builds -> public/ui/registry/`,
);
if (orphans) console.log(`  ${orphans} file(s) match no /ui page`);
if (missingBase) console.log(`  ${missingBase} component(s) have no base`);
