export interface SidebarSection {
	title: string;
	items: string[];
}

/** The guides, under `/docs`; every other page is a component under `/components`. */
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
			"fieldset",
			"form",
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
			"alert",
			"avatar",
			"avatar-stack",
			"badge",
			"breadcrumb",
			"card",
			"code-block",
			"inline-icon-heading",
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
		items: [
			"activity-heatmap",
			"bar-chart",
			"donut-chart",
			"gauge",
			"line-chart",
			"sparkline",
			"stat",
			"treemap",
		],
	},
	{
		title: "Interactive",
		items: ["button", "button-group", "context-menu", "menu", "menubar"],
	},
	{
		title: "Navigation",
		items: ["file-tree", "navigation-menu", "pagination", "tabs", "toolbar"],
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
];
