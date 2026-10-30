import { uis } from "@/utils/uis";
import { sidebarConfig } from "@/config/sidebar";
import { pagePath } from "@/utils/hosts";
import type { NavSection } from "./mobile-sheet";
import SidebarNav from "./sidebar-nav";

function page(slug: string) {
	const ui = uis.find((c) => c._meta.path === slug);
	return { href: pagePath(slug), title: ui?.title ?? slug, since: ui?.badge };
}

export type Area = "components" | "blocks";

/** The sidebar's sections for one area, built on the server so the client gets titles and badges, not the collection. */
export function menu(area: Area = "components"): NavSection[] {
	return sidebarConfig
		.filter((section) => (section.area ?? "components") === area)
		.map((section) => ({
			title: section.title,
			items: section.items.map(page),
		}));
}

// where each area's link lands: its first page
export const AREAS = (["components", "blocks"] as const).map((area) => ({
	area,
	label: area === "blocks" ? "Blocks" : "Components",
	href: menu(area)[area === "blocks" ? 0 : 1]?.items[0]?.href ?? "/",
}));

export default function Sidebar({ area = "components" }: { area?: Area }) {
	return <SidebarNav sections={menu(area)} areas={AREAS} current={area} />;
}
