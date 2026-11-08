"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Box {
	top: number;
	left: number;
	width: number;
	height: number;
}

/**
 * A highlight that slides to the item matching `selector` in its parent, as
 * Tabs' indicator does. It measures again whenever `at` changes.
 */
export default function Glide({
	selector,
	at,
	className = "",
}: {
	selector: string;
	at: unknown;
	className?: string;
}) {
	const self = useRef<HTMLSpanElement>(null);
	const [box, setBox] = useState<Box | null>(null);
	// the first placement jumps, so the highlight never flies in from a corner
	const [ready, setReady] = useState(false);

	useLayoutEffect(() => {
		const root = self.current?.parentElement;
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
		const target = root.querySelector(selector);
		if (target) observer.observe(target);
		return () => observer.disconnect();
	}, [selector, at]);

	useEffect(() => {
		if (!box) return setReady(false);
		if (ready) return;
		const frame = requestAnimationFrame(() => setReady(true));
		return () => cancelAnimationFrame(frame);
	}, [box, ready]);

	return (
		<span
			ref={self}
			aria-hidden
			className={`p:a t:0 l:0 pe:none ${ready ? "tp:a tdu:300 ttf:out-quart @prm:tp:none" : ""} ${box ? className : ""}`}
			style={
				box
					? {
							transform: `translate(${box.left}px, ${box.top}px)`,
							width: box.width,
							height: box.height,
						}
					: undefined
			}
		/>
	);
}
