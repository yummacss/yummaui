"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Drawer } from "@base-ui/react/drawer";
import { Resizable } from "re-resizable";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayground } from "@/components/playground/context";
import PreviewFrame, { usePreviewContainer } from "@/components/preview-frame";
import { Tabs, TabsPanel } from "@/components/tabs";
import TokenBlock from "@/components/ui/token-block";
import { Close, Code, Gear, Globe, Sliders } from "@/icons";
import {
	getRegistryTarget,
	type RegistryMeta,
	registryConfig,
} from "@/registry";
import { accentCss, DEFAULT_ACCENT } from "@/utils/accent";
import { type DemoProps, renderScene, sceneIds } from "@/utils/demo";
import {
	getCachedRegistryComponent,
	loadRegistryComponent,
} from "@/utils/prefetch-registry";
import { schemeCss } from "@/utils/scheme";
import { buildConfig, buildScene } from "@/utils/snippet";
import { DEFAULT_SHAPE } from "@/utils/shapes.mjs";

const FILL = "d:f fd:c f:1 min-h:0";

const LANGUAGE: Record<string, string> = {
	preview: "Preview",
	code: "TSX",
	config: "JavaScript",
};

// a block's frame drags narrower from its right edge, snapping to phone & tablet
const SNAP = [
	{ width: 392, label: "Phone", left: "l:98" },
	{ width: 768, label: "Tablet", left: "l:192" },
];
// how close the edge comes before a guide lights up, and before it snaps
const NEAR = 48;
const SNAP_GAP = 24;

const TOOL =
	"d:f ai:c g:2 h:9 px:3 bw:0 bg:transparent fs:xs ff:m ws:nw c:p h:c:ink fv:os:s fv:ow:2 fv:oo:-2 fv:oc:accent";

const DIVIDER = <span aria-hidden className="fs:0 w:0 h:4 blw:1 bc:border" />;

