import { colorTheme, generateShades } from "@yummacss/core";
import { describe, expect, it } from "vite-plus/test";
import { ROLE_CLASSES } from "../src/registry/role-classes";
import {
	ACCENTS,
	accentCss,
	accentShade,
	DEFAULT_ACCENT,
} from "../src/utils/accent";

describe("preview accent", () => {
	it("emits nothing for the colour the components already ship", () => {
		expect(accentCss(DEFAULT_ACCENT)).toBe("");
	});

	it("repaints the role classes, as the generator writes them", () => {
		const css = accentCss("indigo");
		expect(css).toContain(".bg\\:fill {");
		expect(css).toContain(".bc\\:edge {");
		expect(css).toContain(".fv\\:bc\\:focus:focus-visible {");
		expect(css).toContain(".oc\\:focus\\/40 {");
		expect(css).toContain(".c\\:on-fill { color: #ffffff; }");
	});

	it("picks a shade that keeps white text readable", () => {
		for (const family of ACCENTS) {
			const shades = generateShades(
				colorTheme[family as keyof typeof colorTheme],
			);
			const shade = accentShade(shades);
			expect(shade).toBeGreaterThanOrEqual(6);
			expect(shade).toBeLessThan(12);
		}
		const indigo = generateShades(colorTheme.indigo);
		expect(accentCss("indigo")).toContain(
			`.bg\\:fill { background-color: ${indigo[accentShade(indigo)]}; }`,
		);
	});

	it("writes one rule per role class for every family Yumma ships", () => {
		expect(ACCENTS).toContain("indigo");
		expect(ACCENTS.length).toBeGreaterThan(15);
		expect(ROLE_CLASSES).toContain("bg:fill");

		for (const family of ACCENTS) {
			if (family === DEFAULT_ACCENT) continue;
			expect(accentCss(family).split("\n")).toHaveLength(ROLE_CLASSES.length);
		}
	});
});
