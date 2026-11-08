import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";
import { linesOf } from "@/components/ui/code-block";
import Block from "@/registry/ui/code-block";

interface CodeChildProps {
	title?: string;
	lang?: string;
	code?: string;
	meta?: string;
}

/** Fenced blocks side by side as Code Block tabs, one per title. */
export default function CodeGroup({ children }: { children?: ReactNode }) {
	const panels = Children.toArray(children).filter(
		(child): child is ReactElement<CodeChildProps> => isValidElement(child),
	);
	if (panels.length === 0) return null;

	const tabs = panels.map((child, index) => {
		const { title, lang, meta } = child.props;
		const code = (child.props.code ?? "").replace(/\n$/, "");
		return {
			label: title ?? lang ?? `Tab ${index + 1}`,
			code,
			lines: linesOf(code, lang, meta, title),
		};
	});

	return (
		<div className="my:4">
			<Block tabs={tabs} lineNumbers={false} />
		</div>
	);
}
