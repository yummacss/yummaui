import { uis } from "@/utils/uis";
import Navbar from "@/components/ui/navbar";
import UIShell from "@/components/ui/shell";
import Sidebar, { AREAS, type Area, menu } from "@/components/ui/sidebar";
import SkipLink from "@/components/ui/skip-link";
import type { Primitives } from "@/utils/primitive";

const playgrounds = uis
	.filter((ui) => ui.playground)
	.map((ui) => ui._meta.path);

const resizable = uis.filter((ui) => ui.resizable).map((ui) => ui._meta.path);

const primitives: Primitives = Object.fromEntries(
	uis.flatMap((ui) => (ui.primitive ? [[ui._meta.path, ui.primitive]] : [])),
);

export default async function SectionLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ section: string }>;
}) {
	const { section } = await params;
	const area: Area = section === "blocks" ? "blocks" : "components";
	return (
		<div className="min-h:dvh">
			<SkipLink />
			<Navbar menu={menu(area)} areas={AREAS} current={area} />

			<main
				id="main"
				className="zi:0 mx:auto px:6 max-w:clamp(40rem,80vw,96rem)"
			>
				<UIShell
					sidebar={<Sidebar area={area} />}
					playgrounds={playgrounds}
					resizable={resizable}
					primitives={primitives}
				>
					{children}
				</UIShell>
			</main>
		</div>
	);
}
