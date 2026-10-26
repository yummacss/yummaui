// A shape sets the `shape` default of every component that has one. A component
// without the value takes the nearest it has, so under pill a dialog is a squircle.

export const SHAPES = ["none", "rounded", "squircle", "pill"];

export const DEFAULT_SHAPE = "pill";

const NEAREST = {
	none: ["square"],
	rounded: ["rounded"],
	squircle: ["squircle", "rounded"],
	pill: ["pill", "squircle", "rounded"],
};

/** The value a component with `values` takes for `shape`, if any. */
export function pickShape(values, shape) {
	return (NEAREST[shape] ?? []).find((value) => values.includes(value)) ?? null;
}

function unionOf(source, type) {
	const found = source.match(new RegExp(`^type ${type} = ([^;]+);`, "m"));
	return found ? [...found[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
}

/** A component file with its shape defaults rewritten for `shape`. */
export function applyShape(source, shape) {
	const target = pickShape(unionOf(source, "Shape"), shape);
	if (!target) return source;
	return source.replace(
		/^(\s*)(shape|iconShape) = "[a-z]+",$/gm,
		`$1$2 = "${target}",`,
	);
}

/** The shape props a component needs to look like `shape`, past its defaults. */
export function shapeProps(props, shape) {
	const out = {};
	for (const prop of props) {
		if (prop.name !== "shape" && prop.name !== "iconShape") continue;
		const target = pickShape(prop.values ?? [], shape);
		if (target && target !== prop.default) out[prop.name] = target;
	}
	return out;
}