export default function ComponentPlayground({
	block = false,
	api,
}: {
	block?: boolean;
	/** A block's styling controls, opened in a drawer from the toolbar. */
	api?: ReactNode;
}) {
	const playground = usePlayground();
	const [tab, setTab] = useState("preview");
	const [width, setWidth] = useState<number | null>(null);
	const [resizing, setResizing] = useState(false);
	// the snap point the edge just landed on, lit for a moment
	const [flash, setFlash] = useState<number | null>(null);
	const snapped = useRef<number | null>(null);
	const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	const track = (next: number) => {
		setWidth(next);
		const point = SNAP.find((snap) => snap.width === next)?.width ?? null;
		if (point !== null && point !== snapped.current) {
			setFlash(point);
			clearTimeout(flashTimer.current);
			flashTimer.current = setTimeout(() => setFlash(null), 120);
		}
		snapped.current = point;
	};

	const id = playground?.id ?? "";
	const scene = playground?.meta?.scene;
	const shape = playground?.shape ?? DEFAULT_SHAPE;
	const accent = playground?.accent ?? DEFAULT_ACCENT;
	const scheme = playground?.scheme ?? "light";

	// a drag re-renders the stage on every move, so the frame is built once per look
	const frame = useMemo(
		() =>
			scene ? (
				<PreviewFrame
					className={`f:1 min-h:0 ${block ? "bg:page" : ""}`}
					minHeight={0}
					fill
					accentCss={[accentCss(accent), schemeCss(scheme)].join("\n")}
				>
					<Scene scene={scene} shape={shape} />
				</PreviewFrame>
			) : null,
		[scene, shape, accent, scheme, block],
	);

	if (!id || !scene) return null;
	const usage = buildScene(scene);

	const config = registryConfig[getRegistryTarget(id).install];
	// a page without a config tab falls back to the code it does have
	const active = tab === "config" && !config ? "code" : tab;

	return (
		// below @lg: the stage fills the screen under the navbar, so a popup fits it
		<div
			className={
				block
					? "d:f fd:c h:180 mt:6 bg:page"
					: "d:f fd:c h:calc(100svh-5rem) mt:6 bg:page @lg:f:1 @lg:min-h:0 @lg:h:auto @lg:mt:0"
			}
		>
			<Tabs value={active} onValueChange={setTab} className={FILL}>
				<div className="d:f ai:c bbw:1 bc:border bg:page">
					<BaseTabs.List className="d:f ai:c min-w:0 ox:auto">
						<FileTab value="preview" icon={<Globe className="w:4 h:4" />}>
							Preview
						</FileTab>
						{DIVIDER}
						<FileTab value="code" icon={<Code className="w:4 h:4" />}>
							Code
						</FileTab>
						{config && (
							<>
								{DIVIDER}
								<FileTab value="config" icon={<Gear className="w:4 h:4" />}>
									Configuration
								</FileTab>
							</>
						)}
					</BaseTabs.List>
					<div className="d:f ai:c jc:fe f:1">
						{block && active === "preview" && width !== null && (
							<span className="px:2 c:ink/50 fs:xs ff:m fvn:tn">{width}px</span>
						)}
						{block && api && (
							<Drawer.Root swipeDirection="right">
								<Drawer.Trigger className={`${TOOL} c:ink/60`}>
									<Sliders className="w:4 h:4" />
									Styling
								</Drawer.Trigger>
								<Drawer.Portal>
									{/* the search dialog's backdrop, so every overlay on the site dims alike */}
									<Drawer.Backdrop
										data-chrome
										className="tp:o tdu:300 ttf:out-quart opening:o:0 closing:o:0 closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none p:f zi:10 i:0 bg:black/60 bf-b:sm fgr:90"
									/>
									<Drawer.Viewport className="d:f p:f i:0 zi:20 jc:fe">
										<Drawer.Popup
											data-chrome
											className="d:f fd:c g:6 h:100% w:104 max-w:100% p:6 oy:auto bg:page blw:1 bc:border os:none ttx:var(--drawer-swipe-movement-x) opening:ttx:full closing:ttx:full tp:t tdu:300 ttf:out-quart closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none"
										>
											<div className="d:f ai:c jc:sb">
												<div className="d:f fd:c g:1">
													<Drawer.Title className="m:0 ff:display fs:xxl fw:400 c:ink">
														Styling
													</Drawer.Title>
													<Drawer.Description className="m:0 c:ink/60 fs:sm">
														Suit your style.
													</Drawer.Description>
												</div>
												<Drawer.Close
													aria-label="Close"
													className={`${TOOL} c:ink/60`}
												>
													<Close className="w:4 h:4" />
												</Drawer.Close>
											</div>
											{api}
										</Drawer.Popup>
									</Drawer.Viewport>
								</Drawer.Portal>
							</Drawer.Root>
						)}
					</div>
				</div>

				<TabsPanel
					value="preview"
					className={block ? `${FILL} p:r bg:ink/3` : FILL}
				>
					{block && resizing && (
						<div aria-hidden className="p:a i:0 pe:none zi:10">
							{SNAP.map((point) => {
								const near =
									width !== null && Math.abs(width - point.width) <= NEAR;
								return (
									<span
										key={point.width}
										className={`d:f p:a t:0 b:0 w:0 blw:1 tp:c tdu:150 ${point.left} ${
											near ? "bc:accent" : "bc:ink/10"
										}`}
									>
										{/* lights at once on a snap, then fades */}
										<span
											className={`p:a t:0 b:0 w:2 ml:-1 bg:accent tp:o @prm:tp:none ${
												flash === point.width
													? "o:60"
													: "o:0 tdu:500 ttf:out-quart"
											}`}
										/>
										<span
											className={`p:a t:2 l:2 fs:xs ff:m ws:nw tp:c tdu:150 ${
												near ? "c:accent" : "c:ink/40"
											}`}
										>
											{point.label} {point.width}
										</span>
									</span>
								);
							})}
						</div>
					)}
					{block ? (
						<Resizable
							defaultSize={{ width: "100%", height: "100%" }}
							minWidth={320}
							maxWidth="100%"
							enable={{ right: true }}
							snap={{ x: SNAP.map((point) => point.width) }}
							snapGap={SNAP_GAP}
							onResizeStart={() => setResizing(true)}
							onResize={(_event, _direction, element) =>
								track(element.offsetWidth)
							}
							onResizeStop={(_event, _direction, element) => {
								setResizing(false);
								track(element.offsetWidth);
							}}
							// a phone has no room to drag, so the handle is a tablet & desktop thing
							handleClasses={{ right: "d:none @md:d:b" }}
							// the grip alone resizes, inset from the frame's edge
							handleStyles={{
								right: {
									top: "50%",
									right: 4,
									width: 16,
									height: 72,
									marginTop: -36,
									zIndex: 20,
								},
							}}
							handleComponent={{
								// the mobile navigation sheet's handle, stood upright
								right: (
									<span className="d:f ai:c jc:c w:100% h:100% c:er">
										<span
											className={`w:1 h:14 tp:c tdu:150 ${
												resizing ? "bg:ink/40" : "bg:border"
											}`}
										/>
									</span>
								),
							}}
							className="d:f fd:c brw:1 bc:border"
						>
							<div
								className={`d:f fd:c f:1 min-h:0 ${resizing ? "pe:none" : ""}`}
							>
								{frame}
							</div>
						</Resizable>
					) : (
						frame
					)}
				</TabsPanel>

				<TabsPanel value="code" className={FILL}>
					<TokenBlock tokens={usage} bar={false} className={FILL} fill />
				</TabsPanel>

				{config && (
					<TabsPanel value="config" className={FILL}>
						<TokenBlock
							tokens={buildConfig(config)}
							bar={false}
							className={FILL}
							fill
						/>
					</TabsPanel>
				)}

				<div className="d:f ai:c jc:sb h:6 px:3 btw:1 bc:border bg:page c:ink/60 fs:xs ff:m us:none">
					<span>{getRegistryTarget(id).install}</span>
					<span>{LANGUAGE[active]}</span>
				</div>
			</Tabs>
		</div>
	);
}

