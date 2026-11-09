import path from "node:path";
import { defineConfig } from "vite-plus";

export default defineConfig({
	// tsconfig keeps JSX for Next; tests that render components need it compiled
	oxc: { jsx: { runtime: "automatic" } },
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
});
