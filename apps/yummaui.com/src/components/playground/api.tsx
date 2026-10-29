"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import Link from "next/link";
import { Fragment, useState } from "react";
import { BaseUI } from "@/components/icons/icons";
import { usePlayground } from "@/components/playground/context";
import { EnumSelect, SwatchSelect } from "@/components/playground/control";
import PropDescription from "@/components/prop-description";
import { NavArrowDown } from "@/icons";
import { getRegistryTarget } from "@/registry";
import { ACCENTS, accentBars } from "@/utils/accent";
import { type Primitives, primitiveSlug } from "@/utils/primitive";
import { inTableOrder, typeOf } from "@/utils/props";
import { SCHEMES, type Scheme } from "@/utils/scheme";
import { SHAPES } from "@/utils/shapes.mjs";

/** A description's first sentence, opening on a press to the rest. */
function Summary({ text }: { text?: string }) {
	const [open, setOpen] = useState(false);
	if (!text) return null;
	const [lead, ...rest] = text.split(/(?<=\.)\s+(?=[A-Z`])/);
	const more = rest.join(" ");
	if (!more) return <PropDescription text={lead} />;

	return (
		<Collapsible.Root open={open} onOpenChange={setOpen}>
			<Collapsible.Trigger className="d:f ai:fs jc:sb g:3 w:100% p:0 bw:0 bg:transparent c:ink/80 ta:l c:p fv:os:s fv:ow:2 fv:oo:2 fv:oc:accent">
				<span>
					<PropDescription text={lead} />
				</span>
				<NavArrowDown
					aria-hidden
					className={`fs:0 w:3 h:3 mt:1 tp:t tdu:150 @prm:tp:none ${open ? "ro:36 c:accent" : "c:ink/40"}`}
				/>
			</Collapsible.Trigger>
			<Collapsible.Panel className="h:var(--collapsible-panel-height) o:h tp:a tdu:250 ttf:out-quart opening:h:0 opening:o:0 closing:h:0 closing:o:0 closing:tdu:150 closing:ttf:in-out-cubic @prm:tp:none">
				<p className="m:0 pt:1">
					<PropDescription text={more} />
				</p>
			</Collapsible.Panel>
		</Collapsible.Root>
	);
}

/** A component's whole Component API, as a table below its preview. */
export function ApiTable({ primitives }: { primitives: Primitives }) {
	const playground = usePlayground();
	const props = inTableOrder(playground?.meta?.props ?? []);
	if (!playground || props.length === 0) return null;

	const target = getRegistryTarget(playground.id);
	const primitive = primitiveSlug(primitives, target.component, target.install);
	// the docs' own table, so the API reads like every other table on the site
	const th = "px:2 @md:px:4 py:2 bc:border c:ink bw:1 ta:l fw:500";
	const td = "px:2 @md:px:4 py:2 bc:border c:ink/80 bw:1 va:t";

	return (
		<section>
			<div className="d:f ai:c jc:sb g:2 mt:12 mb:4">
				<h2 className="m:0 ff:display c:ink fs:xxl fw:400 lh:1">
					Component API
				</h2>
				{primitive && (
					<Link
						href={`https://base-ui.com/react/components/${primitive}`}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Base UI reference"
						className="d:f ai:c jc:c fs:0 c:ink/70 td:none h:c:ink fv:oc:accent fv:ow:2"
					>
						<BaseUI className="w:4 h:4" />
					</Link>
				)}
			</div>
			<div className="ox:auto">
				<table className="w:100% bc:border bg:transparent bc:c">
					<thead className="bg:surface">
						<tr>
							<th className={th}>Prop</th>
							<th className={th}>Type</th>
							<th className={th}>Default</th>
							<th className={`${th} d:none @md:d:tc`}>Description</th>
						</tr>
					</thead>
					<tbody>
						{props.map((prop) => (
							<Fragment key={prop.name}>
								<tr>
									<td className={td}>
										<code className="c:code ff:m ws:nw">{prop.name}</code>
									</td>
									<td className={td}>
										<code className="c:code ff:m">
											{/* an enum wraps between its values, never inside one */}
											{typeOf(prop)
												.split(" | ")
												.map((value, index) => (
													<span key={value}>
														{index > 0 && " | "}
														<span className="ws:nw">{value}</span>
													</span>
												))}
										</code>
									</td>
									<td className={td}>
										{prop.default === undefined ? (
											"-"
										) : (
											<code className="c:code ff:m ws:nw">
												{String(prop.default)}
											</code>
										)}
									</td>
									<td className={`${td} d:none @md:d:tc`}>
										<Summary text={prop.description} />
									</td>
								</tr>
								{/* below @md the description takes a row of its own */}
								<tr className="@md:d:none">
									<td colSpan={3} className={td}>
										<Summary text={prop.description} />
									</td>
								</tr>
							</Fragment>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

const SWATCHES = ACCENTS.map((family) => ({
	value: family,
	colors: accentBars(family),
}));

/** Shape, Accent and Scheme, the preview's styling. */
export function Look() {
	const playground = usePlayground();
	if (!playground) return null;
	const line = (name: string, control: React.ReactNode) => (
		<div className="d:f fw:w ai:c jc:sb g:2 py:2 bc:border bbw:1">
			<code className="c:code fs:xs ff:m">{name}</code>
			{control}
		</div>
	);

	return (
		<div className="d:f fd:c pb:4 mb:4">
			<p className="m:0 mb:1 c:ink/60 fs:xs lh:4">
				The shape, accent & scheme set the preview only.
			</p>
			{line(
				"shape",
				<EnumSelect
					name="shape"
					values={SHAPES}
					value={playground.shape}
					onChange={(value) => playground.setShape(String(value))}
				/>,
			)}
			{line(
				"accent",
				<SwatchSelect
					name="accent"
					options={SWATCHES}
					value={playground.accent}
					onChange={playground.setAccent}
				/>,
			)}
			{line(
				"scheme",
				<EnumSelect
					name="scheme"
					values={[...SCHEMES]}
					value={playground.scheme}
					onChange={(value) => playground.setScheme(value as Scheme)}
				/>,
			)}
		</div>
	);
}
