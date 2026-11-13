"use client";

import { ScrollArea } from "@base-ui/react/scroll-area";
import {
  cloneElement,
  createContext,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { merge } from "yummacss/merge";

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

/** The shape of a part as wide as it is tall, where a capsule is a `circle`. */
export type Corner = "square" | "rounded" | "squircle" | "circle";

/** Like `useShape`, for a square part: the nearest `pill` draws a circle. */
export function useCorner(own?: Corner): Corner {
  const shape = useShape(own === "circle" ? "pill" : own);
  return shape === "pill" ? "circle" : shape;
}

/** The `RADIUS` column for a corner. */
export function shapeOf(corner: Corner): Shape {
  return corner === "circle" ? "pill" : corner;
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
  /** Areas that hold wrapping text or data, such as a quote or a chart tile; never round enough to read as a pill. */
  block: { square: "", rounded: "br:md", squircle: "br:xl cs:s", pill: "br:xl" },
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
  /** A chat bubble: every corner but the one by its sender. */
  bubble: {
    square: "",
    rounded: "btlr:xl btrr:xl bblr:xl",
    squircle: "btlr:3xl btrr:3xl bblr:3xl cs:s",
    pill: "btlr:3xl btrr:3xl bblr:3xl",
  },
  /** The box of a checkbox. */
  mark: { square: "", rounded: "br:sm", squircle: "br:md cs:s", pill: "br:9999" },
} as const satisfies Record<string, Record<Shape, string>>;

/** The sizes a component offers. */
export type Size = "sm" | "md" | "lg";

/** The measures several components share at each size. Edit a row to resize them all. */
export const SIZE = {
  /** The height of a one-line control: a button, field, select or stepper. */
  height: { sm: "h:8", md: "h:9", lg: "h:11" },
  /** The width of a field and of the list it opens. */
  width: { sm: "w:56", md: "w:64", lg: "w:72" },
  /** The text of a label beside a control. */
  text: { sm: "fs:xs", md: "fs:sm", lg: "fs:md" },
  /** The box of a checkbox or radio. */
  mark: { sm: "w:3 h:3", md: "w:4 h:4", lg: "w:5 h:5" },
} as const satisfies Record<string, Record<Size, string>>;

/** The focus outline of a control. */
export const FOCUS = "ow:0 oc:focus/40 fv:os:s fv:ow:3 fv:oo:0 fv:bc:focus";

/** The focus outline of a box that holds the focused input. */
export const FOCUS_WITHIN = "ow:0 oc:focus/40 fw:os:s fw:ow:3 fw:oo:0 fw:bc:focus";

/** The text typed into a field: 16px on a phone, where iOS zooms in on anything smaller. */
export const INPUT_TEXT = "fs:md @sm:fs:sm";

/** Set by a group that slides one raised key under its pressed item, so the items stop drawing their own. */
export const Sliding = createContext(false);

/**
 * Follows the `[data-pressed]` item inside the returned `ref` and gives the
 * style that puts a sliding key under it. `ready` turns true after the first
 * measure, so the key does not slide in from the corner on load.
 */
export function useIndicator<T extends HTMLElement>(
  on = true,
): { ref: RefObject<T | null>; style: CSSProperties; ready: boolean } {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !on) return;
    const measure = () => {
      const item = root.querySelector<HTMLElement>("[data-pressed]");
      setBox(
        item
          ? new DOMRect(item.offsetLeft, item.offsetTop, item.offsetWidth, item.offsetHeight)
          : null,
      );
    };
    measure();
    const frame = requestAnimationFrame(() => setReady(true));
    const mutations = new MutationObserver(measure);
    mutations.observe(root, { subtree: true, attributeFilter: ["data-pressed"] });
    const sizes = new ResizeObserver(measure);
    sizes.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      sizes.disconnect();
    };
  }, [on]);

  return {
    ref,
    ready,
    style: box
      ? { translate: `${box.x}px ${box.y}px`, width: box.width, height: box.height }
      : { opacity: 0 },
  };
}

/** Eases an element's width from its old size to its new one whenever `key` changes. */
export function useMorph<T extends HTMLElement>(key: boolean, animated: boolean) {
  const ref = useRef<T>(null);
  const width = useRef(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transition = "";
    node.style.width = "";
    node.style.clipPath = "";
    const to = node.offsetWidth;
    const from = width.current;
    width.current = to;
    const still =
      !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!from || from === to || still) return;
    node.style.width = `${from}px`;
    // a clip with room for the border & focus outline, where overflow would cut them
    node.style.clipPath = "inset(-4px)";
    node.getBoundingClientRect();
    node.style.transition = "width 250ms cubic-bezier(0.25, 1, 0.5, 1)";
    node.style.width = `${to}px`;
    const settle = () => {
      node.style.transition = "";
      node.style.width = "";
      node.style.clipPath = "";
    };
    node.addEventListener("transitionend", settle, { once: true });
    return () => node.removeEventListener("transitionend", settle);
  }, [key, animated]);

  return ref;
}

