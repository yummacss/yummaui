import {
	createHighlighterCoreSync,
	type HighlighterCore,
	hastToHtml,
	isPlainLang,
	isSpecialLang,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import shellscript from "@shikijs/langs/shellscript";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import yaml from "@shikijs/langs/yaml";
import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";
import type { Element, Root } from "hast";
import { decorateCodeHast } from "@/lib/code-decorate.mjs";
import { charcoalDark, charcoalLight } from "@/themes/charcoal";

// each token's color is light-dark(), so code follows the page's scheme
const THEMES = { light: "charcoal-light", dark: "charcoal-dark" };

let highlighter: HighlighterCore | null = null;

function get(): HighlighterCore {
	if (!highlighter) {
		highlighter = createHighlighterCoreSync({
			themes: [charcoalLight, charcoalDark],
			langs: [
				html,
				css,
				tsx,
				typescript,
				javascript,
				jsx,
				shellscript,
				json,
				yaml,
			],
			engine: createJavaScriptRegexEngine(),
		});
	}
	return highlighter;
}

export function highlight(
	code: string,
	lang?: string,
	meta?: string,
	title?: string,
): string {
	const shiki = get();

	let resolved = lang || "text";
	if (!isPlainLang(resolved) && !isSpecialLang(resolved)) {
		if (!shiki.getLoadedLanguages().includes(resolved)) resolved = "text";
	}

	const hast: Root = shiki.codeToHast(code, {
		lang: resolved,
		themes: THEMES,
		defaultColor: "light-dark()",
		meta: { __raw: meta ?? "" },
		transformers: [
			transformerNotationDiff(),
			transformerNotationHighlight(),
			transformerNotationWordHighlight(),
		],
	});

	const pre = hast.children.find(
		(c): c is Element => c.type === "element" && c.tagName === "pre",
	);
	if (pre) decorateCodeHast(pre, meta ?? "", title ?? null);

	return hastToHtml(hast);
}

/** Code as colored runs, one array per line, for blocks that draw their own tokens. */
export function highlightTokens(
	code: string,
	lang = "tsx",
): { text: string; color?: string }[][] {
	const shiki = get();
	const dark = shiki.codeToTokensBase(code, { lang, theme: THEMES.dark });
	return shiki
		.codeToTokensBase(code, { lang, theme: THEMES.light })
		.map((line, row) =>
			line.map((token, column) => ({
				text: token.content,
				color: `light-dark(${token.color}, ${dark[row]?.[column]?.color ?? token.color})`,
			})),
		);
}

/** Highlighted code as one HTML string per line, with the meta's word marks, for Code Block's `lines`. */
export function highlightLines(
	code: string,
	lang?: string,
	meta?: string,
	title?: string,
): string[] {
	const shiki = get();
	let resolved = lang || "text";
	if (!isPlainLang(resolved) && !isSpecialLang(resolved)) {
		if (!shiki.getLoadedLanguages().includes(resolved)) resolved = "text";
	}
	const hast: Root = shiki.codeToHast(code.replace(/\n$/, ""), {
		lang: resolved,
		themes: THEMES,
		defaultColor: "light-dark()",
	});
	const pre = hast.children.find(
		(c): c is Element => c.type === "element" && c.tagName === "pre",
	);
	if (!pre) return code.split("\n");
	decorateCodeHast(pre, meta ?? "", title ?? null);
	const codeEl = pre.children.find(
		(c): c is Element => c.type === "element" && c.tagName === "code",
	);
	return (codeEl?.children ?? [])
		.filter((c): c is Element => c.type === "element" && c.tagName === "span")
		.map((line) => hastToHtml({ type: "root", children: line.children }));
}
