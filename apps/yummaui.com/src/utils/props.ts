import type { RegistryProp } from "@/registry";

export function typeOf(prop: RegistryProp): string {
	if (prop.typeName) return prop.typeName;
	if (prop.type === "enum" && prop.values) return prop.values.join(" | ");
	return prop.type;
}

export const SHARED_PROP_ORDER = [
	"variant",
	"triggerVariant",
	"tone",
	"triggerTone",
	"confirmTone",
	"iconTone",
	"intent",
	"size",
	"shape",
	"iconShape",
	"disabled",
	"loading",
	"readOnly",
	"required",
	"animated",
	"transition",
	"className",
	"focus",
	"container",
] as const;

export function inTableOrder<T extends { name: string }>(props: T[]): T[] {
	const rank = (name: string) => {
		const index = SHARED_PROP_ORDER.indexOf(
			name as (typeof SHARED_PROP_ORDER)[number],
		);
		return index === -1 ? -1 : index;
	};

	return [...props]
		.map((prop, index) => ({ prop, index, rank: rank(prop.name) }))
		.sort((a, b) => {
			if (a.rank === -1 && b.rank === -1) return a.index - b.index;
			if (a.rank === -1) return -1;
			if (b.rank === -1) return 1;
			return a.rank - b.rank;
		})
		.map((entry) => entry.prop);
}

// props that change how the component looks; text, handlers and plumbing stay out of the drawer
const PLUMBING = new Set([
	"shape",
	"focus",
	"container",
	"className",
	"iconShape",
]);

/** The props the Styling drawer offers: enums and plain booleans that change the look. */
export function lookProps<T extends RegistryProp>(props: T[]): T[] {
	return props.filter(
		(prop) =>
			!prop.handler &&
			!PLUMBING.has(prop.name) &&
			// a default only applies when the component first renders
			!/^default[A-Z]/.test(prop.name) &&
			(prop.type === "enum" || (prop.type === "boolean" && !prop.typeName)),
	);
}
