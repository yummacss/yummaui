"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import {
	PlaygroundProvider,
	StaticPlayground,
} from "@/components/playground/context";
import PlaygroundRail from "@/components/playground/rail";
import ComponentPlayground from "@/components/playground/stage";
import TableOfContents from "@/components/ui/toc";
import { registryMeta } from "@/registry";
import type { Primitives } from "@/utils/primitive";

interface Props {
	children: ReactNode;
	/** The server-rendered sidebar, so the collections stay out of this client component. */
	sidebar: ReactNode;
	/** Slugs of the pages with `playground: true`. */
	playgrounds: string[];
	/** Slugs of the pages with `block: true`, which have no rail. */
	blocks: string[];
	primitives: Primitives;
}

export default function UIShell({
	children,
	sidebar,
	playgrounds,
	blocks,
	primitives,
}: Props) {
	const pathname = usePathname();
	const slug = (pathname || "")
		.replace(/^\/(?:components|docs)\//, "")
		.replace(/\/$/, "");
	const playground =
		playgrounds.includes(slug) && Object.hasOwn(registryMeta, slug)
			? slug
			: null;

	const block = playground !== null && blocks.includes(playground);

	const grid = (
		<div className="d:g gtc:1 g:8 @lg:gtc:12">
			{sidebar}

			<div
				className={`d:f fd:c ${
					block
						? "pt:12 pb:16 @lg:gc-s:9"
						: playground
							? "pt:12 @lg:gc-s:6 @lg:h:dvh @lg:pb:6 @lg:o:h"
							: "pt:12 @lg:gc-s:6"
				}`}
			>
				<article className="d:f fd:c f:1 min-h:0">
					{children}
					{playground && <ComponentPlayground block={block} />}
					{block && <PlaygroundRail primitives={primitives} inline />}
				</article>
			</div>

			{block ? null : playground ? (
				<PlaygroundRail primitives={primitives} />
			) : (
				<TableOfContents />
			)}
		</div>
	);

	if (!playground) return grid;

	return (
		<Suspense
			fallback={<StaticPlayground id={playground}>{grid}</StaticPlayground>}
		>
			<PlaygroundProvider id={playground}>{grid}</PlaygroundProvider>
		</Suspense>
	);
}
