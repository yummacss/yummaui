import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vite-plus/test";
import AlertDialog from "../src/registry/ui/alert-dialog";
import Dialog from "../src/registry/ui/dialog";
import Drawer from "../src/registry/ui/drawer";
import Menu from "../src/registry/ui/menu";
import Popover from "../src/registry/ui/popover";
import PreviewCard from "../src/registry/ui/preview-card";
import Tooltip from "../src/registry/ui/tooltip";

// each trigger component renders an element passed as `render` in place of its own trigger
const el = h("a", { href: "/docs", className: "mine" }, "Docs");
const cases: [string, unknown][] = [
	["tooltip", h(Tooltip, { content: "Hi", render: el, className: "extra" })],
	[
		"popover",
		h(Popover, { title: "Hi", render: el, className: "extra" } as never),
	],
	[
		"preview-card",
		h(PreviewCard, { render: el, className: "extra" } as never, "x"),
	],
	[
		"dialog",
		h(Dialog, { title: "Hi", render: el, className: "extra" } as never),
	],
	[
		"alert-dialog",
		h(AlertDialog, { title: "Hi", render: el, className: "extra" } as never),
	],
	["menu", h(Menu, { items: [], render: el, className: "extra" } as never)],
	[
		"drawer",
		h(Drawer, { title: "Hi", render: el, className: "extra" } as never),
	],
];
for (const [name, node] of cases)
	it(name, () => {
		const html = renderToStaticMarkup(node as never);
		expect(html).toMatch(
			/<a [^>]*href="\/docs"[^>]*class="[^"]*mine[^"]*extra/,
		);
		expect(html).not.toContain("<button");
	});
