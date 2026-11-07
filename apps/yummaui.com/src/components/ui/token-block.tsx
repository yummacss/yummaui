"use client";

import { Fragment, type ReactNode } from "react";
import Block from "@/registry/ui/code-block";
import { TOKEN_COLORS, type Token, tokensToText } from "@/utils/snippet";

/** The stage's Code and Configuration tabs: colored tokens in a Code Block that fills its panel. */
export default function TokenBlock({
	tokens,
	className = "",
}: {
	tokens: Token[];
	className?: string;
}) {
	const rows: ReactNode[][] = [[]];
	for (const token of tokens) {
		token.text.split("\n").forEach((part, index) => {
			if (index > 0) rows.push([]);
			if (part)
				rows[rows.length - 1].push(
					<span
						key={`${token.id}-${index}`}
						style={{ color: token.color ?? TOKEN_COLORS[token.kind] }}
					>
						{part}
					</span>,
				);
		});
	}
	const lines = rows.map((row, index) => (
		<Fragment key={index}>{row.length ? row : ""}</Fragment>
	));

	// the panel is the frame, so the block drops its own edge
	return (
		<div className={`cs:d ${className}`}>
			<Block
				code={tokensToText(tokens)}
				lines={lines}
				lineNumbers={rows.length > 3}
				fill
				className="bw:0 br:0 bg:surface"
			/>
		</div>
	);
}
