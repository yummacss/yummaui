"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";
import { usePlayground } from "@/components/playground/context";
import PreviewFrame from "@/components/preview-frame";
import CodeBlock from "@/components/ui/code-block";
import Badge from "@/registry/ui/badge";
import Button from "@/registry/ui/button";
import Checkbox from "@/registry/ui/checkbox";
import Field from "@/registry/ui/field";
import { RADIUS, Shape, type Shape as ShapeName } from "@/registry/ui/style";
import Switch from "@/registry/ui/switch";
import {
	ACCENTS,
	accentBars,
	accentCss,
	accentRoles,
	DEFAULT_ACCENT,
} from "@/utils/accent";
import { SCHEMES, type Scheme, schemeCss } from "@/utils/scheme";
import { SHAPES } from "@/utils/shapes.mjs";

const TILE =
	"d:f fd:c ai:c jc:c g:2 p:3 bg:surface bw:1 bc:border c:ink/70 fs:xs ff:m us:none c:p h:bc:ink/40 checked:bc:ink checked:c:ink fv:oo:-1 fv:oc:accent";

// the sample a shape tile draws, at the size of a control
const CORNER = "w:12 h:6 bg:ink/10 bw:2 bc:ink/60";

/** Shape, Accent & Scheme as tiles, a live set of parts, and the setup to copy. */
export function Look() {
	const playground = usePlayground();
	if (!playground) return null;
	const { shape, accent, scheme } = playground;

	return (
		<div className="d:f fd:c g:6 pb:4">
			<p className="m:0 c:ink/60 fs:xs lh:4">
				The shape, accent & scheme set the preview only. Copy the setup to use
				them in your app.
			</p>

			<Section title="shape">
				<RadioGroup
					aria-label="Shape"
					value={shape}
					onValueChange={(value) => playground.setShape(String(value))}
					className="d:g gtc:4 g:2"
				>
					{SHAPES.map((value) => (
						<Radio.Root key={value} value={value} className={TILE}>
							<span
								aria-hidden
								className={`${CORNER} ${RADIUS.control[value as ShapeName]}`}
							/>
							{value}
						</Radio.Root>
					))}
				</RadioGroup>
			</Section>

			<Section title="accent" value={accent}>
				<RadioGroup
					aria-label="Accent"
					value={accent}
					onValueChange={(value) => playground.setAccent(String(value))}
					className="d:g gtc:6 g:2"
				>
					{ACCENTS.map((family) => (
						<Radio.Root
							key={family}
							value={family}
							aria-label={family}
							className={`${TILE} p:2`}
						>
							<Bars colors={accentBars(family)} />
						</Radio.Root>
					))}
				</RadioGroup>
			</Section>

			<Section title="scheme">
				<RadioGroup
					aria-label="Scheme"
					value={scheme}
					onValueChange={(value) => playground.setScheme(value as Scheme)}
					className="d:g gtc:2 g:2"
				>
					{SCHEMES.map((value) => (
						<Radio.Root key={value} value={value} className={TILE}>
							<span
								aria-hidden
								className={`w:12 h:6 bw:1 bc:ink/20 ${value === "dark" ? "bg:black" : "bg:white"}`}
							/>
							{value}
						</Radio.Root>
					))}
				</RadioGroup>
			</Section>

			<Section title="preview">
				<PreviewFrame
					minHeight={0}
					className="bw:1 bc:border"
					accentCss={[accentCss(accent), schemeCss(scheme)].join("\n")}
				>
					<Shape value={shape as ShapeName}>
						<div className="d:f fd:c g:3 w:100%">
							<div className="d:f fw:w g:2">
								<Button>Save</Button>
								<Button variant="secondary">Cancel</Button>
								<Badge dot intent="success">
									Synced
								</Badge>
							</div>
							<Field label="File name" placeholder="quarterly-report" />
							<div className="d:f fw:w g:4">
								<Checkbox label="Show hidden files" defaultChecked />
								<Switch label="Autosave" defaultChecked />
							</div>
						</div>
					</Shape>
				</PreviewFrame>
			</Section>

			<Section title="setup">
				<CodeBlock lang="tsx" code={setup(shape, accent)} />
			</Section>
		</div>
	);
}

function Section({
	title,
	value,
	children,
}: {
	title: string;
	value?: string;
	children: ReactNode;
}) {
	return (
		<section className="d:f fd:c g:2">
			<h3 className="m:0 c:code fs:xs fw:400 ff:m">
				{title}
				{value && <span className="c:ink/50"> {value}</span>}
			</h3>
			{children}
		</section>
	);
}

// the Shape wrapper, and for an accent the colors to set in yummacss.config.mjs
function setup(shape: string, accent: string): string {
	const wrapper = `import { Shape } from "@/components/ui/style";

<Shape value="${shape}">{children}</Shape>`;
	if (accent === DEFAULT_ACCENT) return wrapper;
	const roles = Object.entries(accentRoles(accent))
		.map(
			([role, color]) =>
				`    ${/-/.test(role) ? `"${role}"` : role}: "${color}",`,
		)
		.join("\n");
	return `${wrapper}

// yummacss.config.mjs
theme: {
  colors: {
${roles}
  },
},`;
}

// a family as three of its shades
function Bars({ colors }: { colors: string[] }) {
	return (
		<span aria-hidden className="d:f fs:0 g:px">
			{colors.map((color) => (
				<span
					key={color}
					className="d:b w:1 h:3"
					style={{ backgroundColor: color }}
				/>
			))}
		</span>
	);
}
