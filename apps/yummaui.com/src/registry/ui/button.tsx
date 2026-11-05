"use client";

import { Button } from "@base-ui/react/button";
import { IconArrowBackUp } from "@tabler/icons-react";
import type {
  ComponentProps,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, type Size, useShape } from "./style";

type Variant = "primary" | "secondary" | "subtle" | "ghost" | "danger" | "link";
type IconSide = "leading" | "trailing";

const BASE = "d:if ai:c jc:c g:2 bw:1 fw:500 us:none";

const MOTION = "tdu:150 ttf:io a:s:96 wc:s @prm:tp:none @prm:a:s:100";

const VARIANTS: Record<Variant, string> = {
  primary: "bg:fill bc:edge c:on-fill bs-o:key-fill",
  secondary: "bg:raised bs-o:key bc:rim c:label",
  subtle: "bg:well bc:transparent c:hint",
  ghost: "bg:transparent bc:transparent c:label",
  danger: "bg:red bc:red-9 c:white bs-o:key-fill",
  link: "bg:transparent bc:transparent c:label tuo:2",
};

// apart, so a disabled button keeps no hover that says it can be pressed
const HOVERS: Record<Variant, string> = {
  primary: "h:o:90",
  secondary: "h:bg:well",
  subtle: "h:bg:line",
  ghost: "h:bg:well",
  danger: "h:bg:red-8 h:bc:red-8",
  link: "h:td:u",
};

const VARIANT_OUTLINE: Partial<Record<Variant, string>> = {
  danger: "oc:red-2/60 fv:bc:red-3",
};

// held, the button's content again in a stronger color sweeps across it
// counting: a pale tint of the button, its label in the button's own color
const COUNTING: Record<Variant, string> = {
  primary: "bg:well bc:rim c:label",
  secondary: "bg:well bc:rim c:label",
  subtle: "bg:well bc:transparent c:label",
  ghost: "bg:well bc:transparent c:label",
  danger: "bg:red-1 bc:red-3 c:red-8",
  link: "bg:well bc:transparent c:label",
};

const BADGE: Record<Variant, string> = {
  primary: "bg:fill c:on-fill",
  secondary: "bg:fill c:on-fill",
  subtle: "bg:fill c:on-fill",
  ghost: "bg:fill c:on-fill",
  danger: "bg:red c:white",
  link: "bg:fill c:on-fill",
};

const HOLD_FILL: Record<Variant, string> = {
  primary: "bg:edge c:on-fill",
  secondary: "bg:fill c:on-fill",
  subtle: "bg:fill c:on-fill",
  ghost: "bg:fill c:on-fill",
  danger: "bg:red-9 c:white",
  link: "bg:fill c:on-fill",
};

// a fixed height per size, so a row of buttons lines up whatever they hold
const SIZES: Record<Size, string> = {
  sm: "h:8 px:3 fs:xs",
  md: "h:9 px:4 fs:sm",
  lg: "h:11 px:5 fs:md",
};

const ICON_ONLY: Record<Size, string> = {
  sm: "w:8 h:8",
  md: "w:9 h:9",
  lg: "w:11 h:11",
};

export interface ButtonProps extends ComponentProps<typeof Button> {
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * Visual weight. `primary` for the main action on a view, `danger` for
   * destructive ones.
   */
  variant?: Variant;
  /**
   * Height, padding and text size. Every size is a fixed height, so a row of
   * buttons lines up.
   */
  size?: Size;
  /**
   * Corner radius. `squircle` uses `corner-shape`, which degrades to a rounded
   * square where that is unsupported. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /**
   * Swaps the icon for a spinner, dims the button and blocks interaction, while
   * leaving it focusable: `aria-busy` and `aria-disabled` rather than the
   * native `disabled` attribute, which would drop the control out of the tab
   * order while a reader is waiting on it.
   */
  loading?: boolean;
  /**
   * A glyph beside the label. Pass the icon and nothing else; the base gap
   * spaces it for you. With `iconOnly` it becomes the whole button, so give
   * that one an `aria-label`.
   */
  icon?: ReactNode;
  /** Which end `icon` sits at. */
  iconPosition?: IconSide;
  /**
   * Drops the label and draws the icon alone, keeping the label as the
   * accessible name. Needs `icon`: without one there would be nothing left to
   * show, so the prop has no effect.
   */
  iconOnly?: boolean;
  /**
   * Acts only once the button has been held down, for `true` 1.5 seconds or for
   * this many milliseconds. A stronger color sweeps across while it is held and
   * drains back if it is let go early. Space and Enter hold too.
   */
  hold?: boolean | number;
  /** What the button says for a moment once a hold completes. */
  holdLabel?: string;
  /** Called once a hold completes. A held button never calls `onClick`. */
  onHold?: () => void;
  /**
   * Acts only once a countdown runs out, for `true` 5 seconds or for this many
   * milliseconds. A press starts it and turns the button pale with the seconds
   * left in a badge, and a second press cancels it. Not with `hold`.
   */
  countdown?: boolean | number;
  /** What the button says while the countdown runs, beside the seconds left. */
  countdownLabel?: string;
  /** Called once a countdown runs out. A counting button never calls `onClick`. */
  onCountdown?: () => void;
  /**
   * The hover and focus transition. Turn it off for a static button, or when
   * the user has asked for reduced motion.
   */
  transition?: boolean;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /** The button's label. */
  children?: ReactNode;
}

