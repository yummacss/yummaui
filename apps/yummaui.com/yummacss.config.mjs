import { defineConfig } from "yummacss";
import { ROLES } from "./src/utils/roles.mjs";

export default defineConfig({
	source: ["./src/**/*.{ts,tsx,mdx,mjs}", "./src/registry/meta/*.json"],
	theme: {
		colors: {
			...ROLES,
			"accent-dim": { light: "#8892c2", dark: "#9aa5ef" },
			"diff-add": { light: "#2e7d5b", dark: "#a8e1ad" },
			"diff-remove": { light: "#a8372b", dark: "#e1a8a8" },
			accent: { light: "#4c5fc7", dark: "#bec6f2" },
			// indigo in both schemes, where accent turns pale in the dark
			brand: "#4c5fc7",
			border: { light: "#dde1eb", dark: "#232741" },
			code: { light: "#3e4a80", dark: "#dda2f6" },
			ink: { light: "#14171f", dark: "#ffffff" },
			hover: { light: "#eef0f6", dark: "#131521" },
			page: { light: "#f7f8fb", dark: "#151724" },
			press: { light: "#e5e8f0", dark: "#0f111b" },
			surface: { light: "#ffffff", dark: "#1a1d2e" },
			warning: { light: "#b4581a", dark: "#f0b27a" },
		},
		fonts: {
			body: '"iA Writer Quattro", sans-serif',
			display: "var(--font-geist-serif-square), serif",
			system: "system-ui, sans-serif",
		},
		states: {
			closing: "[data-ending-style]",
			"from-left": "[data-activation-direction=left]",
			"from-right": "[data-activation-direction=right]",
			hovering: "[data-hovering]",
			opening: "[data-starting-style]",
			scrolling: "[data-scrolling]",
			swiping: "[data-swiping]",
		},
		easings: {
			"in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
			"out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
			"out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
		},
		// the soft key: a lighter inner edge on top and a small drop under each key
		boxShadow: {
			key: "inset 0 1px 0 light-dark(oklch(1 0 0), oklch(1 0 0 / .11)), 0 1px 2px light-dark(oklch(0 0 0 / .07), oklch(0 0 0 / .35))",
			"key-fill": "inset 0 1px 0 light-dark(oklch(1 0 0 / .16), oklch(1 0 0 / .7)), 0 1px 2px light-dark(oklch(0 0 0 / .1), oklch(0 0 0 / .35))",
			sunk: "inset 0 1px 2px light-dark(oklch(0 0 0 / .08), oklch(0 0 0 / .45))",
			pop: "0 12px 28px -12px light-dark(oklch(0 0 0 / .16), oklch(0 0 0 / .7)), 0 2px 6px -2px light-dark(oklch(0 0 0 / .05), oklch(0 0 0 / .3))",
		},
		keyframes: {
			// to the element's own style, so a leaving element ends where it rests
			leave: "from { opacity: 1; scale: 1; }",
			pulse: "0%, 100% { opacity: .5; } 50% { opacity: 1; }",
			shake: "20%, 60% { translate: -8px 0; } 40%, 80% { translate: 8px 0; }",
			slide: "from { translate: -100% 0; } to { translate: 100% 0; }",
			spin: "to { rotate: 360deg; }",
		},
	},
});
