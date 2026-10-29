"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Drawer } from "@base-ui/react/drawer";
import { Resizable } from "re-resizable";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePlayground } from "@/components/playground/context";
import PreviewFrame, { usePreviewContainer } from "@/components/preview-frame";
import { Tabs, TabsPanel } from "@/components/tabs";
import TokenBlock from "@/components/ui/token-block";
import { Close, Code, Eye, Gear, Sliders } from "@/icons";
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

// the markdown code tabs' own classes (code-tabs.tsx): the open tab has no bottom edge
const FILE_TAB =
	"d:f ai:c px:4 py:2 @sm:px:6 m:0 brw:1 bc:border fs:sm ff:m ws:nw c:p a:none fv:os:s fv:ow:2 fv:oo:-2 fv:oc:accent";

const LANGUAGE: Record<string, string> = {
	preview: "Preview",
	code: "TSX",
	config: "JavaScript",
};

// a block's frame drags narrower from its right edge, snapping to phone & tablet
const SNAP = [390, 768];

const TOOL =
	"d:f ai:c g:2 h:8 px:3 bw:0 bg:transparent c:ink/60 fs:xs ff:m c:p h:c:ink fv:os:s fv:ow:2 fv:oo:-2 fv:oc:accent";

export default function ComponentPlayground({
	block = false,
	api,
}: {
	block?: boolean;
	/** A block's Look & Component API, opened in a drawer from the toolbar. */
	api?: ReactNode;
}) {
	const playground = usePlayground();
	const [tab, setTab] = useState("preview");
	const [width, setWidth] = useState<number | null>(null);
	const [resizing, setResizing] = useState(false);

	const id = playground?.id ?? "";
	const scene = playground?.meta?.scene;
	if (!id || !scene) return null;
	const shape = playground?.shape ?? DEFAULT_SHAPE;
	const accent = playground?.accent ?? DEFAULT_ACCENT;
	const scheme = playground?.scheme ?? "light";
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
				<div className="d:f bg:page">
					<BaseTabs.List className="d:f min-w:0 ox:auto">
						<FileTab value="preview" icon={<Eye className="w:4 h:4" />}>
							Preview
						</FileTab>
						<FileTab value="code" icon={<Code className="w:4 h:4" />}>
							page.tsx
						</FileTab>
						{config && (
							<FileTab value="config" icon={<Gear className="w:4 h:4" />}>
								yumma.config.mjs
							</FileTab>
						)}
					</BaseTabs.List>
					<div className="d:f ai:c jc:fe f:1 pr:1 bbw:1 bc:border">
						{block && active === "preview" && width !== null && (
							<span className="px:2 c:ink/50 fs:xs ff:m fvn:tn">{width}px</span>
						)}
						{block && api && (
							<Drawer.Root swipeDirection="right">
								<Drawer.Trigger className={TOOL}>
									<Sliders className="w:4 h:4" />
									Component API
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
											className="d:f fd:c g:6 h:100% w:104 max-w:100% p:6 oy:auto bg:page blw:1 bc:border os:none tr:var(--drawer-travel) opening:tr:var(--drawer-offstage) closing:tr:var(--drawer-offstage) tp:t tdu:300 ttf:out-quart closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none"
											style={
												{
													"--drawer-travel": "var(--drawer-swipe-movement-x) 0",
													"--drawer-offstage": "calc(100% + 2px) 0",
												} as CSSProperties
											}
										>
											<div className="d:f ai:c jc:sb">
												<Drawer.Title className="m:0 ff:display fs:xxl fw:400 c:ink">
													Component API
												</Drawer.Title>
												<Drawer.Close aria-label="Close" className={TOOL}>
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
					className={block ? `${FILL} bg:ink/3` : FILL}
				>
					{block ? (
						<Resizable
							defaultSize={{ width: "100%", height: "100%" }}
							minWidth={320}
							maxWidth="100%"
							enable={{ right: true }}
							handleStyles={{ right: { width: 16, right: -8 } }}
							snap={{ x: SNAP }}
							snapGap={32}
							onResizeStart={() => setResizing(true)}
							onResize={(_event, _direction, element) =>
								setWidth(element.offsetWidth)
							}
							onResizeStop={(_event, _direction, element) => {
								setResizing(false);
								setWidth(element.offsetWidth);
							}}
							handleComponent={{
								right: (
									<span className="d:f ai:c jc:c w:100% h:100% c:er tp:c tdu:150 h:bg:accent/5">
										<span
											className={`w:1 h:14 br:9999 tp:a tdu:150 ttf:out-quart ${
												resizing ? "bg:accent h:20" : "bg:ink/25"
											}`}
										/>
									</span>
								),
							}}
							className="d:f fd:c brw:1 bc:border"
						>
							<PreviewFrame
								className={
									block
										? `f:1 min-h:0 bg:page ${resizing ? "pe:none" : ""}`
										: "f:1 min-h:0"
								}
								minHeight={0}
								fill
								accentCss={[accentCss(accent), schemeCss(scheme)].join("\n")}
							>
								<Scene scene={scene} shape={shape} />
							</PreviewFrame>
						</Resizable>
					) : (
						<PreviewFrame
							className={
								block
									? `f:1 min-h:0 bg:page ${resizing ? "pe:none" : ""}`
									: "f:1 min-h:0"
							}
							minHeight={0}
							fill
							accentCss={[accentCss(accent), schemeCss(scheme)].join("\n")}
						>
							<Scene scene={scene} shape={shape} />
						</PreviewFrame>
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
			className={(state) =>
				`${FILE_TAB} ${state.active ? "c:accent bg:surface" : "c:accent-dim bg:transparent bbw:1"}`
			}
			style={{ fontFamily: "inherit" }}
		>
			<span className="d:f ai:c g:2">
				{icon}
				{children}
			</span>
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
