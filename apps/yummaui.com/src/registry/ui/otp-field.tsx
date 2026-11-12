"use client";

import { Field } from "@base-ui/react/field";
import { OTPField } from "@base-ui/react/otp-field";
import { IconCheck } from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, MESSAGE_IN, RADIUS, type Shape, type Size, useShape, useShake } from "./style";

type ValidationType = "numeric" | "alpha" | "alphanumeric";

const SLOT =
  "p:0 bw:1 bs-o:key ta:c fw:500";

const SLOT_SIZES: Record<Size, string> = {
  sm: "w:8 h:9 fs:md",
  md: "w:9 h:11 fs:lg",
  lg: "w:11 h:13 fs:xl",
};

export interface OTPFieldProps
  extends Omit<
    ComponentProps<typeof OTPField.Root>,
    "className" | "length" | "validationType"
  > {
  /**
   * Text above the slots, wired to the first one through Base UI's
   * `Field.Label`.
   */
  label?: string;
  /** A line under the slots, for where the code comes from. */
  description?: string;
  /**
   * The code was wrong: the slots shake, the digits clear, and this message
   * takes the place of `description`.
   */
  error?: string;
  /**
   * The code was right: the slots turn green, then fold into a key with this
   * text.
   */
  success?: string;
  /** How many characters the code has, one slot each. */
  length?: number;
  /**
   * Slots per group, with a dash between groups. `0` draws one unbroken row.
   */
  groupSize?: number;
  /**
   * Which characters a slot accepts. Anything else is dropped as it is typed or
   * pasted, and the mobile keyboard follows it.
   */
  validationType?: ValidationType;
  /** Draws each character as a dot, as a password field does. */
  mask?: boolean;
  /** Width, height and type size of every slot. */
  size?: Size;
  /**
   * Corner radius on each slot. `squircle` uses `corner-shape`, which degrades
   * to a rounded square where that is unsupported. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
  /** Blocks input and dims the whole field, label included. */
  disabled?: boolean;
  /**
   * Appends a red asterisk to the label and makes the code required when a form
   * submits.
   */
  required?: boolean;
  /**
   * The focus outline on the slot being typed in. `true` draws it, `false`
   * removes it, and a string of Yumma CSS utilities restyles it. Removing it
   * outright and putting nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A one-time code input, one slot per character, in three sizes and three
 * shapes.
 */
export default function OTPFieldBase({
  label,
  description,
  error,
  success,
  length = 6,
  groupSize = 3,
  validationType = "numeric",
  mask = false,
  size = "md",
  shape: shapeProp,
  disabled = false,
  required = false,
  focus = true,
  className,
  ...props
}: OTPFieldProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const slots = Array.from({ length }, (_, index) => index);
  const { value, defaultValue, onValueChange, ...rest } = props;
  const [own, setOwn] = useState(defaultValue ?? "");
  // a new error: the slots tint and shake, then the digits blur away and clear
  const [wrong, setWrong] = useState(false);
  const [fading, setFading] = useState(false);
  const [folded, setFolded] = useState(false);
  const row = useShake<HTMLDivElement>(error, 18, "input");
  const last = useRef(error);

  useEffect(() => {
    if (!error || error === last.current) {
      last.current = error;
      return;
    }
    last.current = error;
    setWrong(true);
    const timers = [
      setTimeout(() => setFading(true), 560),
      setTimeout(() => {
        setOwn("");
        onValueChange?.("", undefined as never);
        setFading(false);
        row.current?.querySelector("input")?.focus();
      }, 800),
      setTimeout(() => setWrong(false), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, [error, onValueChange, row]);

  useEffect(() => {
    setFolded(false);
    if (!success) return;
    const timer = setTimeout(() => setFolded(true), 1400);
    return () => clearTimeout(timer);
  }, [success]);

  // each color picked once by state, never overridden
  const tone = success
    ? "bc:green-5 bg:green-5/10 c:green-6"
    : wrong
      ? "bc:red-5 bg:red-5/10 c:red-5"
      : error
        ? "bc:red-5 bg:field c:label"
        : "bc:rim bg:field c:label";

  return (
    <Field.Root
      disabled={disabled}
      className={`d:f fd:c ai:c g:2 ${disabled ? "o:60 c:na" : ""}`}
    >
      {label && (
        <Field.Label className="c:label fs:sm fw:500">
          {label}
          {required && <span className="c:red-5"> *</span>}
        </Field.Label>
      )}

      <div className="p:r d:f jc:c">
      <OTPField.Root
        ref={row}
        data-shake
        length={length}
        validationType={validationType}
        mask={mask}
        required={required}
        value={value ?? own}
        onValueChange={(next, details) => {
          setOwn(next);
          onValueChange?.(next, details);
        }}
        aria-invalid={error ? true : undefined}
        // opacity and blur together, which no single transition-property names
        className={`d:f ai:c g:2 tp:a tdu:200 ttf:out-quart @prm:tp:none ${folded ? "o:0 fb:4 pe:none" : ""}`}
        {...rest}
      >
        {slots.map((index) => (
          <Fragment key={index}>
            {index > 0 && groupSize > 0 && index % groupSize === 0 && (
              <OTPField.Separator className="w:2 h:px bg:hint" />
            )}
            <OTPField.Input
              className={merge(
                outline,
                SLOT,
                SLOT_SIZES[size],
                RADIUS.control[shape],
                className,
                tone,
              )}
              // the digit alone blurs away: its shadow spreads as its color fades
              style={{
                transition:
                  "color 220ms, text-shadow 220ms, background-color 400ms, border-color 400ms",
                transitionDelay: success ? `${index * 40}ms` : "0ms",
                ...(fading
                  ? { color: "transparent", textShadow: "0 0 10px transparent" }
                  : wrong
                    ? { textShadow: "0 0 0 currentColor" }
                    : {}),
              }}
            />
          </Fragment>
        ))}
      </OTPField.Root>
        {success && (
          <span
            aria-hidden={!folded}
            className={merge(
              "p:a d:if ai:c g:2 h:10 px:4 bg:green-7 c:white fw:500 fs:sm bs-o:key-fill pe:none",
              "tp:ot tdu:250 ttf:out-quart @prm:tp:none",
              RADIUS.control[shape],
              folded ? "o:100 s:100" : "o:0 s:97",
            )}
            style={{ top: "50%", translate: "0 -50%" }}
          >
            <IconCheck aria-hidden className="w:4 h:4" />
            {success}
          </span>
        )}
      </div>

      {(error ?? description) && (
        <Field.Description
          key={error ?? description}
          className={`m:0 tw:p fs:xs ${error ? `c:red-5 ${MESSAGE_IN}` : "c:hint"}`}
        >
          {error ?? description}
        </Field.Description>
      )}
    </Field.Root>
  );
}
