"use client";

import { colorTheme, generateShades } from "@yummacss/core";
import { ROLE_CLASSES } from "@/registry/role-classes";
import {
	formatCss,
	modeLrgb,
	modeOklch,
	modeRgb,
	parse,
	useMode,
	wcagContrast,
} from "culori/fn";

// the shades are oklch(); contrast needs linear RGB
for (const mode of [modeRgb, modeLrgb, modeOklch]) useMode(mode);

// the property each color utility sets
const PROPERTIES: Record<string, string> = {
	bg: "background-color",
	bc: "border-color",
	c: "color",
	oc: "outline-color",
	f: "fill",
	s: "stroke",
};

const STATES: Record<string, string> = {
	h: ":hover",
	fv: ":focus-visible",
	fw: ":focus-within",
};

// `fv:bc:focus` is `.fv\:bc\:focus:focus-visible`, as the generator writes it.
function selectorOf(name: string): string {
	const state = STATES[name.split(":")[0]] ?? "";
	return `.${name.replace(/[:/]/g, "\\$&")}${state}`;
}

export const ACCENTS = Object.keys(colorTheme);

export const DEFAULT_ACCENT = "slate";

export function isAccent(value: unknown): value is string {
	return typeof value === "string" && ACCENTS.includes(value);
}

/** The accent's color for each role: the fill and its ring, the focus outline, and white on the fill. */
export function accentRoles(family: string): Record<string, string> {
	const shades = generateShades(colorTheme[family as keyof typeof colorTheme]);
	const base = accentShade(shades);
	return {
		fill: shades[base],
		check: shades[base],
		on: shades[base],
		edge: shades[Math.min(base + 2, 11)],
		focus: shades[base],
		"on-fill": "#ffffff",
	};
}

/** CSS that repaints every role class in `classes` in the accent `family`. */
export function accentCss(
	family: string,
	classes: string[] = ROLE_CLASSES,
): string {
	if (family === DEFAULT_ACCENT || !isAccent(family)) return "";

	const roles = accentRoles(family);

	return classes
		.map((name) => {
			const parts = name.split(":");
			const [role, alpha] = parts[parts.length - 1].split("/");
			const property = PROPERTIES[parts[parts.length - 2]];
			if (!property) return "";
			const color = roles[role];
			const value = alpha ? withAlpha(color, Number(alpha) / 100) : color;
			return `${selectorOf(name)} { ${property}: ${value}; }`;
		})
		.filter(Boolean)
		.join("\n");
}

/** Three shades of a family, light, base and dark, as the accent picker draws it. */
export function accentBars(family: string): string[] {
	const shades = generateShades(colorTheme[family as keyof typeof colorTheme]);
	return [shades[3], shades[6], shades[9]];
}

// The lightest shade from 6 up that keeps white text at 4.5:1.
export function accentShade(shades: string[]): number {
	let shade = 6;
	while (shade < 11 && contrastOnWhite(shades[shade]) < 4.5) shade += 1;
	return shade;
}

function contrastOnWhite(color: string): number {
	return wcagContrast(color, "white");
}

function withAlpha(color: string, alpha: number): string {
	const parsed = parse(color);
	return parsed ? (formatCss({ ...parsed, alpha }) ?? color) : color;
}
