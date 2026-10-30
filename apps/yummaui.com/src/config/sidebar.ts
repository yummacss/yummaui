export interface SidebarSection {
	title: string;
	items: string[];
	/** Blocks live under `/blocks` with a sidebar of their own. */
	area?: "blocks";
}

/** The guides, under `/docs`; blocks are under `/blocks`; every other page is a component under `/components`. */
export const GUIDES = ["installation", "configuration", "customization"];

export const sidebarConfig: SidebarSection[] = [
	{
		title: "Get Started",
		items: GUIDES,
	},
	{
		title: "Forms",
		items: [
			"autocomplete",
			"checkbox",
			"checkbox-group",
			"combobox",
			"file-upload",
			"field",
			"number-field",
			"otp-field",
			"radio",
			"select",
			"slider",
			"switch",
			"textarea",
			"toggle",
			"toggle-group",
		],
	},
	{
		title: "Display",
		items: [
			"accordion",
			"avatar",
			"avatar-stack",
			"badge",
			"breadcrumb",
			"kbd",
			"meter",
			"preview-card",
			"progress",
			"scroll-area",
			"separator",
		],
	},
	{
		title: "Interactive",
		items: ["button", "button-group", "context-menu", "menu", "menubar"],
	},
	{
		title: "Navigation",
		items: ["file-tree", "navigation-menu", "tabs", "toolbar"],
	},
	{
		title: "Overlays",
		items: ["alert-dialog", "dialog", "drawer", "popover", "toast", "tooltip"],
	},
	{
		title: "Application UI",
		items: [
			"empty-state",
			"onboarding",
			"rating",
			"skeleton",
			"storage-bar",
			"theme-switcher",
		],
	},
	{
		title: "Marketing",
		items: ["inline-icon-heading"],
		area: "blocks",
	},
	{
		title: "Navigation",
		items: ["sidebar"],
		area: "blocks",
	},
	{
		title: "Authentication",
		items: ["sign-in"],
		area: "blocks",
	},
];

/** Every block, under `/blocks`. */
export const BLOCKS = sidebarConfig
	.filter((section) => section.area === "blocks")
	.flatMap((section) => section.items);
