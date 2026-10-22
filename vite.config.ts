import { defineConfig } from "vite-plus";

// format & lint settings for every package; each package's own config builds it
export default defineConfig({
	fmt: { useTabs: true, printWidth: 80 },
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
});
