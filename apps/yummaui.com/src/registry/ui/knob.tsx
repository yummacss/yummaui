"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState, type CSSProperties } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, Roll, type Size } from "./style";

// the arc sweeps 270 degrees, from the lower left round to the lower right
const SWEEP = 270;
const START = -135;

const DIAL: Record<Size, string> = { sm: "w:20 h:20", md: "w:24 h:24", lg: "w:28 h:28" };

const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const;
};

const arc = (from: number, to: number, r = 46) => {
  if (Math.abs(to - from) < 0.01) return "";
  const [a, b] = from < to ? [from, to] : [to, from];
  const [x1, y1] = polar(a, r);
  const [x2, y2] = polar(b, r);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

export interface KnobProps {
  /** The name above the knob, which also names it to screen readers. */
  label: string;
  /**
   * The value at the start. A double-click returns to it, or to the first
   * `value`.
   */
  defaultValue?: number;
  /** Controlled value. Pass it with `onValueChange`. */
  value?: number;
  /** Called with the new value. */
  onValueChange?: (value: number) => void;
  /** The lowest value. */
  min?: number;
  /** The highest value. */
  max?: number;
  /** The amount one step moves. */
  step?: number;
  /** Fills the arc from the top, for a value with a middle, such as balance. */
  centered?: boolean;
  /** Draws a tick at each step, for a knob with a few settings. */
  ticks?: boolean;
  /** Text after the value, such as `%`. */
  unit?: string;
  /** Writes the value under the knob, and reads it to screen readers. */
  formatValue?: (value: number) => string;
  /** Submits the value with a form under this name. */
  name?: string;
  /** The dial's size. */
  size?: Size;
  /** Blocks turning and dims the knob. */
  disabled?: boolean;
  /**
   * A step from the keyboard or the wheel turning over 150ms, and the value
   * rolling. Reduced motion turns both off.
   */
  animated?: boolean;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A value turned on a round dial: drag up or down, scroll, or use the arrow
 * keys, and double-click to put it back.
 */
export default function Knob({
  label,
  defaultValue,
  value: controlled,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  centered = false,
  ticks = false,
  unit,
  formatValue,
  name,
  size = "md",
  disabled = false,
  animated = true,
  focus = true,
  className,
}: KnobProps) {
  const id = useId();
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  // a double-click returns to the value the knob started at, given as either prop
  const [start] = useState(() => defaultValue ?? controlled ?? (centered ? (min + max) / 2 : min));
  const [own, setOwn] = useState(start);
  const value = controlled ?? own;
  // a drag follows the hand; a step from the keyboard or the wheel glides
  const [gliding, setGliding] = useState(false);
  const dial = useRef<HTMLDivElement>(null);

  const steps = Math.max(1, Math.round((max - min) / step));
  const angle = (v: number) => START + ((v - min) / (max - min)) * SWEEP;
  const text = formatValue ? formatValue(value) : `${value}${unit ? (unit === "%" ? "%" : ` ${unit}`) : ""}`;

  const set = (next: number, glide: boolean) => {
    const snapped = Math.min(max, Math.max(min, min + Math.round((next - min) / step) * step));
    const clean = Number(snapped.toFixed(10));
    if (clean === value) return;
    setGliding(glide);
    setOwn(clean);
    onValueChange?.(clean);
  };

  // the wheel needs a listener that can stop the page scrolling
  const latest = useRef({ value, set, disabled });
  latest.current = { value, set, disabled };
  useEffect(() => {
    const node = dial.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (latest.current.disabled) return;
      event.preventDefault();
      latest.current.set(latest.current.value + (event.deltaY < 0 ? step : -step), true);
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, [step]);

  const drag = useRef<{ y: number; from: number } | null>(null);
  // a few settings take a long pull each, many take a short one
  const pull = Math.min(24, Math.max(2, 200 / steps));
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, from: value };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    set(drag.current.from + Math.round((drag.current.y - event.clientY) / pull) * step, ticks);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, Math.round(steps / 10) * step);
    const moves: Record<string, number> = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big };
    if (event.key in moves) set(value + moves[event.key], true);
    else if (event.key === "Home") set(min, true);
    else if (event.key === "End") set(max, true);
    else return;
    event.preventDefault();
  };

  const turn = angle(value);
  const from = centered ? angle((min + max) / 2) : START;

  return (
    <div className={merge("d:if fd:c ai:c g:2 c:label", disabled && "o:60", className)}>
      <span id={id} className="fs:sm fw:500">
        {label}
      </span>
      <div
        ref={dial}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => !disabled && set(start, true)}
        className={merge("p:r fs:0 br:9999 ta:none us:none", DIAL[size], disabled ? "c:na" : "c:g")}
      >
        <svg aria-hidden viewBox="0 0 100 100" className="p:a i:0 w:100% h:100% o:v">
          <path d={arc(START, START + SWEEP)} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" className="c:line" />
          {value !== (centered ? (min + max) / 2 : min) && (
            <path d={arc(from, turn)} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" className="c:fill" />
          )}
          {ticks &&
            Array.from({ length: steps + 1 }, (_, index) => {
              const [x1, y1] = polar(START + (index / steps) * SWEEP, 50);
              const [x2, y2] = polar(START + (index / steps) * SWEEP, 54);
              return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="c:hint" />;
            })}
        </svg>
        {/* the sunk well, and in it the knob: a raised round key */}
        <div aria-hidden className="p:a i:3 br:9999 bw:1 bc:line bg:well bs-o:sunk" />
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={id}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={text}
          aria-disabled={disabled || undefined}
          onKeyDown={disabled ? undefined : onKeyDown}
          className={merge(outline, "p:a i:4 br:9999 bw:1 bc:rim bg:raised bs-o:key")}
        >
          <span
            aria-hidden
            className={merge("p:a i:0 br:9999 ro:var(--turn)", gliding && animated ? "tp:t tdu:150 ttf:out-quart @prm:tp:none" : "")}
            style={{ "--turn": `${turn}deg` } as CSSProperties}
          >
            <span className="p:a l:50% t:calc(12%) w:calc(2px) h:calc(22%) ml:-px br:9999 bg:label" />
          </span>
        </div>
      </div>
      <span aria-hidden className="fs:sm c:hint fvn:tn">
        <Roll value={value} text={text} still={!animated} />
      </span>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
