"use client";

import type { ReactNode } from "react";
import Select from "@/registry/ui/select";
import Switch from "@/registry/ui/switch";

const SIZES: Record<string, string> = {
	xs: "Extra Small",
	sm: "Small",
	md: "Medium",
	lg: "Large",
	xl: "Extra Large",
};

/** A prop name or value as words: `iconPosition` reads Icon Position, `sm` reads Small. */
export function humanize(text: string) {
	if (SIZES[text]) return SIZES[text];
	return text
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(" ");
}

/** A select over a prop's values, for the Styling drawer. */
export function EnumSelect({
	name,
	values,
	value,
	onChange,
	container,
}: {
	name: string;
	values: string[];
	value: string | null;
	onChange: (value: string) => void;
	container?: HTMLElement | null;
}) {
	return (
		<Select
			ariaLabel={humanize(name)}
			options={values.map((option) => ({
				value: option,
				label: humanize(option),
			}))}
			value={value}
			onValueChange={(next) => next && onChange(next)}
			size="sm"
			shape="pill"
			className="w:40"
			container={container}
		/>
	);
}

function Bars({ colors }: { colors: string[] }) {
	return (
		<span aria-hidden className="d:f fs:0 ai:c">
			{colors.map((color, at) => (
				<span
					key={color}
					className={`d:b w:3 h:3 br:9999 bw:1 bc:raised ${at ? "ml:-1" : ""}`}
					style={{ backgroundColor: color }}
				/>
			))}
		</span>
	);
}

/** A select whose options are colour families, each drawn as its shades. */
export function SwatchSelect({
	name,
	options,
	value,
	onChange,
	container,
}: {
	name: string;
	options: { value: string; colors: string[] }[];
	value: string;
	onChange: (value: string) => void;
	container?: HTMLElement | null;
}) {
	const current = options.find((option) => option.value === value);
	const icon: ReactNode = current && <Bars colors={current.colors} />;

	return (
		<Select
			ariaLabel={humanize(name)}
			options={options.map((option) => ({
				value: option.value,
				label: humanize(option.value),
				icon: <Bars colors={option.colors} />,
			}))}
			value={value}
			onValueChange={(next) => next && onChange(next)}
			icon={icon}
			size="sm"
			shape="pill"
			className="w:40"
			container={container}
		/>
	);
}

/** An on and off control for a boolean prop. */
export function PropSwitch({
	name,
	checked,
	onChange,
}: {
	name: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<Switch
			ariaLabel={humanize(name)}
			checked={checked}
			onCheckedChange={onChange}
			size="sm"
			shape="pill"
		/>
	);
}
