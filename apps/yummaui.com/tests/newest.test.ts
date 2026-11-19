import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { NEWEST } from "../src/utils/component-pages.mjs";
import { rootDir } from "./helpers";

const published = JSON.parse(
	readFileSync(join(rootDir, "../../packages/cli/package.json"), "utf-8"),
).version as string;

describe("newest release", () => {
	it("is the published one", () => {
		expect(published.startsWith(`${NEWEST}.`)).toBe(true);
	});
});
