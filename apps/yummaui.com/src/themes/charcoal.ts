import type { ThemeRegistrationAny } from "@shikijs/core";

/** The code colors, grays from the site's roles, light then dark. */
export const CHARCOAL = {
	text: ["#1b1b1f", "#f0f0f3"],
	keyword: ["#5a5a60", "#a4a4ab"],
	name: ["#0b0b0e", "#ffffff"],
	attribute: ["#55555a", "#b7b7bb"],
	string: ["#3a3a3f", "#d0d0d5"],
	muted: ["#74747a", "#9a9aa1"],
} as const;

function theme(index: 0 | 1): ThemeRegistrationAny {
	const pick = (role: keyof typeof CHARCOAL) => CHARCOAL[role][index];
	return {
		name: index ? "charcoal-dark" : "charcoal-light",
		type: index ? "dark" : "light",
		colors: { "editor.foreground": pick("text") },
		tokenColors: [
			{
				scope: ["variable", "variable.other", "variable.parameter"],
				settings: { foreground: pick("text") },
			},
			{
				scope: ["punctuation", "meta.brace", "keyword.operator"],
				settings: { foreground: pick("muted") },
			},
			{
				scope: ["comment", "punctuation.definition.comment"],
				settings: { foreground: pick("muted"), fontStyle: "italic" },
			},
			{
				scope: [
					"string",
					"string.template",
					"punctuation.definition.string",
					"constant.numeric",
					"constant.other",
					"support.constant",
				],
				settings: { foreground: pick("string") },
			},
			{
				scope: [
					"keyword",
					"keyword.control",
					"keyword.operator.new",
					"storage",
					"storage.type",
					"storage.modifier",
					"constant.language",
					"variable.language",
				],
				settings: { foreground: pick("keyword") },
			},
			{
				scope: [
					"entity.name.function",
					"support.function",
					"entity.name.tag",
					"support.class.component",
					"entity.name.type",
					"entity.name.class",
					"support.type",
				],
				settings: { foreground: pick("name") },
			},
			{
				scope: [
					"entity.other.attribute-name",
					"support.type.property-name",
					"meta.object-literal.key",
				],
				settings: { foreground: pick("attribute") },
			},
		],
	};
}

export const charcoalLight = theme(0);
export const charcoalDark = theme(1);
