"use client";

import { parseAsJson, parseAsStringLiteral, useQueryState } from "nuqs";
import { useLocalStorage } from "usehooks-ts";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";
import { sidebarConfig } from "@/config/sidebar";
import { getRegistryMeta, type RegistryMeta } from "@/registry";
import { DEFAULT_ACCENT, isAccent } from "@/utils/accent";
import { prefetchRegistry } from "@/utils/prefetch-registry";
import type { Scheme } from "@/utils/scheme";
import { DEFAULT_SHAPE, readShape, SHAPES } from "@/utils/shapes.mjs";

const SHAPE_QUERY = parseAsStringLiteral(SHAPES as [string, ...string[]])
	.withDefault(DEFAULT_SHAPE)
	.withOptions({ history: "replace", clearOnDefault: true, shallow: true });

// the reader's own picks, carried from page to page. Stored as bare strings, and
// read after hydration, so the server and the first render agree
const STORED = {
	serializer: (value: string) => value,
	deserializer: (value: string) => value,
	initializeWithValue: false,
};

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
	const [storedAccent, setAccent] = useLocalStorage(
		"yui:accent",
		DEFAULT_ACCENT,
		STORED,
	);
	const accent = isAccent(storedAccent) ? storedAccent : DEFAULT_ACCENT;

	const [storedScheme, setStoredScheme] = useLocalStorage<string>(
		"yui:scheme",
		"light",
		STORED,
	);
	const scheme: Scheme = storedScheme === "dark" ? "dark" : "light";
	const setScheme = useCallback(
		(next: Scheme) => setStoredScheme(next),
		[setStoredScheme],
	);

	const [storedShape, setStoredShape] = useLocalStorage(
		"yui:shape",
		DEFAULT_SHAPE,
		STORED,
	);
	const shape = readShape(storedShape) ?? DEFAULT_SHAPE;
	const [, setShapeQuery] = useQueryState("shape", SHAPE_QUERY);

	const setShape = useCallback(
		(next: string) => {
			setStoredShape(next);
			void setShapeQuery(next);
		},
		[setStoredShape, setShapeQuery],
	);

	// a shape in the address wins, and is kept for the pages after it
	useEffect(() => {
		const asked = readShape(
			new URLSearchParams(window.location.search).get("shape"),
		);
		if (asked) setStoredShape(asked);
	}, [id, setStoredShape]);

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
