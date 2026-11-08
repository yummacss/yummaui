"use client";

import React, { useEffect, useRef, useState } from "react";

interface StepperProps {
	children: React.ReactNode;
}

interface StepProps {
	children: React.ReactNode;
	title?: string;
}

interface InjectedStepProps {
	stepNumber?: number;
	isLast?: boolean;
	reached?: boolean;
	onReach?: () => void;
}

// a wave 8px wide, one swing every 20px, with round crests; a mask so a token colors it
const WAVE = `url("data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="8" height="20"><path d="M1.5 0C1.5 5 6.5 5 6.5 10S1.5 15 1.5 20" fill="none" stroke="#000" stroke-width="1.5"/></svg>',
)}")`;
const LINE = {
	left: -4,
	width: 8,
	top: 12,
	maskImage: WAVE,
	maskSize: "8px 20px",
	maskRepeat: "repeat-y",
	WebkitMaskImage: WAVE,
	WebkitMaskSize: "8px 20px",
	WebkitMaskRepeat: "repeat-y",
} as const;

/** Where a step's circle centers, 12px below the step's top. */
const center = (item?: Element | null) =>
	item instanceof HTMLElement ? item.offsetTop + 12 : 12;

export function Stepper({ children }: StepperProps) {
	const childArray = React.Children.toArray(children);
	const list = useRef<HTMLOListElement>(null);
	// the step the pointer or focus is on; the wave fills down to its circle
	const [at, setAt] = useState(0);
	const [fill, setFill] = useState(12);
	const [end, setEnd] = useState(12);

	useEffect(() => {
		const root = list.current;
		if (!root) return;
		const measure = () =>
			setEnd(center(root.querySelector(":scope > li:last-of-type")));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	const reach = (step: number) => {
		setAt(step);
		setFill(
			step
				? center(list.current?.querySelectorAll(":scope > li")[step - 1])
				: 12,
		);
	};

	return (
		<ol
			ref={list}
			className="p:r ml:4"
			onMouseLeave={() => reach(0)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) reach(0);
			}}
		>
			{/* the wave runs from the first circle to the last, and fills in ink */}
			<span
				aria-hidden
				className="p:a bg:border"
				style={{ ...LINE, height: end - 12 }}
			/>
			<span
				aria-hidden
				className="p:a bg:ink tp:a tdu:700 ttf:io @prm:tp:none"
				style={{ ...LINE, height: fill - 12 }}
			/>
			{childArray.map((child, i) => {
				if (React.isValidElement<StepProps & InjectedStepProps>(child)) {
					return React.cloneElement(child, {
						stepNumber: i + 1,
						isLast: i === childArray.length - 1,
						reached: i + 1 <= at,
						onReach: () => reach(i + 1),
					});
				}
				return child;
			})}
		</ol>
	);
}

export function Step({
	children,
	title,
	stepNumber,
	isLast,
	reached,
	onReach,
}: StepProps & InjectedStepProps) {
	return (
		<li
			className={isLast ? "ml:8" : "mb:10 ml:8"}
			onMouseEnter={onReach}
			onFocus={onReach}
		>
			{/* the second ring is a shadow, so it grows smoothly rather than a pixel at a time */}
			<div
				className={`d:f p:a l:-3 zi:10 ai:c jc:c w:6 h:6 br:9999 bw:1 bg:surface c:ink tp:a tdu:500 ttf:io @prm:tp:none ${reached ? "bc:ink" : "bc:border"}`}
				style={{ boxShadow: `0 0 0 ${reached ? 1 : 0}px currentColor` }}
			>
				<span className="c:accent fs:xs">{stepNumber}</span>
			</div>
			<div className="d:f ai:c mb:2">
				<p className="c:ink">{title}</p>
			</div>
			<div className="my:5 c:ink/80">{children}</div>
		</li>
	);
}

export default Stepper;
