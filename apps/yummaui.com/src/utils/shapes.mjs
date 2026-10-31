// The shapes the preview offers, the same four every component takes. See `Shape` in the registry's style.tsx.

export const SHAPES = ["square", "rounded", "squircle", "pill"];

export const DEFAULT_SHAPE = "rounded";

// a stored or linked shape from before `square` was named
const RENAMED = { none: "square" };

/** A shape from storage or the address, read as today's name, or null. */
export function readShape(value) {
	const shape = RENAMED[value] ?? value;
	return SHAPES.includes(shape) ? shape : null;
}

/** style.tsx with its default shape set to `shape`, for the registry's shape folders. */
export function applyShape(source, shape) {
	return source.replace(
		/^export const DEFAULT_SHAPE: Shape = "[a-z]+";$/m,
		`export const DEFAULT_SHAPE: Shape = "${shape}";`,
	);
}
