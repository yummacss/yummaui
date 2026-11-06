"use client";

import type { ReactNode } from "react";
import Select from "@/registry/ui/select";
import Switch from "@/registry/ui/switch";

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
			ariaLabel={name}
			options={values.map((option) => ({ value: option, label: option }))}
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
		<span aria-hidden className="d:f fs:0 g:px">
			{colors.map((color) => (
				<span
					key={color}
					className="d:b w:1 h:3"
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
			ariaLabel={name}
			options={options.map((option) => ({
				value: option.value,
				label: option.value,
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
			ariaLabel={name}
			checked={checked}
			onCheckedChange={onChange}
			size="sm"
			shape="pill"
		/>
	);
}
