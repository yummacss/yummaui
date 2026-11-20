"use client";

import ThemeSwitcher from "@/registry/ui/theme-switcher";
import { setSiteTheme, useSiteTheme } from "@/utils/site-theme";

/** Light, dark or system for the whole site, the previews included. */
export default function SiteThemeSwitcher() {
	const theme = useSiteTheme();
	return (
		<ThemeSwitcher
			value={theme}
			onValueChange={setSiteTheme}
			iconOnly
			size="md"
			shape="pill"
		/>
	);
}
