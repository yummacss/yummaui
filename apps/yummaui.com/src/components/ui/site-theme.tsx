"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Desktop, Moon, Sun } from "@/icons";
import { type SiteTheme, setSiteTheme, useSiteTheme } from "@/utils/site-theme";

const THEMES = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Desktop },
] as const;

// the search bar's pill, with the picked option drawn as its Ctrl + K key
const KEY = "bc:border bg:surface bs-o:key c:ink";

/** Light, dark or system for the whole site, the previews included. */
export default function SiteThemeSwitcher() {
	const theme = useSiteTheme();
	return (
		<ToggleGroup
			aria-label="Theme"
			value={[theme]}
			onValueChange={(next) => {
				const picked = next[0] as SiteTheme | undefined;
				if (picked) setSiteTheme(picked);
			}}
			className="d:f ai:c g:px h:8 px:1 br:9999 bc:border bg:surface bs-o:key bw:1 bf-b:sm"
		>
			{THEMES.map(({ value, label, Icon }) => (
				<Toggle
					key={value}
					value={value}
					aria-label={label}
					className={(state) =>
						`d:f ai:c jc:c w:8 h:6 br:9999 bw:1 c:p tp:c tdu:150 @prm:tp:none fv:oc:ink fv:ow:2 ${
							state.pressed
								? KEY
								: "bc:transparent bg:transparent c:ink/60 h:c:ink"
						}`
					}
				>
					<Icon className="w:4 h:4" />
				</Toggle>
			))}
		</ToggleGroup>
	);
}
