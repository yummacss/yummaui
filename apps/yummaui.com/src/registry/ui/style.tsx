"use client";

import { createContext, type ReactNode, useContext } from "react";

/** The corner style every component shares, set app-wide with `Shape` or per component with its `shape` prop. */
export type Shape = "square" | "rounded" | "squircle" | "pill";

/** The shape a component takes when neither a `Shape` above it nor its own prop sets one. */
export const DEFAULT_SHAPE: Shape = "rounded";

const ShapeContext = createContext<Shape>(DEFAULT_SHAPE);

export interface ShapeProps {
  /** The shape for every component inside. */
  value: Shape;
  children: ReactNode;
}

/** Sets the shape of every component inside it; a component's own `shape` prop still wins. */
export function Shape({ value, children }: ShapeProps) {
  return <ShapeContext value={value}>{children}</ShapeContext>;
}

const ALL: readonly Shape[] = ["square", "rounded", "squircle", "pill"];

/**
 * The shape to draw: the component's own prop, else the nearest `Shape`, else
 * the default. A component that `takes` only some shapes gets `rounded` for one
 * it does not, or `pill` where it has no `rounded`.
 */
export function useShape<T extends Shape = Shape>(
  own?: T,
  takes: readonly T[] = ALL as readonly T[],
): T {
  const inherited = useContext(ShapeContext);
  const shape: Shape = own ?? inherited;
  if ((takes as readonly Shape[]).includes(shape)) return shape as T;
  return (
    takes.find((one) => one === "rounded") ??
    takes.find((one) => one === "pill") ??
    takes[0]
  );
}

/**
 * The radius of each kind of part, for each shape. Edit a row here to restyle
 * every component that has that part.
 */
export const RADIUS = {
  /** Buttons, fields, triggers, tabs & toggles. */
  control: { square: "", rounded: "br:lg", squircle: "br:xxl cs:s", pill: "br:9999" },
  /** The left end of a control split in two, such as a number field. */
  controlStart: { square: "", rounded: "blr:lg", squircle: "blr:xxl cs:s", pill: "blr:9999" },
  /** The right end of a control split in two. */
  controlEnd: { square: "", rounded: "brr:lg", squircle: "brr:xxl cs:s", pill: "brr:9999" },
  /** A control that grows past one line: a textarea, a field of chips. */
  box: { square: "", rounded: "br:lg", squircle: "br:xxl cs:s", pill: "br:xxl" },
  /** Rows inside a list or popup: menu items, options, links & small close buttons. */
  item: { square: "", rounded: "br:md", squircle: "br:xl cs:s", pill: "br:9999" },
  /** Popups, dialogs, cards & panels. */
  popup: { square: "", rounded: "br:xl", squircle: "br:3xl cs:s", pill: "br:3xl" },
  /** A strip that holds controls, such as a toolbar, a tab list or a menubar. */
  bar: { square: "", rounded: "br:xl", squircle: "br:3xl cs:s", pill: "br:9999" },
  /** Small tags & tiles: badges, chips, keycaps & icon tiles. */
  chip: { square: "", rounded: "br:sm", squircle: "br:md cs:s", pill: "br:9999" },
  /** Progress, slider & meter tracks. */
  track: { square: "", rounded: "br:9999", squircle: "br:xxl cs:s", pill: "br:9999" },
  /** A chip inside running text, in em so it scales with the type. */
  textChip: { square: "", rounded: "br:calc(.25em)", squircle: "br:calc(.45em) cs:s", pill: "br:9999" },
  /** A tile inside a text chip; its chip's radius less the padding, so the corners stay concentric. */
  textTile: { square: "", rounded: "br:calc(.15em)", squircle: "br:calc(.35em) cs:s", pill: "br:9999" },
  /** The box of a checkbox. */
  mark: { square: "", rounded: "br:sm", squircle: "br:md cs:s", pill: "br:9999" },
} as const satisfies Record<string, Record<Shape, string>>;

/** The focus outline of a control. */
export const FOCUS = "ow:0 oc:focus/40 fv:os:s fv:ow:3 fv:oo:0 fv:bc:focus";

/** The focus outline of a box that holds the focused input. */
export const FOCUS_WITHIN = "ow:0 oc:focus/40 fw:os:s fw:ow:3 fw:oo:0 fw:bc:focus";