function FileTab({
	value,
	icon,
	children,
}: {
	value: string;
	icon: ReactNode;
	children: ReactNode;
}) {
	return (
		<BaseTabs.Tab
			value={value}
			className={(state) => `${TOOL} ${state.active ? "c:ink" : "c:ink/50"}`}
			style={{ fontFamily: "inherit" }}
		>
			{icon}
			{children}
		</BaseTabs.Tab>
	);
}

function loaded(ids: string[]) {
	return Object.fromEntries(
		ids.map((id) => [id, getCachedRegistryComponent(id)]),
	) as Record<string, ComponentType<DemoProps> | null>;
}

function Scene({
	scene,
	shape,
}: {
	scene: NonNullable<RegistryMeta["scene"]>;
	shape: string;
}) {
	const container = usePreviewContainer();
	const playground = usePlayground();
	const ids = useMemo(() => sceneIds(scene), [scene]);
	const [components, setComponents] = useState(() => loaded(ids));

	useEffect(() => {
		let live = true;
		void Promise.all(ids.map((id) => loadRegistryComponent(id))).then(() => {
			if (live) setComponents(loaded(ids));
		});
		return () => {
			live = false;
		};
	}, [ids]);

	// a scene draws whole or not at all, so nothing jumps in as it loads
	if (ids.some((id) => !components[id])) return null;
	return renderScene(
		scene,
		components as Record<string, ComponentType<DemoProps>>,
		shape,
		container,
		{
			values: playground?.sceneValues ?? {},
			set: playground?.setSceneValue ?? (() => {}),
		},
	);
}
