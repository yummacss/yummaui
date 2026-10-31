"use client";

import Link from "next/link";
import { CSS_ORIGIN } from "@/utils/hosts";
import { YummaUILogo } from "../icons/yumma-logo";

/** The logo, linking to the landing page; a right-click opens the brand page, which is what someone right-clicking a logo is after. */
export default function HomeMark({ className }: { className: string }) {
	return (
		<Link
			href="/"
			aria-label="Yumma UI"
			onContextMenu={(event) => {
				event.preventDefault();
				window.location.assign(`${CSS_ORIGIN}/docs/brand`);
			}}
			className="d:b w:fc fv:oc:ink fv:ow:2"
		>
			<YummaUILogo className={className} />
		</Link>
	);
}
