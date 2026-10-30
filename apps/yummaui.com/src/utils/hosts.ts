import { BLOCKS, GUIDES } from "../config/sidebar";

/** Where Yumma UI lives. */
export const UI_ORIGIN = "https://www.yummaui.com";

/** Where Yumma CSS lives. */
export const CSS_ORIGIN = "https://www.yummacss.com";

/** A page's address: a guide under `/docs`, a block under `/blocks`, a component under `/components`. */
export function pagePath(slug: string): string {
	if (GUIDES.includes(slug)) return `/docs/${slug}`;
	if (BLOCKS.includes(slug)) return `/blocks/${slug}`;
	return `/components/${slug}`;
}
