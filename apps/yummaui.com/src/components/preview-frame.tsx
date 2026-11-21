"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

const RESET = `
  html, body { height: 100%; }
  html { color-scheme: light; }
  body {
    margin: 0;
    display: flex;
    align-items: safe center;
    justify-content: safe center;
    background: light-dark(#fff, #1f2023);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica,
      Arial, sans-serif;
  }
  /* Full width, and centring its own child rather than leaning on the body:
     a component asking for 100% of its container needs a container with a
     width. A separator got 0 of a shrink-to-fit root and drew nothing. */
  #root {
    box-sizing: border-box;
    width: 100%;
    padding: 2.5rem;
    display: flex;
    align-items: safe center;
    justify-content: safe center;
  }
  /* Height is the same story but only safe on a frame that has one of its own.
     An auto-height frame is sized *from* this element, so handing a percentage
     back would be the loop described above. */
  #root[data-fill] { height: 100%; }
  @media (max-width: 480px) { #root { padding: 1rem; } }
  /* a block fills the frame to its edges, as it would a page */
  #root[data-bleed] { padding: 0; }
`;

let sheet: string | null = null;
let counted = -1;

// copied again whenever the page gains a sheet, such as a component's own stylesheet loading late
function pageStyles(): string {
	if (sheet !== null && document.styleSheets.length === counted) return sheet;
	counted = document.styleSheets.length;

	const parts: string[] = [];
	for (const style of document.styleSheets) {
		try {
			for (const rule of style.cssRules) parts.push(rule.cssText);
		} catch {}
	}

	sheet = parts.join("\n");
	return sheet;
}

const ContainerContext = createContext<HTMLElement | null>(null);

export function usePreviewContainer() {
	return useContext(ContainerContext);
}

interface Props {
	children: ReactNode;
	minHeight?: number | string;
	fill?: boolean;
	/** No padding round the scene, so a block such as a sidebar meets the edges. */
	bleed?: boolean;
	accentCss?: string;
	className?: string;
}

export default function PreviewFrame({
	children,
	minHeight = 240,
	fill = false,
	bleed = false,
	accentCss = "",
	className = "",
}: Props) {
	const holder = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLIFrameElement>(null);
	const [near, setNear] = useState(false);
	const [body, setBody] = useState<HTMLElement | null>(null);
	const [measured, setMeasured] = useState(0);

	useEffect(() => {
		const element = holder.current;
		if (!element) return;

		if (typeof IntersectionObserver === "undefined") {
			setNear(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setNear(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "400px" },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!near) return;
		const element = frame.current;
		if (!element) return;

		const attach = () => {
			const target = element.contentDocument;
			if (!target?.body) return;
			if (target.getElementById("root")) return;

			const page = target.createElement("style");
			page.textContent = pageStyles();
			const base = target.createElement("style");
			base.textContent = RESET;
			target.head.append(page, base);
			const refresh = () => {
				page.textContent = pageStyles();
			};
			watch?.disconnect();
			watch = new MutationObserver(refresh);
			watch.observe(document.head, { childList: true });
			document.head.addEventListener("load", refresh, true);
			unload = () => document.head.removeEventListener("load", refresh, true);

			const accent = target.createElement("style");
			accent.id = "accent";
			target.head.append(accent);

			// a preview never leaves the page: links and forms do nothing
			target.addEventListener(
				"click",
				(event) => {
					const link = (event.target as Element | null)?.closest?.("a[href]");
					if (link) event.preventDefault();
				},
				true,
			);
			target.addEventListener(
				"submit",
				(event) => event.preventDefault(),
				true,
			);

			// a tap on a control brings the whole frame into view, so what it opens fits
			// without a scroll; a touch that starts a scroll is not a tap, so it is left alone
			target.addEventListener(
				"click",
				(event) => {
					const control = (event.target as Element | null)?.closest?.(
						"button, input, select, textarea, [role]",
					);
					if (!control) return;
					const box = element.getBoundingClientRect();
					const top = 64;
					if (box.top >= top && box.bottom <= window.innerHeight) return;
					window.scrollBy({ top: box.top - top, behavior: "smooth" });
				},
				true,
			);

			const root = target.createElement("div");
			root.id = "root";
			if (fill) root.dataset.fill = "";
			if (bleed) root.dataset.bleed = "";
			target.body.append(root);

			setBody(root);
		};

		let watch: MutationObserver | undefined;
		let unload = () => {};
		attach();
		element.addEventListener("load", attach);
		return () => {
			element.removeEventListener("load", attach);
			watch?.disconnect();
			unload();
		};
	}, [near, fill, bleed]);

	// the root is built once, so a preview that starts filling the frame later updates it here
	useEffect(() => {
		if (!body) return;
		if (bleed) body.dataset.bleed = "";
		else delete body.dataset.bleed;
	}, [body, bleed]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `body` is the remount signal, not a value read
	useEffect(() => {
		const style = frame.current?.contentDocument?.getElementById("accent");
		if (style) style.textContent = accentCss;
	}, [accentCss, body]);

	useEffect(() => {
		if (!body || fill) return;

		const measure = () => setMeasured(Math.ceil(body.scrollHeight));

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(body);
		return () => observer.disconnect();
	}, [body, fill]);

	return (
		<div
			ref={holder}
			className={`min-h:var(--min-h) ${fill ? "d:f fd:c" : ""} ${className}`}
			style={
				{
					"--min-h":
						typeof minHeight === "number" ? `${minHeight}px` : minHeight,
				} as CSSProperties
			}
		>
			{near && (
				<iframe
					ref={frame}
					title="Component preview"
					className={`d:b w:100% bw:0 ${fill ? "f:1 min-h:0" : "h:var(--frame-h) min-h:var(--min-h)"}`}
					style={
						fill
							? undefined
							: ({
									"--frame-h": `${measured}px`,
								} as CSSProperties)
					}
				/>
			)}
			{body &&
				createPortal(
					<ContainerContext value={body}>{children}</ContainerContext>,
					body,
				)}
		</div>
	);
}
