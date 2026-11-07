import { parseRanges } from "@/lib/code-decorate.mjs";
import { highlightLines } from "@/lib/highlighter";
import Block from "@/registry/ui/code-block";

interface Props {
	code?: string;
	meta?: string;
	title?: string;
	lang?: string;
}

/** Highlighted lines for Code Block, one node per line. */
export function linesOf(
	code: string,
	lang?: string,
	meta?: string,
	title?: string,
) {
	return highlightLines(code, lang, meta, title).map((html, index) => (
		// biome-ignore lint/security/noDangerouslySetInnerHtml: server-generated Shiki output from repo-local source, never user input
		<span key={index} dangerouslySetInnerHTML={{ __html: html }} />
	));
}

// Eclipsa is dark only, so the block stays dark until the theme has a light side
export default function CodeBlock({ code = "", meta, title, lang }: Props) {
	const text = code.replace(/\n$/, "");
	const lines = linesOf(text, lang, meta, title);

	return (
		<div className="my:4 cs:d">
			<Block
				code={text}
				lines={lines}
				title={title}
				lineNumbers={lines.length > 3}
				highlightLines={[...parseRanges(meta, "mark")] as number[]}
			/>
		</div>
	);
}
