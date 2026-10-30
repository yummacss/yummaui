export const DEFAULT_REGISTRY = "https://www.yummaui.com/ui/registry";

// where the registry lived on yummacss.com; a config that stored it reads as the default
const LEGACY_REGISTRY =
	/^https:\/\/(www\.)?yummacss\.com\/ui\/(r|registry)\/?$/;

/** The registry a config names, with an earlier default read as today's. */
export function registryUrl(stored: string | undefined): string {
	return !stored || LEGACY_REGISTRY.test(stored) ? DEFAULT_REGISTRY : stored;
}

export interface RegistryDependency {
	name: string;
	version: string;
}

export interface RegistryFile {
	path: string;
	target: string;
	content: string;
}

export type RegistryKind = "component";

export interface RegistryItem {
	id: string;
	component: string;
	variant: string;
	kind: RegistryKind;
	useClient: boolean;
	dependencies: RegistryDependency[];
	registryDeps: string[];
	files: RegistryFile[];
}

export interface RegistryComponent {
	component: string;
	title: string;
	base: string;
}

// the states, easings and keyframes the components animate with
/** A theme color: one value, or a `{ light, dark }` pair for both schemes. */
export type ThemeColor = string | { light: string; dark: string };

export interface RegistryTheme {
	states: Record<string, string>;
	// absent from an index published before easings existed
	easings?: Record<string, string>;
	keyframes: Record<string, string>;
	// absent from an index published before colors existed
	colors?: Record<string, ThemeColor>;
	// absent from an index published before box shadows existed
	boxShadow?: Record<string, string>;
}

export interface RegistryIndex {
	components: RegistryComponent[];
	theme?: RegistryTheme;
	generated: number;
}

export class RegistryError extends Error {}

async function getJson<T>(url: string): Promise<T> {
	let res: Response;
	try {
		res = await fetch(url, { headers: { accept: "application/json" } });
	} catch (cause) {
		throw new RegistryError(
			`Could not reach the registry at ${url}. Are you online?`,
			{ cause },
		);
	}

	if (res.status === 404) throw new RegistryError(`Not found: ${url}`);
	if (!res.ok) {
		throw new RegistryError(`Registry returned ${res.status} for ${url}`);
	}

	try {
		return (await res.json()) as T;
	} catch (cause) {
		throw new RegistryError(`Registry sent invalid JSON from ${url}`, {
			cause,
		});
	}
}

export function fetchIndex(registry: string): Promise<RegistryIndex> {
	return getJson<RegistryIndex>(`${registry}/index.json`);
}

export function fetchItem(registry: string, id: string): Promise<RegistryItem> {
	return getJson<RegistryItem>(`${registry}/${id}.json`);
}

/** The shapes a component can be added in. */
export const SHAPES = ["none", "rounded", "squircle", "pill"];

// the registry folder for a shape, or why there is none
export function resolveShape(
	shape: string,
): { folder: string } | { error: string } {
	return SHAPES.includes(shape)
		? { folder: shape }
		: {
				error: `There is no ${shape} shape. Try one of: ${SHAPES.join(", ")}.`,
			};
}
