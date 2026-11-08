import { defineConfig } from "vite-plus";

// format & lint settings for every package; each package's own config builds it
export default defineConfig({
	fmt: {
		useTabs: true,
		printWidth: 80,
		// the components people install keep the layout they ship with
		ignorePatterns: ["apps/yummaui.com/src/registry/**"],
	},
	lint: {
		jsPlugins: [
			{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
			{ name: "yummacss", specifier: "@yummacss/lint" },
		],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		overrides: [
			{
				files: ["apps/yummaui.com/**"],
				rules: {
					// the site's own stylesheet defines it
					"yummacss/no-unknown-classes": [
						"error",
						{ allow: ["footer-version"] },
					],
				},
			},
		],
		options: { typeAware: true, typeCheck: true },
	},
});
