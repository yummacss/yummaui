"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { type ReactNode, useId, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, SIZE, type Shape, type Size, useShape } from "./style";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  /** A glyph that names the choice, drawn in a tile on a card. */
  icon?: ReactNode;
}

type Variant = "plain" | "card";

const BASE = "d:f ai:c jc:c p:0 m:0";

const DOT_SIZES: Record<Size, string> = {
  sm: "w:1 h:1",
  md: "w:2 h:2",
  lg: "w:3 h:3",
};

// a box of the label's first line, so the circle sits level with it
const LINE: Record<Size, string> = {
  sm: "h:4",
  md: "h:5",
  lg: "h:6",
};

const ROUND = "br:9999";

const PICKED =
  "bw:1 bg:check bc:edge bs-o:key-fill";
const UNPICKED = "bw:1 bg:field bs-o:key bc:rim";

export interface RadioProps {
  /**
   * The choices. `value` and `label` are required; `description` and `icon` are
   * optional per option. The shape is fixed rather than generic because you own
   * the file: data that does not fit is an edit to the option body, not an API.
   */
  options: RadioOption[];
  /**
   * A caption above the group, correctly wired to it via `aria-labelledby`.
   * Without one the group has no accessible name at all.
   */
  label?: string;
  /**
   * The option selected when you are not controlling the group. Pair `value`
   * with `onValueChange` instead if you are.
   */
  defaultValue?: string;
  /** Controlled selection. */
  value?: string;
  /** Called with the newly selected value. Required for a controlled group. */
  onValueChange?: (value: string) => void;
  /**
   * `card` draws each option as a card the whole of which picks it, with its
   * `icon` in a tile and the circle at the end.
   */
  variant?: Variant;
  /** The circle, the dot and the label together. */
  size?: Size;
  /**
   * Corner radius of a card and its icon tile. The circle stays round, since
   * round is what says one of these. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks interaction and dims every option. */
  disabled?: boolean;
  /**
   * The dot's transition when selection changes. Turn it off for a static
   * group, or when the user has asked for reduced motion.
   */
  animated?: boolean;
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
 * A single choice from a short list, always round, with an optional icon and
 * description on each option.
 */
export default function RadioBase({
  options,
  label,
  defaultValue,
  value,
  onValueChange,
  variant = "plain",
  size = "md",
  shape: shapeProp,
  disabled = false,
  animated = true,
  className,
  focus = true,
}: RadioProps) {
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";

  const labelId = useId();
  // a card's corners follow the shape; the circle stays round whatever it is
  const corners = useShape(shapeProp);
  const card = variant === "card";
  // the card's circle sits outside Base UI's radio, so it reads the choice from here
  const [own, setOwn] = useState(defaultValue);
  const picked = value ?? own;

  const dotClasses = (checked: boolean) =>
    checked
      ? `${DOT_SIZES[size]} ${ROUND} bg:on-fill ${animated ? "tp:t tdu:250 ttf:out-back @st:s:0 @prm:tp:none" : ""}`
      : "d:none";

  return (
    <div className="d:f fd:c g:2 max-w:100%">
      {label && (
        <div id={labelId} className="c:label fs:sm fw:500 us:none">
          {label}
        </div>
      )}

      <RadioGroup
        aria-labelledby={label ? labelId : undefined}
        defaultValue={defaultValue}
        value={value}
        onValueChange={(next: string) => {
          setOwn(next);
          onValueChange?.(next);
        }}
        disabled={disabled}
        className={merge("d:f fd:c g:2", !card && "ai:fs", className)}
      >
        {options.map((option) => {
          const rootClasses = (checked: boolean) =>
            merge(
              outline,
              BASE,
              SIZE.mark[size],
              ROUND,
              checked ? PICKED : UNPICKED,
            );

          const indicator = (
            <Radio.Indicator className={(state) => dotClasses(state.checked)} />
          );

          if (card) {
            return (
              <Radio.Root
                key={option.value}
                value={option.value}
                className={(state) =>
                  merge(
                    outline,
                    "d:f ai:c g:3 w:100% p:3 m:0 bw:1 bg:raised bs-o:key ta:l us:none tp:c tdu:150 @prm:tp:none",
                    RADIUS.popup[corners],
                    state.checked ? "bc:check" : "bc:rim",
                    disabled ? "o:60 c:na" : "c:p",
                  )
                }
              >
                {option.icon && (
                  <span aria-hidden className={merge("d:f ai:c jc:c fs:0 w:9 h:9 bw:1 bc:line bg:well c:hint", RADIUS.chip[corners])}>
                    {option.icon}
                  </span>
                )}
                <span className="d:f fd:c f:1 min-w:0">
                  <span className={`c:label fw:500 ${SIZE.text[size]}`}>{option.label}</span>
                  {option.description && <span className="c:hint fs:xs">{option.description}</span>}
                </span>
                {/* the circle as the plain radio draws it, here only a picture of the state */}
                <span
                  aria-hidden
                  className={merge(BASE, SIZE.mark[size], ROUND, "fs:0", picked === option.value ? PICKED : UNPICKED)}
                >
                  <Radio.Indicator className={(state) => dotClasses(state.checked)} />
                </span>
              </Radio.Root>
            );
          }

          return (
            <label
              key={option.value}
              className={`d:f ai:fs g:2 us:none ${
                disabled ? "o:60 c:na" : "c:p"
              }`}
            >
              <span className={`d:f ai:c fs:0 ${LINE[size]}`}>
                <Radio.Root
                  value={option.value}
                  className={(state) => rootClasses(state.checked)}
                >
                  {indicator}
                </Radio.Root>
              </span>
              <span className="d:f fd:c">
                <span className={`c:label fw:500 ${SIZE.text[size]}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="c:hint fs:xs">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
