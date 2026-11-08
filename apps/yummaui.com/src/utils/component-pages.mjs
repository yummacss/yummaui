// one row per component page, rendered by the page route (the notes, "Component rows")

/**
 * @typedef {object} ComponentPage
 * @property {string} slug The address, `/components/<slug>`, and the registry id.
 * @property {string} title
 * @property {string} description
 * @property {boolean | string} [primitive] The Base UI part it builds on: `true` for the one sharing its slug.
 * @property {boolean} [resizable] The preview drags narrower, for a whole screen region.
 * @property {string} [since] The release that first ships it, `0.10`; the newest one listed marks its pages new.
 */

/** @type {ComponentPage[]} */
export const COMPONENT_PAGES = [
	{
		slug: "accordion",
		title: "Accordion",
		description:
			"Expand & collapse content sections vertically, built on Base UI.",
		primitive: true,
	},
	{
		slug: "activity-heatmap",
		since: "0.10",
		title: "Activity Heatmap",
		description:
			"Show a year of daily counts as a grid of days, shaded by how much happened.",
	},
	{
		slug: "activity-timeline",
		since: "0.10",
		title: "Activity Timeline",
		description:
			"List events down a line, each on a raised marker with when it happened.",
	},
	{
		slug: "alert-dialog",
		title: "Alert Dialog",
		description:
			"Display urgent confirmation dialogs over your application, built on Base UI.",
		primitive: true,
	},
	{
		slug: "autocomplete",
		title: "Autocomplete",
		description: "Display suggestions as users type, built on Base UI.",
		primitive: true,
	},
	{
		slug: "avatar-stack",
		title: "Avatar Stack",
		description: "Overlap avatars into a single group.",
	},
	{
		slug: "avatar",
		title: "Avatar",
		description: "Display user profile images & fallbacks, built on Base UI.",
		primitive: true,
	},
	{
		slug: "badge",
		title: "Badge",
		description: "Highlight status, count, or label information.",
	},
	{
		slug: "breadcrumb",
		title: "Breadcrumb",
		description: "Show navigation hierarchy & current location.",
	},
	{
		slug: "button-group",
		title: "Button Group",
		description: "Join related buttons into a single control.",
	},
	{
		slug: "button",
		title: "Button",
		description: "Trigger actions with a single click, built on Base UI.",
		primitive: true,
	},
	{
		slug: "checkbox-group",
		title: "Checkbox Group",
		description:
			"Group checkboxes, with an optional parent that checks them all.",
	},
	{
		slug: "checkbox",
		title: "Checkbox",
		description: "Select multiple options from a list, built on Base UI.",
		primitive: true,
	},
	{
		slug: "color-picker",
		since: "0.10",
		title: "Color Picker",
		description: "Pick a color by hue, shade or hex, built on Base UI.",
	},
	{
		slug: "combobox",
		title: "Combobox",
		description:
			"Combine text input with dropdown selection, built on Base UI.",
		primitive: true,
	},
	{
		slug: "context-menu",
		title: "Context Menu",
		description: "Display contextual actions on right-click, built on Base UI.",
		primitive: true,
	},
	{
		slug: "currency-input",
		since: "0.10",
		title: "Currency Input",
		description:
			"Enter an amount with its currency, picked from a list in the field, built on Base UI.",
		primitive: "number-field",
	},
	{
		slug: "dialog",
		title: "Dialog",
		description:
			"Display modal dialogs over your application, built on Base UI.",
		primitive: true,
	},
	{
		slug: "drawer",
		title: "Drawer",
		description:
			"Slide a panel in from an edge of the screen & swipe it away, built on Base UI.",
		primitive: true,
	},
	{
		slug: "empty-state",
		title: "Empty State",
		description: "Communicate when there is nothing to show.",
	},
	{
		slug: "expanding-input",
		since: "0.10",
		title: "Expanding Input",
		description:
			"Open a button into a field where it sits, the button riding along as its submit.",
	},
	{
		slug: "field",
		title: "Field",
		description: "Capture user text input, built on Base UI.",
		primitive: true,
	},
	{
		slug: "file-tree",
		title: "File Tree",
		description:
			"Browse folders & files from a list of paths, opening folder by folder, built on Base UI.",
		primitive: true,
	},
	{
		slug: "file-upload",
		title: "File Upload",
		description: "Upload files with drag & drop.",
	},
	{
		slug: "gauge",
		since: "0.10",
		title: "Gauge",
		description:
			"Show a value on a fixed range as a half-circle arc, with thresholds, built on Base UI.",
		primitive: true,
	},
	{
		slug: "inline-icon-heading",
		title: "Inline Icon Heading",
		description:
			"A centered heading whose key words each sit in a chip with their icon.",
		resizable: true,
	},
	{
		slug: "keypad",
		since: "0.10",
		title: "Keypad",
		description:
			"Enter a PIN or an amount on raised digit keys, or type it on the keyboard.",
	},
	{
		slug: "code-block",
		since: "0.10",
		title: "Code Block",
		description:
			"Show code with a file name or tabs, a copy button & marked lines.",
	},
	{
		slug: "kbd",
		title: "Kbd",
		description: "Show a keyboard shortcut as keycaps in running text.",
	},
	{
		slug: "menu",
		title: "Menu",
		description: "Display a list of actions or options, built on Base UI.",
		primitive: true,
	},
	{
		slug: "menubar",
		title: "Menubar",
		description: "Navigate through multiple dropdown menus, built on Base UI.",
		primitive: true,
	},
	{
		slug: "meter",
		title: "Meter",
		description:
			"Show how much of something is used, whole or split into shares, built on Base UI.",
		primitive: true,
	},
	{
		slug: "navigation-menu",
		title: "Navigation Menu",
		description:
			"Open panels of links from a bar, sliding between them as you move across, built on Base UI.",
		primitive: true,
	},
	{
		slug: "number-field",
		title: "Number Field",
		description:
			"Capture numeric input with increment & decrement controls, built on Base UI.",
		primitive: true,
	},
	{
		slug: "onboarding",
		title: "Onboarding",
		description: "Guide users through multi-step flows.",
	},
	{
		slug: "otp-field",
		title: "OTP Field",
		description:
			"Enter a one-time code one character at a time, built on Base UI.",
		primitive: true,
	},
	{
		slug: "popover",
		title: "Popover",
		description:
			"Display floating content anchored to a trigger, built on Base UI.",
		primitive: true,
	},
	{
		slug: "preview-card",
		title: "Preview Card",
		description: "Preview content in a card layout, built on Base UI.",
		primitive: true,
	},
	{
		slug: "progress-timeline",
		since: "0.10",
		title: "Progress Timeline",
		description:
			"Show steps down a line as done, in progress or next, with each state written out.",
	},
	{
		slug: "progress",
		title: "Progress",
		description: "Show task completion progress, built on Base UI.",
		primitive: true,
	},
	{
		slug: "radio",
		title: "Radio",
		description: "Select a single option from a group, built on Base UI.",
		primitive: true,
	},
	{
		slug: "rating",
		title: "Rating",
		description: "Capture a star rating.",
	},
	{
		slug: "scroll-area",
		title: "Scroll Area",
		description:
			"Scroll long content inside a card or panel, with a thin scrollbar that shows while you scroll, built on Base UI.",
		primitive: true,
	},
	{
		slug: "select",
		title: "Select",
		description: "Choose from a dropdown list of options, built on Base UI.",
		primitive: true,
	},
	{
		slug: "separator",
		title: "Separator",
		description: "Divide content with visual separators, built on Base UI.",
		primitive: true,
	},
	{
		slug: "skeleton",
		title: "Skeleton",
		description: "Show a placeholder while content loads.",
	},
	{
		slug: "slider",
		title: "Slider",
		description: "Select values by dragging a handle, built on Base UI.",
		primitive: true,
	},
	{
		slug: "storage-bar",
		title: "Storage Bar",
		description:
			"Show how full a disk is & what fills it, with the total counting up, built on Base UI.",
		primitive: true,
	},
	{
		slug: "switch",
		title: "Switch",
		description: "Toggle between 2 states, built on Base UI.",
		primitive: true,
	},
	{
		slug: "tabs",
		title: "Tabs",
		description: "Organize content into switchable panels, built on Base UI.",
		primitive: true,
	},
	{
		slug: "textarea",
		title: "Textarea",
		description: "A multi-line text field, built on Base UI.",
		primitive: "field",
	},
	{
		slug: "theme-switcher",
		title: "Theme Switcher",
		description:
			"Pick light, dark or the system's theme in one control, built on Base UI.",
		primitive: true,
	},
	{
		slug: "toast",
		title: "Toast",
		description:
			"Confirm what just happened in a brief message, with an action to undo it, built on Base UI.",
		primitive: true,
	},
	{
		slug: "toggle-group",
		title: "Toggle Group",
		description: "Group toggles into a single control.",
	},
	{
		slug: "toggle",
		title: "Toggle",
		description:
			"Switch between on & off states, and group them with single or multiple selection, built on Base UI.",
		primitive: true,
	},
	{
		slug: "toolbar",
		title: "Toolbar",
		description: "Group related action buttons together, built on Base UI.",
		primitive: true,
	},
	{
		slug: "tooltip",
		title: "Tooltip",
		description: "Show contextual hints on hover or focus, built on Base UI.",
		primitive: true,
	},
	{
		slug: "treemap",
		since: "0.10",
		title: "Treemap",
		description:
			"Show shares of a whole as tiles sized by value, shaded in steps of the accent.",
	},
];

/** Every component page's body: the stage, which the UI shell renders. */
export const COMPONENT_BODY = "<ComponentPlayground />\n";

/** The page as an MDX file would hold it, for search, the `.md` route & the copy tests. */
export function componentSource(page) {
	return [
		"---",
		`title: ${page.title}`,
		`description: ${JSON.stringify(page.description)}`,
		"playground: true",
		"---",
		"",
		COMPONENT_BODY,
	].join("\n");
}

/** The newest release any row names, whose pages the sidebar marks new. */
export const NEWEST = COMPONENT_PAGES.map((page) => page.since)
	.filter(Boolean)
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
	.at(-1);
