"use client";

import { type RefObject, useEffect, useLayoutEffect, useState } from "react";

interface Box {
	top: number;
	left: number;
	width: number;
	height: number;
}

/**
 * A highlight that slides to the item in `container` matching `selector`, as
 * Tabs' indicator does. It measures again whenever `at` changes.
 */
export default function Glide({
	container,
	selector,
	at,
	className = "",
}: {
	container: RefObject<HTMLElement | null>;
	selector: string;
	at: unknown;
	className?: string;
}) {
	const [box, setBox] = useState<Box | null>(null);
	// the first placement jumps, so the highlight never flies in from a corner
	const [ready, setReady] = useState(false);

	useLayoutEffect(() => {
		const root = container.current;
		if (!root) return;
		const measure = () => {
			const target = root.querySelector<HTMLElement>(selector);
			if (!target) return setBox(null);
			const outer = root.getBoundingClientRect();
			const inner = target.getBoundingClientRect();
			setBox({
				top: inner.top - outer.top + root.scrollTop,
				left: inner.left - outer.left + root.scrollLeft,
				width: inner.width,
				height: inner.height,
			});
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	}, [container, selector, at]);

	useEffect(() => {
		if (!box) return setReady(false);
		if (ready) return;
		const frame = requestAnimationFrame(() => setReady(true));
		return () => cancelAnimationFrame(frame);
	}, [box, ready]);

	if (!box) return null;
	return (
		<span
			aria-hidden
			className={`p:a t:0 l:0 pe:none ${ready ? "tp:a tdu:300 ttf:out-quart @prm:tp:none" : ""} ${className}`}
			style={{
				transform: `translate(${box.left}px, ${box.top}px)`,
				width: box.width,
				height: box.height,
			}}
		/>
	);
}
