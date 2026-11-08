export interface SidebarSection {
	title: string;
	items: string[];
	/** Its pages are blocks, under `/blocks`. */
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
			"color-picker",
			"combobox",
			"currency-input",
			"expanding-input",
			"file-upload",
			"field",
			"keypad",
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
			"activity-timeline",
			"avatar",
			"avatar-stack",
			"badge",
			"breadcrumb",
			"code-block",
			"kbd",
			"meter",
			"preview-card",
			"progress-timeline",
			"progress",
			"scroll-area",
			"separator",
		],
	},
	{
		title: "Charts",
		items: ["activity-heatmap", "gauge", "treemap"],
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
];

/** Every block, under `/blocks`. */
export const BLOCKS = sidebarConfig
	.filter((section) => section.area === "blocks")
	.flatMap((section) => section.items);
