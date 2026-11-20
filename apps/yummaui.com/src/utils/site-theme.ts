import { useSyncExternalStore } from "react";
import type { Scheme } from "@/utils/scheme";
import { THEME_KEY as KEY } from "@/utils/theme-script";

export type SiteTheme = "light" | "dark" | "system";

const EVENT = "yui:theme";

const isTheme = (value: unknown): value is SiteTheme =>
	value === "light" || value === "dark" || value === "system";

function read(): SiteTheme {
	try {
		const saved = window.localStorage.getItem(KEY);
		return isTheme(saved) ? saved : "system";
	} catch {
		return "system";
	}
}

/** Sets the site's theme, and the preview's with it, and remembers it. */
export function setSiteTheme(theme: SiteTheme) {
	try {
		window.localStorage.setItem(KEY, theme);
	} catch {}
	const root = document.documentElement;
	if (theme === "system") delete root.dataset.theme;
	else root.dataset.theme = theme;
	window.dispatchEvent(new Event(EVENT));
}

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function subscribe(change: () => void) {
	window.addEventListener(EVENT, change);
	window.addEventListener("storage", change);
	media().addEventListener("change", change);
	return () => {
		window.removeEventListener(EVENT, change);
		window.removeEventListener("storage", change);
		media().removeEventListener("change", change);
	};
}

/** The picked theme; `system` on the server and until hydration. */
export function useSiteTheme(): SiteTheme {
	return useSyncExternalStore(subscribe, read, () => "system");
}

/** What the site draws in: the picked theme, or the device's for `system`. */
export function useSiteScheme(): Scheme {
	return useSyncExternalStore(
		subscribe,
		() => {
			const theme = read();
			if (theme !== "system") return theme;
			return media().matches ? "dark" : "light";
		},
		() => "light",
	);
}
