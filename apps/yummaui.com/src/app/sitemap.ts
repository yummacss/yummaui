import { existsSync, statSync } from "node:fs";
import { uis } from "@/utils/uis";
import type { MetadataRoute } from "next";
import { pagePath, UI_ORIGIN } from "@/utils/hosts";

// a component row has no file of its own, so its component stands in
const sourceOf = (slug: string) =>
	existsSync(`src/content/ui/${slug}.mdx`)
		? `src/content/ui/${slug}.mdx`
		: `src/registry/ui/${slug}.tsx`;

export default function sitemap(): MetadataRoute.Sitemap {
	return uis.map((ui) => ({
		url: `${UI_ORIGIN}${pagePath(ui._meta.path)}`,
		lastModified: statSync(sourceOf(ui._meta.path)).mtime,
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));
}
