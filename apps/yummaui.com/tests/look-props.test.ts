import { createElement, Fragment, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { registryMeta } from "@/registry";
import { registry } from "@/registry/loaders";
import { type DemoProps, renderScene, sceneIds } from "@/utils/demo";
import { lookProps } from "@/utils/props";

// a setting whose effect never reaches the markup a server renders, named with why
const POPUP = "sets a popup, which is closed on first render";
const BEHAVIOR = "changes behavior, not markup";
const KNOWN_INERT: Record<string, string> = {
	"accordion.multiple": BEHAVIOR,
	"alert-dialog.showClose": POPUP,
	"alert-dialog.tone": POPUP,
	"autocomplete.autoHighlight": BEHAVIOR,
	"carousel.loop": BEHAVIOR,
	"autocomplete.loading": POPUP,
	"color-picker.opacity": "popover variant only",
	"combobox.loading": POPUP,
	"context-menu.icon": POPUP,
	"context-menu.iconPosition": POPUP,
	"dialog.confirmTone": POPUP,
	"dialog.showClose": POPUP,
	"drawer.handle": POPUP,
	"drawer.showClose": POPUP,
	"drawer.side": POPUP,
	"image-cropper.crop": "drawn once the picture has loaded",
	"marquee.pauseOnHover": BEHAVIOR,
	"menu.icon": POPUP,
	"menu.iconPosition": POPUP,
	"menubar.icon": POPUP,
	"menubar.iconPosition": POPUP,
	"onboarding.closeOnEscape": BEHAVIOR,
	"preview-card.arrow": POPUP,
	"streaming-text.pending": "drawn only before the first word",
};
// motion: transitions and keyframes, which no markup shows
const isMotion = (name: string) => name === "animated";

async function components(ids: string[]) {
	const out: Record<string, ComponentType<DemoProps>> = {};
	for (const id of ids) {
		const load = registry[id as keyof typeof registry];
		if (load) out[id] = (await load()).default as ComponentType<DemoProps>;
	}
	return out;
}

function render(
	page: string,
	scene: Parameters<typeof renderScene>[0],
	loaded: Record<string, ComponentType<DemoProps>>,
	values: Record<string, unknown>,
) {
	const nodes = renderScene(scene, loaded, "rounded", null, {
		values,
		page,
		set: () => {},
	});
	// ids differ between renders; they say nothing about a setting
	return renderToStaticMarkup(createElement(Fragment, null, nodes)).replace(
		/(id|for|aria-[a-z]+)="[^"]*"/g,
		"",
	);
}

describe("the Styling drawer", () => {
	it("changes the preview with every setting it offers", async () => {
		const inert: string[] = [];
		for (const [page, meta] of Object.entries(registryMeta)) {
			const scene = meta.scene;
			// an example's preview takes no settings, and the drawer hides them
			if (!scene || !sceneIds(scene).includes(page)) continue;
			const loaded = await components(sceneIds(scene));
			const own = scene.find(
				(node) => node.component && sceneIds([node]).includes(page),
			);
			const base = render(page, scene, loaded, {});
			for (const prop of lookProps(meta.props)) {
				// what the scene sets itself, or the prop's default
				const current = own?.props?.[prop.name] ?? prop.default;
				const values =
					prop.type === "boolean"
						? [!(current ?? false)]
						: (prop.values ?? []).filter((value) => value !== current);
				const changes = values.some(
					(value) =>
						render(page, scene, loaded, { [`all.${prop.name}`]: value }) !==
						base,
				);
				const name = `${page}.${prop.name}`;
				if (!changes && !(name in KNOWN_INERT) && !isMotion(prop.name))
					inert.push(name);
			}
		}
		expect(inert, "a setting in the drawer changes nothing").toEqual([]);
	}, 60_000);
});
