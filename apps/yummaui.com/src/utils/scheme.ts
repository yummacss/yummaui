// light or dark for the preview frame only, remembered like the accent
export const SCHEMES = ["light", "dark"] as const;
export type Scheme = (typeof SCHEMES)[number];

// the build lowers light-dark() to these two variables, and the site's own
// stylesheet pins popups to light, so this wins on every element in the frame
export function schemeCss(scheme: Scheme): string {
	const [light, dark] = scheme === "dark" ? [" ", "initial"] : ["initial", " "];
	return `html:root, html:root * { color-scheme: ${scheme} !important; --lightningcss-light:${light} !important; --lightningcss-dark:${dark} !important; }`;
}