/**
 * A primary action, in six variants, three sizes and four shapes, with loading,
 * icon-only, hold-to-confirm and countdown states.
 */
export default function ButtonBase({
  variant = "primary",
  size = "md",
  shape: shapeProp,
  loading = false,
  icon,
  iconPosition = "leading",
  iconOnly = false,
  hold,
  holdLabel,
  onHold,
  countdown,
  countdownLabel = "Undo",
  onCountdown,
  transition = true,
  disabled,
  className,
  focus = true,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const shape = useShape(shapeProp);
  const outline = focus
    ? merge(FOCUS, VARIANT_OUTLINE[variant], focus === true ? "" : focus)
    : "";

  const inactive = disabled || loading;
  const busy = loading && !disabled;
  const iconOnlyActive = iconOnly && Boolean(icon);
  const trailing = iconPosition === "trailing" && Boolean(icon);
  const glyph = loading ? (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className={`w:4 h:4 fs:0 ${transition ? "an:spin adu:700 atf:l aic:i @prm:an:none" : ""}`}
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  ) : (
    icon
  );

  const held = useHold(hold, onHold, transition);
  const timed = !hold && Boolean(countdown);
  const counter = useCountdown(timed ? countdown : undefined, onCountdown);
  const counting = counter.seconds > 0;
  const morph = useMorph<HTMLSpanElement>(counting, transition);
  const label = counting ? (
    <>
      {countdownLabel}
      <span
        className={merge(
          "d:if ai:c jc:c h:5 min-w:5 px:1 br:9999 fs:xs fw:600 fvn:tn",
          BADGE[variant],
        )}
      >
        {counter.seconds}
      </span>
    </>
  ) : holdLabel ? (
      <Swap
        first={children}
        second={holdLabel}
        swapped={held.done}
        animated={transition}
      />
    ) : (
      children
    );

  const classes = merge(
    outline,
    BASE,
    hold || timed ? "p:r o:h ta:none" : "",
    // primary hovers with opacity, which tp:ct does not carry
    transition && !inactive
      ? `${variant === "primary" ? "tp:a" : "tp:ct"} ${MOTION}`
      : "",
    counting ? COUNTING[variant] : VARIANTS[variant],
    inactive || counting ? "" : HOVERS[variant],
    iconOnlyActive ? ICON_ONLY[size] : SIZES[size],
    RADIUS.control[shape],
    inactive ? "o:60 c:na" : "c:p",
    className,
  );

  return (
    <Button
      className={classes}
      disabled={inactive}
      focusableWhenDisabled={busy}
      aria-busy={loading || undefined}
      aria-label={
        iconOnlyActive && typeof children === "string" ? children : undefined
      }
      onClick={hold ? undefined : timed ? counter.toggle : onClick}
      {...(hold && !inactive ? held.handlers : {})}
      {...props}
    >
      {iconOnlyActive ? (
        counting ? (
          label
        ) : (
          glyph
        )
      ) : timed ? (
        <span ref={morph} className="d:if ai:c jc:c g:2 ws:nw o:h">
          {counting ? <IconArrowBackUp aria-hidden className="w:4 h:4 fs:0" /> : !trailing && glyph}
          {label}
          {!counting && trailing && glyph}
        </span>
      ) : (
        <>
          {!trailing && glyph}
          {label}
          {trailing && glyph}
        </>
      )}
      {hold && (
        <span
          aria-hidden
          style={held.style}
          className={merge("p:a i:0 d:f ai:c jc:c g:2", HOLD_FILL[variant])}
        >
          {iconOnlyActive ? (
            glyph
          ) : (
            <>
              {!trailing && glyph}
              {label}
              {trailing && glyph}
            </>
          )}
        </span>
      )}
      {timed && (
        <span aria-live="polite" className="p:a w:px h:px o:h">
          {counter.started ? `${countdownLabel}, ${counter.started} seconds` : ""}
        </span>
      )}
      {hold && holdLabel && (
        <span aria-live="polite" className="p:a w:px h:px o:h">
          {held.done ? holdLabel : ""}
        </span>
      )}
    </Button>
  );
}

// both labels share one grid cell, so the button keeps the wider one's width
// both labels share one cell, so the button keeps the wider one's width; the
// incoming one rises in as the outgoing one rises out
function Swap({
  first,
  second,
  swapped,
  animated,
}: {
  first: ReactNode;
  second: ReactNode;
  swapped: boolean;
  animated: boolean;
}) {
  const motion = animated ? "tp:ot tdu:200 ttf:eo @prm:tp:none" : "";
  return (
    <span className="d:ig ji:c o:h">
      <span
        aria-hidden={swapped || undefined}
        className={`gcs:1 grs:1 ${motion} ${swapped ? "o:0 tty:-full" : ""}`}
      >
        {first}
      </span>
      <span
        aria-hidden={!swapped || undefined}
        className={`gcs:1 grs:1 ${motion} ${swapped ? "" : "o:0 tty:full"}`}
      >
        {second}
      </span>
    </span>
  );
}

function useHold(
  hold: boolean | number | undefined,
  onHold: (() => void) | undefined,
  animated: boolean,
) {
  const duration = typeof hold === "number" ? hold : 1500;
  const [phase, setPhase] = useState<"idle" | "holding" | "done">("idle");
  const [still, setStill] = useState(!animated);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // reduced motion fades the fill in over the same time, rather than sweeping it
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(!animated || query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [animated]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const start = () => {
    if (phase !== "idle") return;
    setPhase("holding");
    timer.current = setTimeout(() => {
      setPhase("done");
      onHold?.();
      timer.current = setTimeout(() => setPhase("idle"), 2400);
    }, duration);
  };

  const stop = () => {
    if (phase !== "holding") return;
    clearTimeout(timer.current);
    setPhase("idle");
  };

  const isKey = (event: KeyboardEvent) =>
    event.key === " " || event.key === "Enter";

  const full = phase !== "idle";
  const timing =
    phase === "holding"
      ? `${duration}ms linear`
      : `${still ? 200 : 350}ms cubic-bezier(0.25, 1, 0.5, 1)`;

  return {
    done: phase === "done",
    style: still
      ? { opacity: full ? 1 : 0, transition: `opacity ${timing}` }
      : {
          clipPath: full ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path ${timing}`,
        },
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start();
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
      onBlur: stop,
      onContextMenu: (event: MouseEvent) => event.preventDefault(),
      onKeyDown: (event: KeyboardEvent) => {
        if (!isKey(event)) return;
        event.preventDefault();
        if (!event.repeat) start();
      },
      onKeyUp: (event: KeyboardEvent) => {
        if (!isKey(event)) return;
        event.preventDefault();
        stop();
      },
    },
  };
}

function useCountdown(
  countdown: boolean | number | undefined,
  onCountdown: (() => void) | undefined,
) {
  const duration = typeof countdown === "number" ? countdown : 5000;
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(0);
  const timers = useRef<{
    tick?: ReturnType<typeof setInterval>;
    end?: ReturnType<typeof setTimeout>;
  }>({});

  const clear = () => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.end);
  };

  useEffect(() => clear, []);

  const reset = () => {
    clear();
    setSeconds(0);
    setStarted(0);
  };

  const start = () => {
    const endsAt = Date.now() + duration;
    const first = Math.ceil(duration / 1000);
    setSeconds(first);
    setStarted(first);
    timers.current.tick = setInterval(() => {
      setSeconds(Math.max(1, Math.ceil((endsAt - Date.now()) / 1000)));
    }, 200);
    timers.current.end = setTimeout(() => {
      reset();
      onCountdown?.();
    }, duration);
  };

  return { seconds, started, toggle: () => (seconds ? reset() : start()) };
}

// eases the content's width from the old label to the new one when `key` flips
function useMorph<T extends HTMLElement>(key: boolean, animated: boolean) {
  const ref = useRef<T>(null);
  const width = useRef(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transition = "";
    node.style.width = "";
    const to = node.offsetWidth;
    const from = width.current;
    width.current = to;
    const still =
      !animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!from || from === to || still) return;
    node.style.width = `${from}px`;
    node.getBoundingClientRect();
    node.style.transition = "width 250ms cubic-bezier(0.25, 1, 0.5, 1)";
    node.style.width = `${to}px`;
    const settle = () => {
      node.style.transition = "";
      node.style.width = "";
    };
    node.addEventListener("transitionend", settle, { once: true });
    return () => node.removeEventListener("transitionend", settle);
  }, [key, animated]);

  return ref;
}
