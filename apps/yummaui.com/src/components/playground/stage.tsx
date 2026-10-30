"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Drawer } from "@base-ui/react/drawer";
import { Resizable } from "re-resizable";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
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
	config: "JavaScript module",
};

// a resizable frame drags narrower from its right edge, down to a phone, and
// snaps to a tablet
const PHONE = 392;
const SNAP = [768];
const SNAP_GAP = 24;

const TOOL =
	"d:f ai:c g:2 h:9 px:3 bw:0 bg:transparent fs:xs ff:m ws:nw c:p h:c:ink fv:os:s fv:ow:2 fv:oo:-2 fv:oc:accent";

const DIVIDER = <span aria-hidden className="fs:0 w:0 h:4 blw:1 bc:border" />;

export default function ComponentPlayground({
	resizable = false,
	styling,
}: {
	/** The frame drags narrower, for a whole screen region rather than one control. */
	resizable?: boolean;
	/** The styling controls, opened in a drawer from the toolbar. */
	styling?: ReactNode;
}) {
	const playground = usePlayground();
	const [tab, setTab] = useState("preview");
	const [width, setWidth] = useState<number | null>(null);
	const [resizing, setResizing] = useState(false);
	// at full width the panel's border is the frame's, so the frame draws its own only when narrower
	const [narrowed, setNarrowed] = useState(false);
	const track = (element: HTMLElement) => {
		const next = element.offsetWidth;
		setWidth(next);
		setNarrowed(next < (element.parentElement?.clientWidth ?? next));
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
					className="f:1 min-h:0 bg:page"
					minHeight={0}
					fill
					accentCss={[accentCss(accent), schemeCss(scheme)].join("\n")}
				>
					<Scene scene={scene} shape={shape} />
				</PreviewFrame>
			) : null,
		[scene, shape, accent, scheme],
	);

	if (!id || !scene) return null;
	const usage = buildScene(scene);

	const config = registryConfig[getRegistryTarget(id).install];
	// a page without a config tab falls back to the code it does have
	const active = tab === "config" && !config ? "code" : tab;

	return (
		<div className={`d:f fd:c mt:6 bg:page ${resizable ? "h:180" : "h:150"}`}>
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
						{resizable && active === "preview" && width !== null && (
							<span className="px:2 c:ink/50 fs:xs ff:m fvn:tn">{width}px</span>
						)}
						{styling && (
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
											{styling}
										</Drawer.Popup>
									</Drawer.Viewport>
								</Drawer.Portal>
							</Drawer.Root>
						)}
					</div>
				</div>

				<TabsPanel
					value="preview"
					className={resizable ? `${FILL} p:r bg:press` : FILL}
				>
					{resizable ? (
						<Resizable
							defaultSize={{ width: "100%", height: "100%" }}
							minWidth={PHONE}
							maxWidth="100%"
							enable={{ right: true }}
							snap={{ x: SNAP }}
							snapGap={SNAP_GAP}
							onResizeStart={() => setResizing(true)}
							onResize={(_event, _direction, element) => track(element)}
							onResizeStop={(_event, _direction, element) => {
								setResizing(false);
								track(element);
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
							className={`d:f fd:c bc:border ${narrowed ? "brw:1" : ""}`}
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
			setScheme: playground?.setScheme,
		},
	);
}
