"use client";

import { Slider } from "@base-ui/react/slider";
import { type FocusEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, useShape, type Shape } from "./style";

type Value = number | number[];

const FOCUS = "os:s ow:3 oo:0 oc:focus/40";

// the thumb is a handle the width of the key's end, holding the grip line; the key itself is the fill
const THUMB = "d:f ai:c jc:c w:6 h:100% os:none c:g";
const GRIP = "d:b w:px br:9999";

function defaultFormat(value: Value): ReactNode {
  return Array.isArray(value) ? `${value[0]} - ${value[1]}` : `${value}%`;
}

export interface SliderProps {
  /** Text beside the value, above the track. */
  label?: string;
  /** Appends a red asterisk to the label. */
  required?: boolean;
  /** A line under the control, for context on what the value means. */
  description?: string;
  /**
   * A single number for one thumb, or a two-item array for a range with two.
   * Whichever shape you start with is the shape the slider keeps. It does not
   * switch thumb count at runtime.
   */
  defaultValue?: Value;
  /** Controlled value, same shape rule as `defaultValue`. */
  value?: Value;
  /**
   * Called with the new value on every change. Required for a controlled
   * slider.
   */
  onValueChange?: (value: Value) => void;
  /** Lower bound. */
  min?: number;
  /** Upper bound. */
  max?: number;
  /** Amount each keyboard press or drag increment changes the value by. */
  step?: number;
  /**
   * Corner radius, applied to the track, the indicator and the thumb together.
   * `squircle` uses `corner-shape`. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks interaction and dims the control. */
  disabled?: boolean;
  /**
   * How the value is shown beside the label. Defaults to `50%` for one thumb,
   * `20 - 80` for a range; override for currency, units, or anything else.
   */
  formatValue?: (value: Value) => ReactNode;
  /**
   * A unit after the value, such as `px`. The number reads bold and the unit
   * quiet. Ignored when `formatValue` is set.
   */
  unit?: string;
  /**
   * Labels spread evenly under the track, first at the start, last at the end.
   */
  marks?: string[];
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

/**
 * A value between a min and a max, one thumb or two for a range, in three
 * shapes.
 */
export default function SliderBase({
  label,
  required = false,
  description,
  defaultValue,
  value: controlledValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  shape: shapeProp,
  disabled = false,
  formatValue,
  unit,
  marks,
  className,
  focus = true,
}: SliderProps) {
  const shape = useShape(shapeProp);
  const [internalValue, setInternalValue] = useState<Value>(
    defaultValue ?? controlledValue ?? 0,
  );
  const [focused, setFocused] = useState(-1);
  // the thumb a pointer holds, and whether that pointer has moved: a click glides, a drag follows at once
  const [held, setHeld] = useState(-1);
  const [moved, setMoved] = useState(false);
  const control = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (held < 0) return;
    // the slider may sit in a frame, so listen on its own window
    const view = control.current?.ownerDocument.defaultView ?? window;
    const release = () => {
      setHeld(-1);
      setMoved(false);
    };
    view.addEventListener("pointerup", release);
    view.addEventListener("pointercancel", release);
    return () => {
      view.removeEventListener("pointerup", release);
      view.removeEventListener("pointercancel", release);
    };
  }, [held]);
  const value = controlledValue ?? internalValue;
  const isRange = Array.isArray(value);

  const handleChange = (next: Value, details?: { activeThumbIndex?: number; event?: Event }) => {
    setInternalValue(next);
    onValueChange?.(next);
    const type = details?.event?.type ?? "";
    if (type.startsWith("pointer")) setHeld(details?.activeThumbIndex ?? 0);
    if (type === "pointermove") setMoved(true);
  };

  const outline = merge(
    focus ? FOCUS : "",
    (typeof focus === "string" ? focus : "").replace(/\bfv:/g, ""),
  );

  // a click sends the key over 250ms; a drag follows the pointer at once
  const glide = (dragging: boolean) => (dragging ? "" : "tp:a tdu:250 ttf:out-quart @prm:tp:none");
  const grip = (active: boolean) =>
    merge(GRIP, "tp:a tdu:150 ttf:out-quart @prm:tp:none", active ? "h:4 bg:label" : "h:3 bg:hint");
  const thumb = (index: number) => (
    <Slider.Thumb
      key={index}
      index={isRange ? index : undefined}
      className={merge(THUMB, glide(moved))}
      {...focusProps(index)}
    >
      <span aria-hidden className={grip(held === index || focused === index)} />
    </Slider.Thumb>
  );

  const focusProps = (index: number) => ({
    onFocus: (event: FocusEvent<HTMLInputElement>) => {
      if (event.target.matches(":focus-visible")) setFocused(index);
    },
    onBlur: () => setFocused(-1),
  });

  return (
    <div className={merge("d:f fd:c g:2 w:64", disabled && "o:60", className)}>
      <div className="d:f ai:c jc:sb">
        {label && (
          <label className="c:label fs:sm fw:500 us:none">
            {label}
            {required && <span className="c:red-5"> *</span>}
          </label>
        )}
        <span className="c:hint fs:sm fvn:tn">
          {formatValue ? (
            formatValue(value)
          ) : unit ? (
            <>
              <span className="c:label fw:500">
                {Array.isArray(value) ? value.join(" - ") : value}
              </span>{" "}
              {unit}
            </>
          ) : (
            defaultFormat(value)
          )}
        </span>
      </div>

      <Slider.Root
        value={value}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      >
        <Slider.Control
          ref={control}
          className={merge(
            "d:f h:9 p:1 bw:1 bc:line bg:well bs-o:sunk us:none ta:none",
            disabled ? "c:na" : "c:p",
            RADIUS.control[shape],
          )}
        >
          {/* the track is inset half a thumb each side, so a thumb centered on an end value stays in the well; inline, as positions depend on it */}
          <Slider.Track className="p:r f:1 h:100%" style={{ marginInline: "0.75rem" }}>
            {marks && marks.length > 1 &&
              marks.map((mark, index) => (
                <span
                  key={mark}
                  aria-hidden
                  className="p:a w:1 h:1 br:9999 bg:hint/40"
                  style={{ left: `${(index / (marks.length - 1)) * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }}
                />
              ))}
            <Slider.Indicator className={merge("p:r h:100%", glide(moved))}>
              {/* the key reaches half a thumb past each value, so the grip sits on it */}
              <span
                aria-hidden
                className={merge(
                  "p:a t:0 b:0 l:-3 r:-3 bw:1 bc:rim bg:raised bs-o:key",
                  RADIUS.controlInset[shape],
                  focused >= 0 ? outline : "",
                )}
              />
            </Slider.Indicator>
            {isRange ? value.map((_, index) => thumb(index)) : thumb(0)}
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      {marks && marks.length > 0 && (
        <div aria-hidden className="d:f jc:sb c:hint fs:xs">
          {marks.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
      )}

      {description && <p className="m:0 c:hint fs:xs">{description}</p>}
    </div>
  );
}