/** Two icons in one place that cross-fade, such as copy to copied. */
export function Swap({ swapped, from, to }: { swapped: boolean; from: ReactNode; to: ReactNode }) {
  // every property: transition-property has no name for transform and filter together
  const piece = "d:f tp:a tdu:200 ttf:out-quart @prm:tp:o";
  const shown = "o:100 s:100 fb:0";
  const hidden = "o:0 s:25 fb:4";
  return (
    <span aria-hidden className="d:g pi:c">
      <span className={`${piece} ${swapped ? hidden : shown}`} style={{ gridArea: "1 / 1" }}>
        {from}
      </span>
      <span className={`${piece} ${swapped ? shown : hidden}`} style={{ gridArea: "1 / 1" }}>
        {to}
      </span>
    </span>
  );
}

const BAR = "d:f o:0 tp:o tdu:200 ttf:io hovering:o:100 scrolling:o:100 scrolling:tdu:0 @prm:tp:none";

/**
 * What scrolls inside a component, with the library's thin scrollbar in place
 * of the browser's own. Give it a bounded height, or `f:1` inside a column
 * that has one.
 */
export function Scroll({
  children,
  axis = "y",
  className = "",
  viewport = "",
}: {
  children: ReactNode;
  /** The directions it scrolls. */
  axis?: "x" | "y" | "both";
  /** Classes on the area, where its height or `f:1` goes. */
  className?: string;
  /** Classes on the box that scrolls, such as its padding. */
  viewport?: string;
}) {
  return (
    // every box down to the viewport needs min-h:0, or it grows to its content and never scrolls
    <ScrollArea.Root className={merge("p:r d:f fd:c min-h:0 min-w:0", className)}>
      <ScrollArea.Viewport className={merge("f:1 min-h:0 os:none", viewport)}>{children}</ScrollArea.Viewport>
      {axis !== "x" && (
        <ScrollArea.Scrollbar orientation="vertical" className={`${BAR} jc:c w:2 py:1`}>
          <ScrollArea.Thumb className="w:1 br:9999 bg:hint/50" />
        </ScrollArea.Scrollbar>
      )}
      {axis !== "y" && (
        <ScrollArea.Scrollbar orientation="horizontal" className={`${BAR} ai:c h:2 px:1`}>
          <ScrollArea.Thumb className="h:1 br:9999 bg:hint/50" />
        </ScrollArea.Scrollbar>
      )}
    </ScrollArea.Root>
  );
}

// a damped spring: about three swings, each smaller, settling softly
const SPRING = Array.from({ length: 31 }, (_, step) => {
  const t = step / 30;
  return { transform: `translateX(${(10 * Math.exp(-4.2 * t) * Math.sin(t * Math.PI * 5.5)).toFixed(2)}px)` };
});

/**
 * Shakes elements on a damped spring, each `lag` milliseconds behind the last,
 * so a row ripples. Stands still when the user has asked for reduced motion.
 */
export function shake(elements: Element | Iterable<Element> | null | undefined, lag = 0) {
  if (!elements || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const list = elements instanceof Element ? [elements] : [...elements];
  list.forEach((element, index) =>
    element.animate(SPRING, { duration: 460, delay: index * lag, easing: "linear" }),
  );
}

/**
 * Shakes the returned ref's element, or its `parts`, each time a new error
 * arrives.
 */
export function useShake<T extends HTMLElement>(error: unknown, lag = 0, parts?: string) {
  const ref = useRef<T>(null);
  const last = useRef(error);
  useLayoutEffect(() => {
    const root = ref.current;
    if (error && error !== last.current && root) shake(parts ? root.querySelectorAll(parts) : root, lag);
    last.current = error;
  }, [error, lag, parts]);
  return ref;
}

/** A message arriving under a control: it fades in from a blur. Key it by its text so each new one plays. */
export const MESSAGE_IN = "an:reveal adu:200 ttf:out-quart @prm:an:none";

/**
 * Someone's own element as a component's trigger: the library's classes, the
 * element's own, then `className`, merged in that order.
 */
export function asTrigger(
  element: ReactElement<{ className?: string }>,
  library: string,
  className?: string,
) {
  return cloneElement(element, {
    className: merge(library, element.props.className, className),
  });
}
