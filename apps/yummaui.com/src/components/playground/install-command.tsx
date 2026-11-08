"use client";

import { usePlayground } from "@/components/playground/context";
import { getRegistryTarget } from "@/registry";
import CodeBlock from "@/registry/ui/code-block";
import { CHARCOAL } from "@/themes/charcoal";
import { addCommand } from "@/utils/install.mjs";

const tone = (role: keyof typeof CHARCOAL) =>
	`light-dark(${CHARCOAL[role][0]}, ${CHARCOAL[role][1]})`;

/** The command that adds this page's component, above its Component API. */
export default function Installation() {
	const playground = usePlayground();
	if (!playground) return null;

	const command = `pnpm dlx ${addCommand(getRegistryTarget(playground.id).install)}`;
	const [tool, ...rest] = command.split(" ");

	return (
		<section>
			<h2 className="mt:12 mb:4 ff:display c:ink fs:xxl fw:400 lh:1">
				Installation
			</h2>
			<CodeBlock
				code={command}
				lines={[
					<span key="command">
						<span style={{ color: tone("name") }}>{tool}</span>
						<span style={{ color: tone("text") }}> {rest.join(" ")}</span>
					</span>,
				]}
				lineNumbers={false}
			/>
		</section>
	);
}
