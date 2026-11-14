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

// each character sits in a clipped slot, so a glyph can leave by one line while the next arrives
const ROLL_SLOT = "p:r d:ib o:h";
const ROLL_GLYPH = "d:b";
const ROLL_EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

const escape = (text: string) =>
  text.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

const rollSlots = (text: string) =>
  text
    .split("")
    .map((ch) => `<span class="${ROLL_SLOT}" data-ch="${escape(ch)}"><span class="${ROLL_GLYPH}">${escape(ch)}</span></span>`)
    .join("");

// the box may live in another document, such as a frame, so nodes come from its own
function glyph(doc: Document, ch: string) {
  const node = doc.createElement("span");
  node.className = ROLL_GLYPH;
  node.textContent = ch;
  return node;
}

function rollTo(box: HTMLElement, text: string, up: boolean) {
  const doc = box.ownerDocument;
  const slots = ([...box.children] as HTMLElement[]).filter((slot) => !slot.dataset.gone);
  const chars = text.split("").reverse();
  const from = slots.reverse();
  const timing = (index: number) => ({ duration: 250, delay: index * 30, easing: ROLL_EASE });
  const enter = (dir: number) =>
    dir
      ? [{ transform: `translateY(${dir * 100}%)`, opacity: 0, filter: "blur(2px)" }, { transform: "none", opacity: 1, filter: "none" }]
      : [{ opacity: 0 }, { opacity: 1 }];
  const leave = (dir: number) =>
    dir
      ? [{ transform: "none", opacity: 1, filter: "none" }, { transform: `translateY(${-dir * 100}%)`, opacity: 0, filter: "blur(2px)" }]
      : [{ opacity: 1 }, { opacity: 0 }];
  const sign = up ? 1 : -1;

  chars.forEach((ch, index) => {
    const slot = from[index];
    if (!slot) {
      // a new leading character opens its own width
      const added = doc.createElement("span");
      added.className = ROLL_SLOT;
      added.dataset.ch = ch;
      added.append(glyph(doc, ch));
      box.insertBefore(added, from[index - 1] ?? box.firstChild);
      from[index] = added;
      const width = added.getBoundingClientRect().width;
      added.animate([{ width: "0px" }, { width: `${width}px` }], timing(index));
      added.firstElementChild?.animate(enter(sign), { ...timing(index), fill: "backwards" });
      return;
    }
    const was = slot.dataset.ch ?? "";
    if (was === ch) return;
    slot.dataset.ch = ch;
    const dir = /\d/.test(was) && /\d/.test(ch) ? sign : 0;
    // the leaving glyph steps out of flow, so the slot takes the arriving one's width
    for (const old of [...slot.children] as HTMLElement[]) {
      if (old.dataset.leaving) continue;
      old.dataset.leaving = "1";
      old.style.cssText = "position:absolute;inset:0";
      old.animate(leave(dir), { ...timing(index), fill: "forwards" }).onfinish = () => old.remove();
    }
    const next = glyph(doc, ch);
    slot.append(next);
    next.animate(enter(dir), { ...timing(index), fill: "backwards" });
  });

  // characters that went away close their width
  from.slice(chars.length).forEach((slot) => {
    slot.dataset.gone = "1";
    const width = slot.getBoundingClientRect().width;
    slot.animate([{ width: `${width}px` }, { width: "0px" }], { ...timing(0), fill: "forwards" }).onfinish = () => slot.remove();
    slot.firstElementChild?.animate(leave(sign), { ...timing(0), fill: "forwards" });
  });
}

/**
 * A number that rolls when it changes: only the characters that differ move,
 * up when `value` grows and down when it shrinks. Hidden from screen readers,
 * so pair it with the value in text they can reach.
 */
