"use client";

import React, { useRef, useState } from "react";

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

export function Stepper({ children }: StepperProps) {
	const childArray = React.Children.toArray(children);
	const list = useRef<HTMLOListElement>(null);
	// the step the pointer or focus is on; the line fills down to its circle
	const [at, setAt] = useState(0);
	const [fill, setFill] = useState(0);

	const reach = (step: number) => {
		setAt(step);
		const item = list.current?.children[step] as HTMLElement | undefined;
		// a circle's center sits 12px below its step's top
		setFill(item ? item.offsetTop + 12 : 0);
	};

	return (
		<ol
			ref={list}
			className="p:r ml:4 bc:border blw:2 bs:d"
			onMouseLeave={() => reach(0)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) reach(0);
			}}
		>
			<span
				aria-hidden
				className="p:a t:0 bg:ink tp:a tdu:300 ttf:out-quart @prm:tp:none"
				style={{ left: -2, width: 2, height: fill }}
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
			<div
				className={`d:f p:a l:-3 ai:c jc:c w:6 h:6 br:9999 bg:surface tp:a tdu:300 ttf:out-quart @prm:tp:none ${reached ? "bw:2 bc:ink" : "bw:1 bc:border"}`}
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
