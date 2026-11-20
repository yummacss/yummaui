"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Desktop, Moon, Sun } from "@/icons";
import { useIndicator } from "@/registry/ui/style";
import { type SiteTheme, setSiteTheme, useSiteTheme } from "@/utils/site-theme";

const THEMES = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Desktop },
] as const;

/** Light, dark or system for the whole site, the previews included. */
export default function SiteThemeSwitcher() {
	const theme = useSiteTheme();
	const indicator = useIndicator<HTMLDivElement>();
	return (
		<ToggleGroup
			ref={indicator.ref}
			aria-label="Theme"
			value={[theme]}
			onValueChange={(next) => {
				const picked = next[0] as SiteTheme | undefined;
				if (picked) setSiteTheme(picked);
			}}
			className="p:r d:f ai:c g:px h:8 px:1 br:9999 bc:border bg:surface bs-o:key bw:1 bf-b:sm"
		>
			{/* the search bar's Ctrl + K key, sliding under the picked option */}
			<span
				aria-hidden
				style={indicator.style}
				className={`p:a l:0 t:0 br:9999 bc:border bg:surface bs-o:key bw:1 ${
					indicator.ready ? "tp:a tdu:300 ttf:out-quart @prm:tp:none" : ""
				}`}
			/>
			{THEMES.map(({ value, label, Icon }) => (
				<Toggle
					key={value}
					value={value}
					aria-label={label}
					className={(state) =>
						`p:r zi:10 d:f ai:c jc:c w:8 h:6 br:9999 bw:0 bg:transparent c:p tp:c tdu:150 @prm:tp:none fv:oc:ink fv:ow:2 ${
							state.pressed ? "c:ink" : "c:ink/60 h:c:ink"
						}`
					}
				>
					<Icon className="w:4 h:4" />
				</Toggle>
			))}
		</ToggleGroup>
	);
}
