// Renders every component page under the square and the pill shape, popups open,
// and fails on a hover, highlight or selected background whose corners ignore the
// shape. Run it against a built site: `pnpm build && pnpm start`, then `pnpm audit:shapes`.
// AUDIT_URL names another address; CHROMIUM_PATH a browser when Playwright has none.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.AUDIT_URL ?? "http://localhost:3000";

const ids = readdirSync(join(root, "src/registry/meta")).map((file) =>
	file.replace(/\.json$/, ""),
);

// how to open the popup a component hides until it is used
const OPEN = {
	autocomplete: ["type", "input"],
	combobox: ["click", "input"],
	"context-menu": ["right", "body *:has-text('scan.png') >> nth=-1"],
	menu: ["click", "button"],
	menubar: ["click", "[role=menuitem] >> nth=0"],
	"navigation-menu": ["hover", "button >> nth=0"],
	popover: ["click", "button"],
	select: ["click", "[role=combobox]"],
	sidebar: ["click", "text=Ada Lovelace"],
};

// parts that keep one radius whatever the shape, and why
const KEPT = [
	[/^avatar(-stack)?$/, /./, "avatars are round"],
	[/^skeleton/, /./, "a skeleton's shape is a size, not a radius"],
	[
		/^popover$/,
		/\bbg:(yellow|pink|violet|blue|mint|slate)\b/,
		"color swatches are round",
	],
	[/./, /\b(blr|brr):/, "the outer end of a joined control"],
];

const HIGHLIGHT = /(^|\s)[a-z-]+:bg:|(^|\s)bg:well(\s|$)/;

async function corners(page, id, shape) {
	// a block lives under /blocks, everything else under /components
	const response = await page.goto(`${base}/components/${id}`, {
		waitUntil: "networkidle",
	});
	if (response?.status() === 404)
		await page.goto(`${base}/blocks/${id}`, { waitUntil: "networkidle" });
	const frame = await (
		await page.$('iframe[title="Component preview"]')
	)?.contentFrame();
	if (!frame) throw new Error(`${id}: no preview under ${shape}`);

	const open = OPEN[id];
	if (open) {
		const [act, selector] = open;
		const target = frame.locator(selector).first();
		if (act === "right") await target.click({ button: "right" });
		else if (act === "hover") await target.hover();
		else await target.click();
		if (act === "type") await target.pressSequentially("re");
		await page.waitForTimeout(400);
		await page.keyboard.press("ArrowDown");
		await page.waitForTimeout(200);
	}

	return frame.evaluate((pattern) => {
		const highlight = new RegExp(pattern);
		return [...document.body.querySelectorAll("*")]
			.filter(
				(el) =>
					typeof el.className === "string" && highlight.test(el.className),
			)
			.map((el) => {
				const style = getComputedStyle(el);
				return {
					className: el.className,
					text: (el.textContent ?? "").trim().slice(0, 24),
					radius: [
						style.borderTopLeftRadius,
						style.borderTopRightRadius,
						style.borderBottomRightRadius,
						style.borderBottomLeftRadius,
					].join(" "),
				};
			});
	}, HIGHLIGHT.source);
}

const browser = await chromium.launch({
	executablePath: process.env.CHROMIUM_PATH,
});
const found = [];
for (const id of ids) {
	const seen = {};
	for (const shape of ["square", "pill"]) {
		const context = await browser.newContext({
			viewport: { width: 1280, height: 900 },
		});
		await context.addInitScript(
			(value) => localStorage.setItem("yui:shape", value),
			shape,
		);
		seen[shape] = await corners(await context.newPage(), id, shape);
		await context.close();
	}
	seen.pill.forEach((part, index) => {
		const square = seen.square[index];
		if (!square || square.radius !== part.radius) return;
		const kept = KEPT.some(
			([component, classes]) =>
				component.test(id) && classes.test(part.className),
		);
		if (!kept) found.push(`${id}: "${part.text}" keeps ${part.radius}`);
	});
}
await browser.close();

if (found.length > 0) {
	console.error(
		`These highlights ignore the shape; give them a RADIUS row:\n${found.join("\n")}`,
	);
	process.exit(1);
}
console.log(`✓ every highlight follows the shape across ${ids.length} pages`);
