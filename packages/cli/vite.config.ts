import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		banner: { js: "#!/usr/bin/env node" },
		entry: ["src/cli.ts"],
		format: ["esm"],
		target: "es2022",
	},
});
