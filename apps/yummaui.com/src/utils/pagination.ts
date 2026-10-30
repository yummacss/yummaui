import { uis } from "@/utils/uis";
import { BLOCKS, sidebarConfig } from "@/config/sidebar";

function inSidebarOrder<T extends { _meta: { path: string }; title: string }>(
	docs: T[],
	slugs: string[],
): T[] {
	const byPath = new Map(docs.map((doc) => [doc._meta.path, doc]));
	return slugs
		.map((slug) => byPath.get(slug))
		.filter((doc): doc is T => doc !== undefined);
}

const sorted = inSidebarOrder(
	uis,
	sidebarConfig.flatMap((section) => section.items),
);

export function getNavigation(slug: string): {
	previous: { slug: string; title: string } | null;
	next: { slug: string; title: string } | null;
} {
	// the arrows stay in their area: blocks lead to blocks, components to components
	const block = BLOCKS.includes(slug);
	const area = sorted.filter((p) => BLOCKS.includes(p._meta.path) === block);
	const currentIndex = area.findIndex((p) => p._meta.path === slug);
	if (currentIndex === -1) return { previous: null, next: null };
	return {
		previous:
			currentIndex > 0
				? {
						slug: area[currentIndex - 1]._meta.path,
						title: area[currentIndex - 1].title,
					}
				: null,
		next:
			currentIndex < area.length - 1
				? {
						slug: area[currentIndex + 1]._meta.path,
						title: area[currentIndex + 1].title,
					}
				: null,
	};
}
