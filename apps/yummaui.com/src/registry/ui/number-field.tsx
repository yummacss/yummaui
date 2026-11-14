"use client";

import { NumberField } from "@base-ui/react/number-field";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { INPUT_TEXT, MESSAGE_IN, RADIUS, Roll, type Shape, type Size, SIZE, useShape, useShake } from "./style";

const FOCUS = "ow:0 oc:focus/40 fv:os:s fv:ow:3 fv:oo:0 fv:bc:focus fv:zi:10";

// the box draws focus for its input, so the outline wraps the value
const BOX_FOCUS = "ow:0 oc:focus/40 fw:os:s fw:ow:3 fw:oo:0 fw:bc:focus fw:zi:10";

// the focused part rises above its neighbours, so no stepper covers its outline
const STEP =
  "p:r d:f ai:c jc:c fs:0 p:0 bw:1 bg:raised bs-o:key c:label us:none c:p h:bg:well";
const BOX = "p:r d:f bw:1 bg:field bs-o:key";

const STEP_SIZES: Record<Size, string> = {
  sm: "w:8",
  md: "w:9",
  lg: "w:11",
};

const INPUT_SIZES: Record<Size, string> = {
  sm: `w:16 ${INPUT_TEXT}`,
  md: `w:20 ${INPUT_TEXT}`,
  lg: "w:24 fs:md",
};

const TEXT_SIZES: Record<Size, string> = {
  sm: INPUT_TEXT,
  md: INPUT_TEXT,
  lg: "fs:md",
};

// a step rolls the value: a button press, an arrow key, the wheel or a scrub; typing changes it in place
const stepped = (reason: string) =>
  reason.endsWith("-press") || reason === "keyboard" || reason === "wheel" || reason === "scrub";

const ICON_SIZES: Record<Size, string> = {
  sm: "w:3 h:3",
  md: "w:4 h:4",
  lg: "w:4 h:4",
};

export interface NumberFieldProps
  extends Omit<ComponentProps<typeof NumberField.Root>, "className" | "id"> {
  /**
   * Text above the control. Also a scrub area: drag left or right on it to
   * change the value.
   */
  label?: string;

  /**
   * Appends a red asterisk to the label & sets the input's native `required`
   * attribute.
   */
  required?: boolean;

  /** A line under the control, for context on what the number means. */
  description?: string;
  /**
   * Red border & this message in place of `description`. Wins over `success` if
   * both are set.
   */
  error?: string;
  /** Green border & this message in place of `description`. */
  success?: string;
  /**
   * Height of the buttons and the input together. The icon inside the buttons
   * grows only at `lg`.
   */
  size?: Size;
  /**
   * Corner radius on the group's outer edges. `squircle` uses `corner-shape`,
   * which degrades to a rounded square where that is unsupported. Inherits the
   * nearest `Shape`.
   */
  shape?: Shape;

  /**
   * Rolls the value when a step changes it, only the digits that differ moving.
   * Typing changes it in place, and reduced motion does the same.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline, drawn around the input and both buttons together. `true`
   * draws it, `false` removes it, and a string of Yumma CSS utilities restyles
   * it; write them with `fw:`, since the group draws it while anything inside
   * has focus. Removing it outright and putting nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

/**
 * A number input with increment and decrement buttons, in three sizes and three
 * shapes.
 */
export default function NumberFieldBase({
  label,
  required = false,
  description,
  error,
  success,
  size = "md",
  shape: shapeProp,
  disabled = false,
  className,
  focus = true,
  animated = true,
  onValueChange,
  ...props
}: NumberFieldProps) {
  const shape = useShape(shapeProp);
  const id = useId();
  const format = (value: number | null) =>
    value === null ? "" : new Intl.NumberFormat(props.locale, props.format).format(value);
  const start = props.value ?? props.defaultValue ?? null;
  const [shown, setShown] = useState({ value: start ?? 0, text: format(start), rolling: false });
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(settle.current), []);

  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const boxOutline = focus
    ? merge(BOX_FOCUS, focus === true ? "" : focus.replace(/\bfv:/g, "fw:"))
    : "";

  const status = error ? "bc:red-5" : success ? "bc:green-5" : "bc:rim";
  const message = error ?? success ?? description;
  const group = useShake<HTMLDivElement>(error);
  const stepClasses = (side: string) =>
    merge(outline, STEP, SIZE.height[size], STEP_SIZES[size], side, status);

  return (
    <NumberField.Root
      id={id}
      disabled={disabled}
      onValueChange={(value, details) => {
        onValueChange?.(value, details);
        const text = format(value);
        const rolling = animated && stepped(details.reason);
        setShown({ value: value ?? 0, text, rolling });
        clearTimeout(settle.current);
        // the roll covers the input until every character has landed
        if (rolling)
          settle.current = setTimeout(
            () => setShown((now) => ({ ...now, rolling: false })),
            250 + text.length * 30,
          );
      }}
      className={`d:f fd:c ai:fs g:2 ${disabled ? "o:60 c:na" : ""}`}
      {...props}
    >
      {label && (
        <NumberField.ScrubArea className="c:er">
          <label htmlFor={id} className="c:label fs:sm fw:500 c:er">
            {label}
            {required && <span className="c:red-5"> *</span>}
          </label>
        </NumberField.ScrubArea>
      )}

      <NumberField.Group ref={group} data-shake className="d:f">
        <NumberField.Decrement className={stepClasses(RADIUS.controlStart[shape])}>
          <IconMinus className={ICON_SIZES[size]} />
        </NumberField.Decrement>
        <span className={merge(BOX, "blw:0 brw:0", SIZE.height[size], boxOutline, status)}>
          <NumberField.Input
            required={required}
            aria-invalid={error ? true : undefined}
            className={merge(
              "os:none p:0 bw:0 bg:transparent fw:500 ta:c fvn:tn",
              shown.rolling ? "c:transparent" : "c:label",
              INPUT_SIZES[size],
              className,
            )}
          />
          <Roll
            value={shown.value}
            text={shown.text}
            still={!shown.rolling}
            className={merge(
              "p:a i:0 ai:c jc:c pe:none c:label fw:500",
              TEXT_SIZES[size],
              shown.rolling ? "" : "o:0",
            )}
          />
        </span>
        <NumberField.Increment className={stepClasses(RADIUS.controlEnd[shape])}>
          <IconPlus className={ICON_SIZES[size]} />
        </NumberField.Increment>
      </NumberField.Group>

      {message && (
        <p
          key={message}
          aria-live={error || success ? "polite" : undefined}
          className={`m:0 fs:xs ${error ? `c:red-5 ${MESSAGE_IN}` : success ? `c:green-6 ${MESSAGE_IN}` : "c:hint"}`}
        >
          {message}
        </p>
      )}
    </NumberField.Root>
  );
}
