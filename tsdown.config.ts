import { defineConfig } from "tsdown";

export default defineConfig({
	banner: { js: "#!/usr/bin/env node" },
	entry: ["src/cli.ts"],
	format: ["esm"],
	target: "es2022",
});
