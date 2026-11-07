"use client";

import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Slider } from "@base-ui/react/slider";
import {
  clampChroma,
  formatHex,
  modeOklch,
  modeRgb,
  parse,
  useMode,
} from "culori/fn";
import { useId, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, FOCUS_WITHIN, RADIUS, type Shape, useShape } from "./style";

const toOklch = useMode(modeOklch);
useMode(modeRgb);

// light to dark; the middle step is the one a picked hue starts on
const LIGHTNESS = [0.96, 0.9, 0.82, 0.72, 0.6, 0.5, 0.42, 0.34, 0.26];
const HUES =
  "linear-gradient(to right, oklch(0.62 0.2 0), oklch(0.62 0.2 60), oklch(0.62 0.2 120), oklch(0.62 0.2 180), oklch(0.62 0.2 240), oklch(0.62 0.2 300), oklch(0.62 0.2 360))";

function shadesOf(hue: number): string[] {
  return LIGHTNESS.map((l) =>
    formatHex(clampChroma({ mode: "oklch", l, c: 0.2, h: hue }, "oklch")),
  );
}

function read(hex: string): { hue: number; step: number } | null {
  const color = parse(hex);
  if (!color) return null;
  const { l, h } = toOklch(color);
  let step = 0;
  for (let i = 1; i < LIGHTNESS.length; i++)
    if (Math.abs(LIGHTNESS[i] - l) < Math.abs(LIGHTNESS[step] - l)) step = i;
  return { hue: Math.round(h ?? 0), step };
}

const HEX = /^#?[0-9a-f]{6}$/i;
const normal = (hex: string) =>
  `#${hex.replace("#", "").toLowerCase()}`;

export interface ColorPickerProps {
  /** Text above the picker. */
  label?: string;
  /**
   * The color, as a hex like `#5b4bdb`. Controlled; pair with `onValueChange`.
   */
  value?: string;
  /** The color it starts on when uncontrolled. Without one, the middle shade of a violet. */
  defaultValue?: string;
  /** Called with the new hex whenever the color changes. */
  onValueChange?: (value: string) => void;
  /** Blocks every part of the picker & dims it. */
  disabled?: boolean;
  /**
   * Corner radius of the shades, the field & the swatch. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
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
 * A color from a hue slider, a row of nine shades and a hex field, every part a
 * Base UI control.
 */
export default function ColorPicker({
  label,
  value: controlled,
  defaultValue,
  onValueChange,
  disabled = false,
  shape: shapeProp,
  focus = true,
  className,
}: ColorPickerProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const within = focus
    ? merge(FOCUS_WITHIN, focus === true ? "" : focus.replaceAll("fv:", "fw:"))
    : "";
  const id = useId();

  const [own, setOwn] = useState(() =>
    defaultValue ? normal(defaultValue) : shadesOf(290)[4],
  );
  const value = controlled !== undefined ? normal(controlled) : own;
  const start = read(value) ?? { hue: 290, step: 4 };
  const [hue, setHue] = useState(start.hue);
  const [draft, setDraft] = useState<string | null>(null);
  const shades = shadesOf(hue);

  const change = (next: string) => {
    if (controlled === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const pickHue = (next: number) => {
    setHue(next);
    const at = shades.indexOf(value);
    change(shadesOf(next)[at === -1 ? (read(value)?.step ?? 4) : at]);
  };

  const commit = () => {
    if (draft === null) return;
    if (HEX.test(draft)) {
      const next = normal(draft);
      const seen = read(next);
      if (seen) setHue(seen.hue);
      change(next);
    }
    setDraft(null);
  };

  return (
    <div
      className={merge(
        "d:f fd:c g:3 w:72 max-w:100% c:label",
        disabled ? "o:60 c:na" : "",
        className,
      )}
    >
      {label && (
        <span id={`${id}-label`} className="fs:sm fw:500 us:none">
          {label}
        </span>
      )}

      <Slider.Root
        value={hue}
        onValueChange={(next) => pickHue(Number(next))}
        min={0}
        max={360}
        disabled={disabled}
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        <Slider.Control className="d:f ai:c py:2 us:none ta:none">
          <Slider.Track
            className="p:r h:3 w:100% br:9999 bs-o:sunk"
            style={{ background: HUES }}
          >
            <Slider.Thumb
              aria-label="Hue"
              getAriaValueText={(_, next) => `${next} degrees`}
              className={merge(
                "w:5 h:5 br:9999 bw:2 bc:white bs-o:key",
                within,
              )}
              style={{ background: shades[4] }}
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <RadioGroup
        aria-label="Shade"
        value={shades.includes(value) ? value : ""}
        onValueChange={(next) => change(String(next))}
        disabled={disabled}
        className="d:g gtc:9 g:1"
      >
        {shades.map((shade, index) => (
          <Radio.Root
            key={shade}
            value={shade}
            aria-label={`Shade ${index + 1} of ${LIGHTNESS.length}, ${shade}`}
            className={(state) =>
              merge(
                outline,
                "p:r ar:1/1 p:0 bw:1 bc:black/10 c:p",
                RADIUS.chip[shape],
                state.checked ? "ow:2 os:s oo:2 oc:label" : "",
              )
            }
            style={{ background: shade }}
          />
        ))}
      </RadioGroup>

      <Field.Root className="d:f ai:c g:2" disabled={disabled}>
        <span
          aria-hidden
          className={merge("fs:0 w:9 h:9 bw:1 bc:black/10", RADIUS.control[shape])}
          style={{ background: value }}
        />
        <Field.Label className="p:a w:px h:px o:h">Hex</Field.Label>
        <Input
          value={draft ?? value.toUpperCase()}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => event.key === "Enter" && commit()}
          spellCheck={false}
          className={merge(
            outline,
            "f:1 min-w:0 h:9 px:3 bw:1 bc:rim bg:field bs-o:sunk c:label ff:m fs:sm",
            RADIUS.control[shape],
          )}
        />
      </Field.Root>
    </div>
  );
}
