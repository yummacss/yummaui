import { NEWEST } from "@/utils/component-pages.mjs";
import { uis } from "@/utils/uis";
import { sidebarConfig } from "@/config/sidebar";
import { pagePath } from "@/utils/hosts";
import type { NavSection } from "./mobile-sheet";
import SidebarNav from "./sidebar-nav";

function page(slug: string) {
	const ui = uis.find((c) => c._meta.path === slug);
	const since = ui && "since" in ui ? ui.since : undefined;
	return {
		href: pagePath(slug),
		title: ui?.title ?? slug,
		isNew: Boolean(since) && since === NEWEST,
	};
}

/** The sidebar's sections, built on the server so the client gets titles, not the collection. */
export function menu(): NavSection[] {
	return sidebarConfig.map((section) => ({
		title: section.title,
		items: section.items.map(page),
	}));
}

export default function Sidebar() {
	return <SidebarNav sections={menu()} />;
}
