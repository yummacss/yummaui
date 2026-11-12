import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { rootDir } from "./helpers";

// the checkable rules in DESIGN.md; each list holds the components that break a rule today and only shrinks

const registryDir = join(rootDir, "src/registry/ui");
const registry = readdirSync(registryDir)
	.filter((file) => file.endsWith(".tsx") && file !== "style.tsx")
	.map((file) => ({
		name: file.replace(".tsx", ""),
		source: readFileSync(join(registryDir, file), "utf8"),
	}));

const breaking = (test: (source: string, name: string) => boolean) =>
	registry
		.filter(({ source, name }) => test(source, name))
		.map(({ name }) => name)
		.sort((a, b) => a.localeCompare(b));

const classes = (source: string) =>
	source.match(/(?<![\w:-])(?:@[a-z]+:)?(?:[a-z]+:)?[a-z-]+:[^\s"'`{}]+/g) ??
	[];

const SCROLLS_NATIVELY = [
	"account-menu",
	"activity-heatmap",
	"autocomplete",
	"combobox",
	"context-menu",
	"diff-viewer",
	"kanban-board",
	"lightbox",
	"menu",
	"menubar",
	"model-picker",
	"resizable-panels",
	"select",
	"tool-call",
];

const HARD_CODED_CORNERS = [
	"bar-chart",
	"diff-viewer",
	"field",
	"line-chart",
	"skeleton",
];

const DIMS_WITH_OPACITY = [
	"account-menu",
	"autocomplete",
	"banner-alert",
	"combobox",
	"context-menu",
	"file-tree",
	"menu",
	"menubar",
	"navigation-menu",
	"select",
	"treemap",
];

const ICON_AT_20_WITHOUT_REASON = ["popover", "toolbar"];
// the icon is the whole target, on an image or an empty area
const ICON_AT_20 = ["file-upload", "lightbox"];
// the icon is the content
const ICON_AT_24 = ["keypad", "rating"];

// data settling, the one use for 500ms
const SETTLES = ["inline-icon-heading", "meter", "progress"];

describe("DESIGN.md", () => {
	it("scrolls through Scroll Area, never the browser's own bar", () => {
		expect(
			breaking(
				(source, name) =>
					!name.startsWith("scroll-area") &&
					classes(source).some((token) =>
						/(?:^|:)o[xy]?:(?:auto|s)$/.test(token),
					),
			),
		).toEqual(SCROLLS_NATIVELY);
	});

	it("takes corners from RADIUS; a literal only for round things", () => {
		expect(
			breaking((source, name) => {
				if (name === "activity-heatmap") return false; // its day cells keep their own shape map
				return classes(source).some(
					(token) =>
						/(?:^|:)br:(?!9999$)/.test(token) && !token.includes("calc("),
				);
			}),
		).toEqual(HARD_CODED_CORNERS);
	});

	it("dims secondary text and icons with c:hint, opacity only for disabled", () => {
		expect(
			breaking((source) =>
				classes(source).some((token) => /(?:^|\s)o:(?:70|80)$/.test(token)),
			),
		).toEqual(DIMS_WITH_OPACITY);
	});

	it("sizes icons square, 16px unless the role asks otherwise", () => {
		const sized = (source: string) =>
			[...source.matchAll(/<Icon\w+[^>]*className="([^"]*)"/g)].map(
				([, value]) => ({
					w: value.match(/(?:^|\s)w:(\d+)(?=\s|$)/)?.[1],
					h: value.match(/(?:^|\s)h:(\d+)(?=\s|$)/)?.[1],
				}),
			);
		for (const { name, source } of registry) {
			for (const { w, h } of sized(source)) {
				if (!w && !h) continue;
				expect(w, `${name}: an icon is as wide as it is tall`).toBe(h);
				const allowed = ["3", "4"];
				if (
					ICON_AT_20.includes(name) ||
					ICON_AT_20_WITHOUT_REASON.includes(name)
				)
					allowed.push("5");
				if (ICON_AT_24.includes(name)) allowed.push("6");
				expect(allowed, `${name}: w:${w} is not an icon size for it`).toContain(
					w,
				);
			}
		}
		expect(
			breaking(
				(source, name) =>
					!ICON_AT_20.includes(name) && /<Icon\w+[^>]*w:5 h:5/.test(source),
			),
		).toEqual(ICON_AT_20_WITHOUT_REASON);
	});

	it("keeps motion to the durations it names", () => {
		for (const { name, source } of registry) {
			for (const token of classes(source).filter((t) =>
				/(?:^|:)tdu:\d+$/.test(t),
			)) {
				const ms = Number(token.split(":").at(-1));
				const allowed = [
					0,
					100,
					150,
					200,
					250,
					300,
					...(SETTLES.includes(name) ? [500] : []),
				];
				expect(allowed, `${name}: ${token}`).toContain(ms);
			}
		}
	});
});
