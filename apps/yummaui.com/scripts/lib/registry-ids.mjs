import { readdirSync } from "node:fs";
import { basename } from "node:path";
import { COMPONENT_PAGES } from "../../src/utils/component-pages.mjs";

/** Every page's slug, the MDX files & the component rows, longest first. */
export function pageSlugs(contentDir) {
	return [
		...readdirSync(contentDir)
			.filter((file) => file.endsWith(".mdx"))
			.map((file) => basename(file, ".mdx")),
		...COMPONENT_PAGES.map((page) => page.slug),
	].sort((a, b) => b.length - a.length);
}

export function splitId(id, slugs) {
	const slug = slugs.find((s) => id === s || id.startsWith(`${s}-`));
	if (!slug) return { component: id, variant: "base", orphan: true };
	return {
		component: slug,
		variant: id === slug ? "base" : id.slice(slug.length + 1),
		orphan: false,
	};
}
