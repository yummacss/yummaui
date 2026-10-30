import type { Metadata } from "next";
import Field from "@/components/landing/field";
import LandingHeader from "@/components/landing/header";
import { CopyCommand, HotkeyLink } from "@/components/landing/keys";
import SkipLink from "@/components/ui/skip-link";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

export default function Home() {
	return (
		<div className="d:f fd:c min-h:dvh">
			<SkipLink />

			<div className="bbw:1 bc:border">
				<div className="p:r mx:auto max-w:280 blw:1 brw:1 bc:border">
					<LandingHeader />
				</div>
			</div>

			<main
				id="main"
				className="f:1 d:f fd:c w:100% mx:auto max-w:280 blw:1 brw:1 bc:border @lg:p:r"
			>
				<div className="p:r h:80 bbw:1 bc:border @lg:p:a @lg:i:0 @lg:h:auto @lg:bbw:0">
					<Field />
				</div>

				<section className="p:r zi:10 d:f fd:c jc:fe g:6 px:6 py:10 bg:page @lg:p:a @lg:b:0 @lg:l:0 @lg:w:150 @lg:h:120 @lg:px:10 @lg:py:11 @lg:btw:1 @lg:brw:1 @lg:bc:border">
					<p className="m:0 fs:xs ls:5 tt:u c:ink/60">Base UI · Yumma CSS</p>
					<h1 className="m:0 ff:display fw:400 fs:4xl lh:1 c:ink @sm:fs:5xl">
						Yumma UI for React.
					</h1>
					<p className="m:0 fs:sm lh:5 ls:3 c:ink/70">
						48 React components on Base UI. The CLI writes each one into your
						project as a file you can read.
					</p>
					<div className="d:f fd:c g:2 @sm:fd:r">
						<HotkeyLink href="/components/accordion" hotkey="B" primary>
							Browse components
						</HotkeyLink>
						<CopyCommand command="pnpm dlx yummaui init" hotkey="C" />
					</div>
				</section>
			</main>
		</div>
	);
}
