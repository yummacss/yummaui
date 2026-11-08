import { parseRanges } from "@/lib/code-decorate.mjs";
import { highlightLines } from "@/lib/highlighter";
import { YummaMark } from "@/components/icons/yumma-logo";
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

export default function CodeBlock({ code = "", meta, title, lang }: Props) {
	const text = code.replace(/\n$/, "");
	const lines = linesOf(text, lang, meta, title);

	return (
		<div className="my:4">
			<Block
				shape="pill"
				icon={
					title?.startsWith("yumma") ? (
						<YummaMark aria-hidden className="w:4 h:4" />
					) : undefined
				}
				className="br:xl"
				code={text}
				lines={lines}
				title={title}
				lineNumbers={lines.length > 3}
				highlightLines={[...parseRanges(meta, "mark")] as number[]}
			/>
		</div>
	);
}
