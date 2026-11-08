import { defineConfig } from "yummacss";
import { ROLES } from "./src/utils/roles.mjs";

export default defineConfig({
	source: ["./src/**/*.{ts,tsx,mdx,mjs}", "./src/registry/meta/*.json"],
	theme: {
		colors: {
			...ROLES,
			"accent-dim": { light: "#8a8794", dark: "#a19fab" },
			"diff-add": { light: "#2e7d5b", dark: "#a8e1ad" },
			"diff-remove": { light: "#a8372b", dark: "#e1a8a8" },
			accent: { light: "#24222a", dark: "#e6e5ea" },
			// the primary key: charcoal, a light key in the dark like the components' own
			brand: { light: "#24222a", dark: "#e6e5ea" },
			// the logo's two squares
			"mark-back": { light: "#c9c6d2", dark: "#4a4852" },
			"mark-front": { light: "#24222a", dark: "#e6e5ea" },
			border: { light: "oklch(0.905 0.006 286)", dark: "oklch(0.3 0.008 290)" },
			code: { light: "#3a3a3f", dark: "#d0d0d5" },
			ink: { light: "#14171f", dark: "#ffffff" },
			hover: { light: "oklch(0.955 0.004 286)", dark: "oklch(0.2 0.007 290)" },
			page: { light: "oklch(0.982 0.002 286)", dark: "oklch(0.165 0.006 290)" },
			press: { light: "oklch(0.93 0.005 286)", dark: "oklch(0.25 0.008 290)" },
			surface: { light: "oklch(1 0 none)", dark: "oklch(0.215 0.007 290)" },
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
		// the soft key: a lit top edge, a crisp bottom edge and a tight drop under each key
		boxShadow: {
			key: "inset 0 1px 0 light-dark(oklch(1 0 0), oklch(1 0 0 / .11)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .1), oklch(0 0 0 / .45)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .08), oklch(0 0 0 / .4))",
			"key-fill":
				"inset 0 1px 0 light-dark(oklch(1 0 0 / .14), oklch(1 0 0 / .7)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .25), oklch(0 0 0 / 0)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .2), oklch(0 0 0 / .35))",
			sunk: "inset 0 1px 2px light-dark(oklch(0 0 0 / .05), oklch(0 0 0 / .45))",
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
