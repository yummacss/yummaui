import { allUis } from "content-collections";
import { registryMeta } from "@/registry";
import { COMPONENT_BODY, COMPONENT_PAGES } from "@/utils/component-pages.mjs";
import { extractReference } from "@/utils/search-reference";

/** Every page: the MDX files, then the component pages the rows hold. */
export const uis = [
	...allUis.map((ui) => ({ ...ui, _meta: { path: ui._meta.path } })),
	...COMPONENT_PAGES.map((page) => ({
		title: page.title,
		description: page.description,
		primitive: page.primitive,
		playground: true,
		resizable: page.resizable,
		content: COMPONENT_BODY,
		slug: page.slug,
		_meta: { path: page.slug },
		// the UI shell renders the stage, so the page itself has no body
		mdx: () => null,
		wordCount: 1,
		reference: extractReference(COMPONENT_BODY),
		props: (registryMeta[page.slug]?.props ?? []).map((prop) => prop.name),
	})),
];

export type Ui = (typeof uis)[number];
