"use client";

import { parseAsJson, parseAsStringLiteral, useQueryState } from "nuqs";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { sidebarConfig } from "@/config/sidebar";
import { getRegistryMeta, type RegistryMeta } from "@/registry";
import { DEFAULT_ACCENT, readAccent, writeAccent } from "@/utils/accent";
import { prefetchRegistry } from "@/utils/prefetch-registry";
import { readScheme, type Scheme, writeScheme } from "@/utils/scheme";
import { DEFAULT_SHAPE, SHAPES } from "@/utils/shapes.mjs";

const SHAPE_QUERY = parseAsStringLiteral(SHAPES as [string, ...string[]])
	.withDefault(DEFAULT_SHAPE)
	.withOptions({ history: "replace", clearOnDefault: true, shallow: true });
const SHAPE_STORE = "yui:shape";

function readShape(): string | null {
	try {
		const stored = window.localStorage.getItem(SHAPE_STORE);
		return stored && SHAPES.includes(stored) ? stored : null;
	} catch {
		return null;
	}
}

export type SceneValues = Record<string, string | number | boolean>;

const QUERY = { history: "replace", shallow: true } as const;

function sceneValues(value: unknown): SceneValues | null {
	if (typeof value !== "object" || value === null || Array.isArray(value))
		return null;
	const entries = Object.entries(value).filter(([, entry]) =>
		["string", "number", "boolean"].includes(typeof entry),
	);
	return Object.fromEntries(entries) as SceneValues;
}

interface Playground {
	id: string;
	meta: RegistryMeta | null;
	/** What the scene's components were changed to, by instance and prop. */
	sceneValues: SceneValues;
	setSceneValue: (key: string, value: unknown, fallback: unknown) => void;
	accent: string;
	setAccent: (family: string) => void;
	scheme: Scheme;
	setScheme: (scheme: Scheme) => void;
	shape: string;
	setShape: (shape: string) => void;
}

const PlaygroundContext = createContext<Playground | null>(null);

export function usePlayground(): Playground | null {
	return useContext(PlaygroundContext);
}

export function PlaygroundProvider({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}) {
	// synchronous, so the server renders the Component API and a switch never empties it
	const meta = useMemo(() => getRegistryMeta(id), [id]);
	const [accent, setAccentState] = useState(DEFAULT_ACCENT);

	useEffect(() => setAccentState(readAccent()), []);

	const setAccent = useCallback((family: string) => {
		setAccentState(family);
		writeAccent(family);
	}, []);

	const [scheme, setSchemeState] = useState<Scheme>("light");

	useEffect(() => setSchemeState(readScheme()), []);

	const setScheme = useCallback((next: Scheme) => {
		setSchemeState(next);
		writeScheme(next);
	}, []);

	// held in state, so a page without ?shape= in its address keeps the last one
	const [shape, setShapeState] = useState(DEFAULT_SHAPE);
	const [, setShapeQuery] = useQueryState("shape", SHAPE_QUERY);

	const setShape = useCallback(
		(next: string) => {
			setShapeState(next);
			void setShapeQuery(next);
			try {
				window.localStorage.setItem(SHAPE_STORE, next);
			} catch {}
		},
		[setShapeQuery],
	);

	// the address wins; otherwise the shape carried from the last page
	useEffect(() => {
		const asked = new URLSearchParams(window.location.search).get("shape");
		setShapeState(
			asked && SHAPES.includes(asked) ? asked : (readShape() ?? DEFAULT_SHAPE),
		);
	}, [id]);

	// the neighbours too, so the pagination arrows land on a component that is ready
	useEffect(() => {
		prefetchRegistry(id);
		const slugs = sidebarConfig.flatMap((section) => section.items);
		const at = slugs.indexOf(id);
		for (const slug of [slugs[at - 1], slugs[at + 1]]) {
			if (slug && getRegistryMeta(slug)) prefetchRegistry(slug);
		}
	}, [id]);

	// what a visitor changes in the scene lives in the address, so a reload keeps it
	const [sceneQuery, setSceneQuery] = useQueryState(
		"scene",
		parseAsJson(sceneValues).withOptions(QUERY),
	);
	const sceneState = useMemo(() => sceneQuery ?? {}, [sceneQuery]);
	const setSceneValue = useCallback(
		(key: string, value: unknown, fallback: unknown) => {
			void setSceneQuery((previous) => {
				const next = { ...previous };
				if (
					value === fallback ||
					!["string", "number", "boolean"].includes(typeof value)
				)
					delete next[key];
				else next[key] = value as string | number | boolean;
				return Object.keys(next).length > 0 ? next : null;
			});
		},
		[setSceneQuery],
	);

	const playground = useMemo(
		() => ({
			id,
			meta,
			sceneValues: sceneState,
			setSceneValue,
			accent,
			setAccent,
			scheme,
			setScheme,
			shape,
			setShape,
		}),
		[
			id,
			meta,
			sceneState,
			setSceneValue,
			accent,
			setAccent,
			scheme,
			setScheme,
			shape,
			setShape,
		],
	);

	return <PlaygroundContext value={playground}>{children}</PlaygroundContext>;
}

const ignore = () => {};

/**
 * The playground at its defaults, with nothing to change it. The server
 * renders this while the address is unknown, so the page arrives whole.
 */
export function StaticPlayground({
	id,
	children,
}: {
	id: string;
	children: ReactNode;
}) {
	const playground = useMemo(() => {
		const meta = getRegistryMeta(id);
		return {
			id,
			meta,
			sceneValues: {},
			setSceneValue: ignore,
			accent: DEFAULT_ACCENT,
			setAccent: ignore,
			scheme: "light" as Scheme,
			setScheme: ignore,
			shape: DEFAULT_SHAPE,
			setShape: ignore,
		};
	}, [id]);

	return <PlaygroundContext value={playground}>{children}</PlaygroundContext>;
}
