import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		banner: { js: "#!/usr/bin/env node" },
		entry: ["src/cli.ts"],
		format: ["esm"],
		target: "es2022",
	},
	fmt: { useTabs: true, printWidth: 80 },
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
});
