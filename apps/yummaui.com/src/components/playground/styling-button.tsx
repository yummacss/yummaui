"use client";

import { Drawer } from "@base-ui/react/drawer";
import { Look } from "@/components/playground/api";
import { usePlayground } from "@/components/playground/context";
import { Close, Palette } from "@/icons";

const ROUND =
	"d:f ai:c jc:c h:8 br:9999 bc:border bg:surface h:bg:hover a:bg:press c:ink bw:1 fv:oc:ink fv:oo:2";

/** The Styling drawer's trigger, beside the page arrows on a component page. */
export default function StylingButton() {
	const playground = usePlayground();
	if (!playground) return null;

	return (
		<Drawer.Root swipeDirection="right">
			<Drawer.Trigger
				aria-label="Styling"
				className={`${ROUND} g:2 px:2 fs:sm @sm:pl:3 @sm:pr:4`}
			>
				<Palette className="w:4 h:4" />
				<span aria-hidden className="d:none @sm:d:i">
					Styling
				</span>
			</Drawer.Trigger>
			<Drawer.Portal>
				{/* the search dialog's backdrop, so every overlay on the site dims alike */}
				<Drawer.Backdrop
					data-chrome
					className="tp:o tdu:300 ttf:out-quart opening:o:0 closing:o:0 closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none p:f zi:10 i:0 bg:black/30 bf-b:xs fgr:90"
				/>
				<Drawer.Viewport className="d:f p:f i:0 zi:20 jc:fe">
					<Drawer.Popup
						data-chrome
						className="d:f h:100% w:104 max-w:100% p:3 os:none ttx:var(--drawer-swipe-movement-x) opening:ttx:full closing:ttx:full tp:t tdu:300 ttf:out-quart closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none"
					>
						{/* the panel floats inside the popup's padding, so sliding the popup out takes it all the way off */}
						<div className="d:f fd:c g:6 f:1 min-w:0 p:6 oy:auto br:xl bw:1 bc:border bg:page bs-o:pop">
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
									className={`${ROUND} w:8 bs-o:key`}
								>
									<Close className="w:4 h:4" />
								</Drawer.Close>
							</div>
							<Drawer.Content>
								<Look />
							</Drawer.Content>
						</div>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
