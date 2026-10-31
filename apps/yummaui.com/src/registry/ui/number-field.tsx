"use client";

import { NumberField } from "@base-ui/react/number-field";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { useId } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, useShape, type Shape } from "./style";

type Size = "sm" | "md" | "lg";
const FOCUS = "ow:0 oc:focus/40 fv:os:s fv:ow:3 fv:oo:0 fv:bc:focus fv:zi:10";

// the box draws focus for its input, so the outline wraps the value
const BOX_FOCUS = "ow:0 oc:focus/40 fw:os:s fw:ow:3 fw:oo:0 fw:bc:focus fw:zi:10";

// the focused part rises above its neighbours, so no stepper covers its outline
const STEP =
  "p:r d:f ai:c jc:c fs:0 p:0 bw:1 bg:raised bs-o:key bc:rim c:label us:none c:p h:bg:well";
const BOX = "p:r d:f bw:1 bg:field bs-o:key bc:rim";

const SIZES: Record<Size, string> = {
  sm: "h:8",
  md: "h:9",
  lg: "h:11",
};

const STEP_SIZES: Record<Size, string> = {
  sm: "w:8",
  md: "w:9",
  lg: "w:11",
};

const INPUT_SIZES: Record<Size, string> = {
  sm: "w:16 fs:sm",
  md: "w:20 fs:sm",
  lg: "w:24 fs:md",
};

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
  size = "md",
  shape: shapeProp,
  disabled = false,
  className,
  focus = true,
  ...props
}: NumberFieldProps) {
  const shape = useShape(shapeProp);
  const id = useId();

  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const boxOutline = focus
    ? merge(BOX_FOCUS, focus === true ? "" : focus.replace(/\bfv:/g, "fw:"))
    : "";

  const stepClasses = (side: string) =>
    merge(outline, STEP, SIZES[size], STEP_SIZES[size], side);

  return (
    <NumberField.Root
      id={id}
      disabled={disabled}
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

      <NumberField.Group className="d:f">
        <NumberField.Decrement className={stepClasses(RADIUS.controlStart[shape])}>
          <IconMinus className={ICON_SIZES[size]} />
        </NumberField.Decrement>
        <span className={merge(BOX, "blw:0 brw:0", SIZES[size], boxOutline)}>
          <NumberField.Input
            required={required}
            className={merge(
              "os:none p:0 bw:0 bg:transparent c:label fw:500 ta:c fvn:tn",
              INPUT_SIZES[size],
              className,
            )}
          />
        </span>
        <NumberField.Increment className={stepClasses(RADIUS.controlEnd[shape])}>
          <IconPlus className={ICON_SIZES[size]} />
        </NumberField.Increment>
      </NumberField.Group>

      {description && <p className="m:0 c:hint fs:xs">{description}</p>}
    </NumberField.Root>
  );
}
