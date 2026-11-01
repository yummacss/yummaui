// React Bits Topography (https://reactbits.dev, MIT + Commons Clause), with Yumma classes for its two CSS rules and its renderer in a worker
"use client";

import { useEffect, useRef, useState } from "react";
import {
	type Input,
	mount,
	settingsOf,
	type TopographyProps,
} from "./topography-render";

export type {
	TopographyClickEffect,
	TopographyDirection,
	TopographyHoverEffect,
	TopographyMarkers,
	TopographyProps,
} from "./topography-render";

const Topography = (props: TopographyProps) => {
	const { className = "", style } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const [generation, setGeneration] = useState(0);
	const settings = settingsOf(props);
	const settingsRef = useRef(settings);
	settingsRef.current = settings;
	const sendRef = useRef<((input: Input) => void) | null>(null);
	const sentRef = useRef("");

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return undefined;
		// a fresh canvas per mount: a canvas hands its control to a worker only once
		const canvas = document.createElement("canvas");
		canvas.className = "d:b w:100% h:100%";
		canvas.setAttribute("aria-hidden", "true");
		container.append(canvas);

		const reduce =
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
		const initial = settingsRef.current;
		const restored = () => setGeneration((value) => value + 1);
		let worker: Worker | null = null;
		let renderer: ReturnType<typeof mount> = null;
		if (
			"transferControlToOffscreen" in canvas &&
			typeof Worker !== "undefined"
		) {
			const offscreen = canvas.transferControlToOffscreen();
			worker = new Worker(new URL("./topography.worker.ts", import.meta.url));
			worker.onmessage = restored;
			worker.postMessage(
				{
					type: "init",
					canvas: offscreen,
					settings: initial,
					reduce,
					ratio: window.devicePixelRatio,
				},
				[offscreen],
			);
		} else {
			renderer = mount(
				canvas,
				initial,
				reduce,
				restored,
				window.devicePixelRatio,
			);
		}
		const send = (input: Input) => {
			if (worker) worker.postMessage(input);
			else renderer?.send(input);
		};
		sendRef.current = send;
		sentRef.current = JSON.stringify(initial);

		const resize = () =>
			send({
				type: "resize",
				width: container.clientWidth,
				height: container.clientHeight,
				ratio: window.devicePixelRatio || 1,
			});
		let intersecting = true;
		const visibility = () =>
			send({ type: "visible", visible: intersecting && !document.hidden });
		const pointer = (event: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const kind =
				event.type === "pointermove"
					? "move"
					: event.type === "pointerdown"
						? "down"
						: "up";
			send({
				type: "pointer",
				kind,
				touch: event.pointerType === "touch",
				x,
				y,
				inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
			});
		};
		const leave = () =>
			send({
				type: "pointer",
				kind: "leave",
				touch: false,
				x: 0,
				y: 0,
				inside: false,
			});

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);
		const intersection = new IntersectionObserver((entries) => {
			intersecting = entries.some((entry) => entry.isIntersecting);
			visibility();
		});
		intersection.observe(container);
		window.addEventListener("pointermove", pointer, { passive: true });
		window.addEventListener("pointerdown", pointer, { passive: true });
		window.addEventListener("pointerup", pointer, { passive: true });
		window.addEventListener("pointercancel", pointer, { passive: true });
		document.documentElement.addEventListener("pointerleave", leave);
		document.addEventListener("visibilitychange", visibility);
		resize();

		return () => {
			sendRef.current = null;
			resizeObserver.disconnect();
			intersection.disconnect();
			window.removeEventListener("pointermove", pointer);
			window.removeEventListener("pointerdown", pointer);
			window.removeEventListener("pointerup", pointer);
			window.removeEventListener("pointercancel", pointer);
			document.documentElement.removeEventListener("pointerleave", leave);
			document.removeEventListener("visibilitychange", visibility);
			worker?.terminate();
			renderer?.dispose();
			canvas.remove();
		};
	}, [generation]);

	useEffect(() => {
		const next = JSON.stringify(settings);
		if (next === sentRef.current) return;
		sentRef.current = next;
		sendRef.current?.({ type: "settings", settings });
	});

	return (
		<div
			ref={containerRef}
			className={`p:r w:100% h:100% o:h ${className}`.trim()}
			style={style}
		/>
	);
};

export default Topography;