export function Roll({
  value,
  text,
  still = false,
  className,
}: {
  /** The number, which sets the direction of the roll. */
  value: number;
  /** The number as shown, formatted. */
  text: string;
  /** Changes at once, without the roll. */
  still?: boolean;
  /** Extra classes on the row of characters. */
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // React writes the first text once; after that the characters are moved by hand
  const [first] = useState(() => ({ __html: rollSlots(text) }));
  const last = useRef({ value, text });

  useLayoutEffect(() => {
    const box = ref.current;
    const was = last.current;
    last.current = { value, text };
    if (!box || was.text === text) return;
    const view = box.ownerDocument.defaultView ?? window;
    if (still || view.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      box.innerHTML = rollSlots(text);
      return;
    }
    rollTo(box, text, value >= was.value);
  }, [value, text, still]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={merge("d:if ws:nw fvn:tn", className)}
      dangerouslySetInnerHTML={first}
    />
  );
}

const springs = new Map<string, { duration: number; easing: string }>();

/**
 * A spring as a duration and a CSS easing, for anything that takes the two,
 * such as `element.animate` or a drag library's drop. Where `linear()` easing
 * is missing it falls back to out-quart.
 */
export function spring(stiffness: number, damping: number) {
  const key = `${stiffness}/${damping}`;
  const cached = springs.get(key);
  if (cached) return cached;
  // simulate a unit step and sample it, so the curve overshoots and wobbles as the spring does
  const dt = 1 / 240;
  const path: number[] = [0];
  let x = 0;
  let v = 0;
  while (path.length < 480 && (Math.abs(1 - x) > 0.001 || Math.abs(v) > 0.01)) {
    v += (-stiffness * (x - 1) - damping * v) * dt;
    x += v * dt;
    path.push(x);
  }
  path.push(1);
  const points = Array.from({ length: 41 }, (_, i) => path[Math.round((i / 40) * (path.length - 1))].toFixed(4));
  const supported = typeof CSS !== "undefined" && CSS.supports("animation-timing-function", "linear(0, 1)");
  const result = supported
    ? { duration: Math.round(path.length * dt * 1000), easing: `linear(${points.join(", ")})` }
    : { duration: 300, easing: "cubic-bezier(0.25, 1, 0.5, 1)" };
  springs.set(key, result);
  return result;
}

// a card held off the surface: its edge, then a long soft shadow under it
const LIFTED = "0 1px 0 0 rgb(0 0 0 / 0.08), 0 14px 28px rgb(0 0 0 / 0.16), 0 4px 10px rgb(0 0 0 / 0.08)";

// the outline of the empty slot, drawn over the hidden copy the drag library leaves behind
const SLOT =
  "position:absolute;inset:0;border-radius:inherit;border:1px dashed color-mix(in srgb, currentColor 35%, transparent);background:transparent;box-shadow:none;visibility:visible;pointer-events:none";

/** What `useLift` reads from a drag event: dnd-kit's events fit it. */
interface LiftEvent {
  to?: { x: number };
  by?: { x: number };
  nativeEvent?: Event;
  operation: {
    source?: { element?: Element | null } | null;
    position: { current: { x: number } };
    activatorEvent?: Event | null;
  };
}

/**
 * The lift of a dragged card: it grows on a spring as it is picked up, leans
 * with the pointer's sideways speed and settles on the drop. Hand the
 * handlers to the drag provider.
 */
export function useLift() {
  const state = useRef({
    element: null as HTMLElement | null,
    leaning: null as HTMLElement | null,
    tilt: 0,
    speed: 0,
    target: 0,
    x: 0,
    time: 0,
    frame: 0,
    watch: 0,
    doc: null as Document | null,
    lifted: null as Animation | null,
  });

  const quiet = (element: Element) =>
    (element.ownerDocument.defaultView ?? window).matchMedia("(prefers-reduced-motion: reduce)").matches;

  // the lean chases its target on a spring, and the target fades so the card rights itself at rest
  const lean = () => {
    const s = state.current;
    const element = s.leaning;
    if (!element) return;
    if (performance.now() - s.time > 60) s.target *= 0.8;
    s.speed += (-300 * (s.tilt - s.target) - 22 * s.speed) / 60;
    s.tilt += s.speed / 60;
    element.style.rotate = `${s.tilt.toFixed(2)}deg`;
    if (Math.abs(s.tilt) > 0.02 || Math.abs(s.speed) > 0.02 || Math.abs(s.target) > 0.02) {
      s.frame = requestAnimationFrame(lean);
    } else {
      element.style.rotate = "";
      s.frame = 0;
      s.leaning = null;
    }
  };

  // the drag library leaves a hidden copy where the card was; a dashed outline inside it marks the slot
  const markSlot = (element: Element) => {
    let tries = 0;
    const mark = () => {
      const slot = [...(element.parentElement?.children ?? [])].find((child) => child.hasAttribute("data-dnd-placeholder"));
      if (!slot) {
        if (++tries < 6) requestAnimationFrame(mark);
        return;
      }
      if (slot.querySelector("[data-slot]")) return;
      const outline = element.ownerDocument.createElement("span");
      outline.setAttribute("aria-hidden", "true");
      outline.setAttribute("data-slot", "");
      outline.style.cssText = SLOT;
      slot.append(outline);
    };
    requestAnimationFrame(mark);
  };

  // a card moved to another list can be drawn as a new element, which keeps the lift
  const follow = () => {
    const s = state.current;
    // the drag library marks whichever element is being dragged right now
    const next = s.doc?.querySelector("[data-dnd-dragging]");
    if (!s.element) return;
    if (next && next !== s.element && "style" in next) {
      s.lifted?.cancel();
      s.element.style.rotate = "";
      s.element = next as HTMLElement;
      s.leaning = next as HTMLElement;
      s.lifted = next.animate([{ scale: "1.03", boxShadow: LIFTED }], { duration: 1, fill: "forwards" });
      markSlot(next);
      if (!s.frame) s.frame = requestAnimationFrame(lean);
    }
    s.watch = requestAnimationFrame(follow);
  };

  return {
    onDragStart: (event: LiftEvent) => {
      const element = event.operation.source?.element;
      if (!(element && "style" in element) || quiet(element)) return;
      const s = state.current;
      s.element = element as HTMLElement;
      s.leaning = element as HTMLElement;
      s.x = event.operation.position.current.x;
      s.time = performance.now();
      s.lifted = element.animate([{ scale: "1" }, { scale: "1.03", boxShadow: LIFTED }], {
        ...spring(380, 18),
        fill: "forwards",
      });
      s.doc = element.ownerDocument;
      markSlot(element);
      cancelAnimationFrame(s.watch);
      s.watch = requestAnimationFrame(follow);
    },
    onDragMove: (event: LiftEvent) => {
      const s = state.current;
      const cause = event.nativeEvent ?? event.operation.activatorEvent;
      if (!s.element || !cause) return;
      const now = performance.now();
      const x = event.to?.x ?? event.operation.position.current.x;
      // a keyboard move jumps a whole row, which is not speed: a step to another column nudges the card instead
      if (!cause.type.startsWith("pointer")) {
        const step = event.by?.x ?? x - s.x;
        s.x = x;
        if (Math.abs(step) < 24) return;
        s.target = Math.sign(step) * 4;
        s.time = now + 60;
        if (!s.frame) s.frame = requestAnimationFrame(lean);
        return;
      }
      const speed = (x - s.x) / Math.max(1, now - s.time);
      s.x = x;
      s.time = now;
      s.target = Math.max(-6, Math.min(6, speed * 10));
      if (!s.frame) s.frame = requestAnimationFrame(lean);
    },
    onDragEnd: () => {
      const s = state.current;
      cancelAnimationFrame(s.watch);
      s.doc = null;
      const element = s.element;
      if (!element) return;
      s.target = 0;
      const lifted = s.lifted;
      element.animate([{ scale: "1.03", boxShadow: LIFTED }, { scale: "1" }], spring(380, 18)).onfinish = () => lifted?.cancel();
      lifted?.pause();
      s.element = null;
      s.lifted = null;
      if (!s.frame) s.frame = requestAnimationFrame(lean);
    },
  };
}
