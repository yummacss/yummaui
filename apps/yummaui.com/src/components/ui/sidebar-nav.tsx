"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Glide from "@/components/ui/glide";
import Scroller from "@/components/ui/scroller";
import { Point, Sparkles } from "@/icons";
import { useReveal } from "@/utils/reveal";
import type { NavSection } from "./mobile-sheet";
import ProductLinks from "./product-links";

interface Props {
	sections: NavSection[];
}

export default function SidebarNav({ sections }: Props) {
	const pathname = usePathname();
	const { viewport, active } = useReveal(pathname);

	return (
		<aside className="d:none @lg:d:b @lg:gc-s:3 @lg:pt:20">
			<Scroller
				viewportRef={viewport}
				className="p:st t:20 max-h:calc(100dvh-5rem)"
				viewportClassName="p:r d:f fd:c g:8 mx:-3 px:3 pb:12"
			>
				<Glide
					selector="[data-glide]"
					at={pathname}
					className="bg:press br:9999"
				/>
				<ProductLinks
					heading="ff:system mb:3 c:silver-8 fs:xs fw:600 ls:2 tt:u"
					list="d:f fd:c g:2"
					link="p:r d:if ai:c g:3 fs:sm fv:oc:ink fv:oo:2 fv:ow:2"
				/>
				{sections.map((section) => {
					const fresh = section.items.filter((item) => item.isNew).length;
					return (
						<div key={section.title} className="d:f fd:c g:3">
							<h3 className="d:f ai:c g:2 ff:system c:silver-8 fs:xs fw:600 ls:2 tt:u">
								{section.title}
								{fresh > 0 && (
									<span className="d:if ai:c g:1 c:ink/70 fw:500 ls:0 tt:none">
										<Point aria-hidden className="w:2 h:2" />
										{fresh} new
									</span>
								)}
							</h3>
							<ul className="d:f fd:c g:2">
								{section.items.map((item) => {
									const isActive = pathname === item.href;
									return (
										<li
											key={item.href}
											ref={isActive ? active : undefined}
											className="d:f ai:c g:3"
										>
											<Link
												href={item.href}
												aria-current={isActive ? "page" : undefined}
												data-glide={isActive || undefined}
												className={`p:r d:if ai:c g:3 px:3 py:1 my:-1 ml:-3 br:9999 fs:sm fv:oc:ink fv:oo:2 fv:ow:2 ${isActive ? "c:ink fw:500" : "c:ink/70 h:c:accent"}`}
											>
												{item.title}
												{item.isNew && (
													<>
														<Sparkles
															aria-hidden
															className="w:4 h:4 fs:0 c:ink/60"
														/>
														<span className="p:a w:px h:px o:h">, new</span>
													</>
												)}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}
			</Scroller>
		</aside>
	);
}
