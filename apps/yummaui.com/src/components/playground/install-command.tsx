"use client";

import { Button } from "@base-ui/react/button";
import { useEffect, useRef, useState } from "react";
import { usePlayground } from "@/components/playground/context";
import { Check, Copy } from "@/icons";
import { getRegistryTarget } from "@/registry";
import { addCommand } from "@/utils/install.mjs";

/** The command that adds this page's component, copied on a press. */
export default function InstallCommand() {
	const playground = usePlayground();
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);
	if (!playground) return null;

	const command = `pnpm dlx ${addCommand(getRegistryTarget(playground.id).install)}`;
	const copy = async () => {
		await navigator.clipboard.writeText(command);
		setCopied(true);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setCopied(false), 1500);
	};

	return (
		<Button
			onClick={copy}
			aria-label={copied ? "Copied" : `Copy ${command}`}
			className="d:if ai:c g:3 w:fc max-w:100% h:9 pl:4 pr:3 br:9999 bw:1 bc:border bg:surface bs-o:key c:ink ff:m fs:sm c:p h:bg:hover a:bg:press fv:oc:ink fv:ow:2"
		>
			<span className="o:h to:e ws:nw">{command}</span>
			{copied ? (
				<Check aria-hidden className="fs:0 w:4 h:4" />
			) : (
				<Copy aria-hidden className="fs:0 w:4 h:4 c:ink/60" />
			)}
		</Button>
	);
}
