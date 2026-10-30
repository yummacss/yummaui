import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { applyShape, DEFAULT_SHAPE, SHAPES } from "../src/utils/shapes.mjs";
import { rootDir } from "./helpers";

const out = join(rootDir, "public/ui/registry");
const read = (path: string) =>
	JSON.parse(readFileSync(join(out, path), "utf8"));

describe("registry json", () => {
	execFileSync("node", ["scripts/generate-registry-json.mjs"], {
		cwd: rootDir,
		stdio: "ignore",
	});
	const ids = readdirSync(out)
		.filter((file) => file.endsWith(".json") && file !== "index.json")
		.map((file) => file.replace(".json", ""));

	it("builds every item in every shape", () => {
		expect(ids.length).toBeGreaterThan(30);
		for (const shape of SHAPES) {
			expect(readdirSync(join(out, shape)).length, shape).toBe(ids.length);
			for (const id of ids) {
				const base = read(`${id}.json`);
				const shaped = read(`${shape}/${id}.json`);
				expect(shaped.files[0].content, `${shape}/${id}`).toBe(
					shape === DEFAULT_SHAPE
						? base.files[0].content
						: applyShape(base.files[0].content, shape),
				);
				expect({ ...shaped, files: [] }).toEqual({ ...base, files: [] });
			}
		}
	});

	it("publishes the states and keyframes the components use, as the site defines them", async () => {
		const { theme } = read("index.json");
		const config = (await import("../yummacss.config.mjs")).default;
		expect(Object.keys(theme.states).length).toBeGreaterThan(0);
		expect(Object.keys(theme.keyframes).length).toBeGreaterThan(0);
		for (const [name, value] of Object.entries(theme.states))
			expect(config.theme?.states?.[name]).toBe(value);
		for (const [name, value] of Object.entries(theme.keyframes))
			expect(config.theme?.keyframes?.[name]).toBe(value);
	});
});
