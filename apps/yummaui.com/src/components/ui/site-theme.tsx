"use client";

import { Button } from "@base-ui/react/button";
import { Desktop, Moon, Sun } from "@/icons";
import { type SiteTheme, setSiteTheme, useSiteTheme } from "@/utils/site-theme";

const THEMES: Record<
	SiteTheme,
	{ label: string; Icon: typeof Sun; next: SiteTheme }
> = {
	system: { label: "System", Icon: Desktop, next: "light" },
	light: { label: "Light", Icon: Sun, next: "dark" },
	dark: { label: "Dark", Icon: Moon, next: "system" },
};

/** Light, dark or system for the whole site, the previews included: each press moves to the next. */
export default function SiteThemeSwitcher({
	size = "w:8 h:8",
}: {
	/** Width and height, to match the buttons beside it. */
	size?: string;
}) {
	const theme = useSiteTheme();
	const { label, Icon, next } = THEMES[theme];
	return (
		<Button
			type="button"
			onClick={() => setSiteTheme(next)}
			aria-label={`Theme: ${label}. Switch to ${THEMES[next].label}`}
			className={`d:f ai:c jc:c ${size} br:9999 bc:border bg:surface bs-o:key h:bg:hover a:bg:press c:ink bw:1 bf-b:sm fv:oc:ink fv:ow:2`}
		>
			{/* re-keyed, so each theme's icon eases in */}
			<Icon
				key={theme}
				className="w:4 h:4 tp:ot tdu:300 ttf:out-back @st:s:50 @st:o:0 @st:ro:-20 @prm:tp:none"
			/>
		</Button>
	);
}
