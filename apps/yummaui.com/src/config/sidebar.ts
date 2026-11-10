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
			"image-cropper",
			"keypad",
			"number-field",
			"otp-field",
			"radio",
			"select",
			"signature-pad",
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
			"banner-alert",
			"breadcrumb",
			"card",
			"carousel",
			"code-block",
			"diff-viewer",
			"image-compare",
			"inline-icon-heading",
			"kbd",
			"lightbox",
			"marquee",
			"meter",
			"preview-card",
			"progress",
			"progress-timeline",
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
		title: "AI",
		items: [
			"message",
			"model-picker",
			"prompt-input",
			"reasoning",
			"streaming-text",
			"suggestions",
			"tool-call",
			"usage-meter",
		],
	},
	{
		title: "Interactive",
		items: [
			"account-menu",
			"button",
			"button-group",
			"context-menu",
			"kanban-board",
			"menu",
			"menubar",
			"resizable-panels",
			"sortable-list",
		],
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
