import {
	IconArchive,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconArrowsSort,
	IconBell,
	IconBold,
	IconBookmark,
	IconCheck,
	IconChevronDown,
	IconClock,
	IconCloud,
	IconColumns3,
	IconCopy,
	IconDeviceDesktop,
	IconDeviceLaptop,
	IconDeviceMobile,
	IconDeviceTablet,
	IconDots,
	IconDownload,
	IconFileArrowLeft,
	IconFileArrowRight,
	IconFile,
	IconFilePlus,
	IconFolder,
	IconFolderSymlink,
	IconItalic,
	IconKeyboard,
	IconLayoutGrid,
	IconLayoutList,
	IconLink,
	IconList,
	IconListNumbers,
	IconLock,
	IconMoon,
	IconPalette,
	IconPencil,
	IconPhoto,
	IconPin,
	IconPlus,
	IconSearch,
	IconSettings,
	IconSparkles,
	IconStar,
	IconStarFilled,
	IconSun,
	IconTrash,
	IconUnderline,
	IconVideo,
} from "@tabler/icons-react";
import { type ComponentType, Fragment, type ReactNode } from "react";
import { type ChildExample, getRegistryMeta } from "@/registry";
import { componentId, iconMarker } from "@/utils/snippet";
import { shapeProps } from "@/utils/shapes.mjs";

export type DemoProps = Record<string, unknown>;

type IconComponent = ComponentType<{ className?: string }>;

/** Every icon a schema's `$icon` marker or `exampleIcon` can name, by its export. */
export const EXAMPLE_ICONS: Record<string, IconComponent> = {
	IconArchive,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconArrowsSort,
	IconBell,
	IconBold,
	IconBookmark,
	IconCheck,
	IconChevronDown,
	IconClock,
	IconCloud,
	IconColumns3,
	IconCopy,
	IconDeviceDesktop,
	IconDeviceLaptop,
	IconDeviceMobile,
	IconDeviceTablet,
	IconDots,
	IconDownload,
	IconFileArrowLeft,
	IconFileArrowRight,
	IconFile,
	IconFilePlus,
	IconFolder,
	IconFolderSymlink,
	IconItalic,
	IconKeyboard,
	IconLayoutGrid,
	IconLayoutList,
	IconLink,
	IconList,
	IconListNumbers,
	IconLock,
	IconMoon,
	IconPalette,
	IconPencil,
	IconPhoto,
	IconPin,
	IconPlus,
	IconSearch,
	IconSettings,
	IconSparkles,
	IconStar,
	IconStarFilled,
	IconSun,
	IconTrash,
	IconUnderline,
	IconVideo,
};

function iconComponent(name: string) {
	return EXAMPLE_ICONS[name];
}

export function exampleIcon(name: string) {
	const Icon = iconComponent(name);
	return Icon ? <Icon className="w:5 h:5" /> : undefined;
}

export function resolveIcons(value: unknown): unknown {
	const marker = iconMarker(value);
	if (marker) {
		const Icon = iconComponent(marker.name);
		return Icon ? <Icon className={marker.size ?? "w:6 h:6"} /> : undefined;
	}
	if (Array.isArray(value)) return value.map(resolveIcons);
	if (typeof value === "object" && value !== null) {
		if ("$$typeof" in value) return value;
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, resolveIcons(item)]),
		);
	}
	return value;
}

/** The registry ids a scene names, so they can load before it renders. */
export function sceneIds(scene: ChildExample[]): string[] {
	const ids = new Set<string>();
	const walk = (nodes: ChildExample[]) => {
		for (const node of nodes) {
			if (node.component) ids.add(componentId(node.component));
			if (Array.isArray(node.children)) walk(node.children);
		}
	};
	walk(scene);
	return [...ids];
}

/** The Example view, with the rail's shape on every component in it. */
// system follows the reader's own setting
function schemeOf(theme: string): "light" | "dark" {
	if (theme === "light" || theme === "dark") return theme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function renderScene(
	scene: ChildExample[],
	components: Record<string, ComponentType<DemoProps>>,
	shape: string,
	container: unknown,
	state: SceneState,
): ReactNode {
	const context: SceneContext = {
		components,
		styled: (component) => {
			const meta = getRegistryMeta(componentId(component));
			// an example has no meta; it takes the container for the popups it holds
			if (!meta) return { container };
			const portals = meta.props.some((prop) => prop.name === "container");
			return {
				...shapeProps(meta.props, shape),
				...(portals ? { container } : {}),
			};
		},
		// a prop with a handler is controlled from the address, by instance
		wired: (component, path, props) => {
			const meta = getRegistryMeta(componentId(component));
			const out: DemoProps = {};
			for (const prop of meta?.props ?? []) {
				if (!prop.handler) continue;
				const initial = `default${prop.name.charAt(0).toUpperCase()}${prop.name.slice(1)}`;
				const fallback =
					props[prop.name] ??
					props[initial] ??
					prop.default ??
					(prop.type === "boolean" ? false : undefined);
				const key = `${path}.${prop.name}`;
				out[prop.name] = key in state.values ? state.values[key] : fallback;
				out[initial] = undefined;
				// a Theme Switcher in the preview sets the preview's scheme too
				const themes =
					componentId(component) === "theme-switcher" && prop.name === "value";
				out[prop.handler] = (value: unknown) => {
					state.set(key, value, fallback);
					if (themes) state.setScheme?.(schemeOf(String(value)));
				};
			}
			return out;
		},
	};
	return scene.map((child, index) => renderChild(child, index, context));
}

export interface SceneState {
	values: Record<string, unknown>;
	set: (key: string, value: unknown, fallback: unknown) => void;
	/** Sets the preview's own scheme, so a Theme Switcher in it does what it says. */
	setScheme?: (scheme: "light" | "dark") => void;
}

interface SceneContext {
	components: Record<string, ComponentType<DemoProps>>;
	styled: (component: string) => DemoProps;
	wired: (
		component: string,
		path: string,
		props: Record<string, unknown>,
	) => DemoProps;
}

// position is the identity of a demo's child, so it is the key and the path
function renderChild(
	child: ChildExample,
	index: number,
	scene?: SceneContext,
	parent = "",
): ReactNode {
	const path = parent ? `${parent}.${index}` : String(index);
	const inner =
		typeof child.children === "string"
			? child.children
			: child.children?.map((node, at) => renderChild(node, at, scene, path));

	if (child.icon !== undefined) {
		return (
			<Fragment key={index}>{resolveIcons(child.icon) as ReactNode}</Fragment>
		);
	}
	if (child.text !== undefined) {
		return (
			<span key={index} className={child.className}>
				{child.text}
			</span>
		);
	}
	if (child.tag) {
		const Tag = child.tag;
		return (
			<Tag key={index} className={child.className}>
				{inner}
			</Tag>
		);
	}
	const component = child.component;
	const Child = component ? scene?.components[componentId(component)] : null;
	if (!Child || !component) return null;
	return (
		<Child
			key={index}
			{...(scene ? scene.styled(component) : {})}
			{...(resolveIcons(child.props ?? {}) as DemoProps)}
			{...(scene ? scene.wired(component, path, child.props ?? {}) : {})}
			{...(child.className ? { className: child.className } : {})}
		>
			{inner}
		</Child>
	);
}
