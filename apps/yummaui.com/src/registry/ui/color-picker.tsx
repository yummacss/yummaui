"use client";

import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Popover } from "@base-ui/react/popover";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Slider } from "@base-ui/react/slider";
import { IconColorPicker } from "@tabler/icons-react";
import {
  clampChroma,
  formatHex,
  modeHsv,
  modeOklch,
  modeRgb,
  parse,
  useMode,
} from "culori/fn";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { merge } from "yummacss/merge";
import { FOCUS, FOCUS_WITHIN, RADIUS, type Shape, useShape } from "./style";

const toOklch = useMode(modeOklch);
const toHsv = useMode(modeHsv);
useMode(modeRgb);

type Variant = "inline" | "popover";

// light to dark; the middle step is the one a picked hue starts on
const LIGHTNESS = [0.96, 0.9, 0.82, 0.72, 0.6, 0.5, 0.42, 0.34, 0.26];
const OKLCH_HUES =
  "linear-gradient(to right, oklch(0.62 0.2 0), oklch(0.62 0.2 60), oklch(0.62 0.2 120), oklch(0.62 0.2 180), oklch(0.62 0.2 240), oklch(0.62 0.2 300), oklch(0.62 0.2 360))";
const HSV_HUES =
  "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
const SWATCHES = [
  "#24222a",
  "#d7263d",
  "#e8890c",
  "#2f9e5b",
  "#1a8fbf",
  "#5b4bdb",
  "#b14fc5",
];

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

function hsvOf(hex: string): { h?: number; s: number; v: number } {
  const color = parse(hex);
  if (!color) return { s: 0, v: 0 };
  const { h, s, v } = toHsv(color);
  return { h, s: s ?? 0, v: v ?? 0 };
}

const HEX = /^#?[0-9a-f]{6}$/i;
const HEX_ALPHA = /^#?[0-9a-f]{6}([0-9a-f]{2})?$/i;
// a checkerboard under a see-through color
const CHECKER = "repeating-conic-gradient(#d8d8de 0 25%, #fff 0 50%) 0 0 / 8px 8px";

/** The color without its opacity digits, and the opacity from 0 to 1. */
function split(hex: string): { base: string; alpha: number } {
  const digits = hex.replace("#", "");
  return {
    base: `#${digits.slice(0, 6)}`,
    alpha: digits.length === 8 ? Number.parseInt(digits.slice(6), 16) / 255 : 1,
  };
}

/** A hex with two opacity digits, or six when it is opaque. */
function join(base: string, alpha: number): string {
  if (alpha >= 1) return base;
  return `${base}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
}

/** A see-through color drawn over a checkerboard, so its opacity shows. */
const fillOf = (hex: string) =>
  split(hex).alpha < 1 ? `linear-gradient(${hex}, ${hex}), ${CHECKER}` : hex;
const normal = (hex: string) => `#${hex.replace("#", "").toLowerCase()}`;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

export interface ColorPickerProps {
  /** Text above the picker. */
  label?: string;
  /**
   * The color, as a hex like `#5b4bdb`. Controlled; pair with `onValueChange`.
   */
  value?: string;
  /**
   * The color it starts on when uncontrolled. Without one, the middle shade of
   * a violet.
   */
  defaultValue?: string;
  /** Called with the new hex whenever the color changes. */
  onValueChange?: (value: string) => void;
  /**
   * `inline` shows a hue slider, nine shades and a hex field in place.
   * `popover` puts any color behind a swatch button: a saturation and
   * brightness area, a hue slider, a hex field and `swatches`.
   */
  variant?: Variant;
  /** Colors one press away, under the hex field. Popover only. */
  swatches?: string[];
  /**
   * An opacity slider under the hue slider. Below 100% the value carries two
   * more hex digits, as in `#5b4bdb80`. Popover only.
   */
  opacity?: boolean;
  /** Blocks every part of the picker & dims it. */
  disabled?: boolean;
  /**
   * Where the popup is rendered. Defaults to `document.body`, which is right
   * almost always; pass an element to portal somewhere else, such as inside a
   * frame or a container that owns its own stacking context.
   */
  container?: HTMLElement | null;
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

function HexField({
  value,
  onCommit,
  outline,
  shape,
  disabled,
  extra,
  alpha = false,
}: {
  alpha?: boolean;
  value: string;
  onCommit: (hex: string) => void;
  outline: string;
  shape: Shape;
  disabled: boolean;
  extra?: ReactNode;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && (alpha ? HEX_ALPHA : HEX).test(draft))
      onCommit(normal(draft));
    setDraft(null);
  };

  return (
    <Field.Root className="d:f ai:c g:2" disabled={disabled}>
      <span
        aria-hidden
        className={merge("fs:0 w:9 h:9 bw:1 bc:black/10", RADIUS.control[shape])}
        style={{ background: fillOf(value) }}
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
      {extra}
    </Field.Root>
  );
}

function Hue({
  value,
  onChange,
  gradient,
  thumb,
  disabled,
  within,
  labelledBy,
}: {
  value: number;
  onChange: (hue: number) => void;
  gradient: string;
  thumb: string;
  disabled: boolean;
  within: string;
  labelledBy?: string;
}) {
  return (
    <Slider.Root
      value={value}
      onValueChange={(next) => onChange(Number(next))}
      min={0}
      max={360}
      disabled={disabled}
      aria-labelledby={labelledBy}
    >
      <Slider.Control className="d:f ai:c py:2 us:none ta:none">
        <Slider.Track
          className="p:r h:3 w:100% br:9999 bs-o:sunk"
          style={{ background: gradient }}
        >
          <Slider.Thumb
            aria-label="Hue"
            getAriaValueText={(_, next) => `${next} degrees`}
            className={merge("w:5 h:5 br:9999 bw:2 bc:white bs-o:key", within)}
            style={{ background: thumb }}
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

// a 2D control has no Base UI part: one slider thumb, left and right for saturation, up and down for brightness
function Area({
  hue,
  s,
  v,
  color,
  onChange,
  disabled,
  outline,
  shape,
}: {
  hue: number;
  s: number;
  v: number;
  color: string;
  onChange: (s: number, v: number) => void;
  disabled: boolean;
  outline: string;
  shape: Shape;
}) {
  const box = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);

  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    onChange(
      clamp((event.clientX - rect.left) / rect.width),
      clamp(1 - (event.clientY - rect.top) / rect.height),
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const moves: Record<string, [number, number]> = {
      ArrowRight: [s + step, v],
      ArrowLeft: [s - step, v],
      ArrowUp: [s, v + step],
      ArrowDown: [s, v - step],
      PageUp: [s, v + 0.1],
      PageDown: [s, v - 0.1],
      Home: [0, v],
      End: [1, v],
    };
    const next = moves[event.key];
    if (!next || disabled) return;
    event.preventDefault();
    onChange(clamp(next[0]), clamp(next[1]));
  };

  const percent = (n: number) => Math.round(n * 100);

  return (
    <div
      ref={box}
      className={merge("p:r h:36 w:100% ta:none", RADIUS.block[shape], disabled ? "" : "c:p")}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue} 100% 50%))`,
      }}
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event);
        knob.current?.focus();
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          fromPointer(event);
      }}
    >
      <div
        ref={knob}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent(s)}
        aria-valuetext={`Saturation ${percent(s)}%, brightness ${percent(v)}%`}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        className={merge(
          outline,
          "p:a w:5 h:5 br:9999 bw:2 bc:white bs-o:key",
        )}
        style={{
          left: `${s * 100}%`,
          top: `${(1 - v) * 100}%`,
          translate: "-50% -50%",
          background: color,
        }}
      />
    </div>
  );
}

/**
 * A color, picked inline from a hue slider, nine shades and a hex field, or
 * from a popover with a saturation and brightness area.
 */
export default function ColorPicker({
  label,
  value: controlled,
  defaultValue,
  onValueChange,
  variant = "inline",
  swatches = SWATCHES,
  opacity = false,
  disabled = false,
  container,
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
  const change = (next: string) => {
    if (controlled === undefined) setOwn(next);
    onValueChange?.(next);
  };

  // inline: hue in OKLCH, so the nine shades step evenly in lightness
  const [hue, setHue] = useState(() => read(value)?.hue ?? 290);
  const shades = shadesOf(hue);

  // popover: hue in HSV, kept apart so a gray does not lose it
  const { base, alpha } = split(value);
  const hsv = hsvOf(base);
  const [hsvHue, setHsvHue] = useState(() => hsv.h ?? 260);
  // where the area and hue last put the color; hex rounding would move the knob off the pointer
  const [picked, setPicked] = useState<{ value: string; h: number; s: number; v: number } | null>(null);
  const mine = picked?.value === value ? picked : null;
  const shownHue = mine ? mine.h : hsv.s > 0 && hsv.v > 0 && hsv.h !== undefined ? hsv.h : hsvHue;
  const shownS = mine ? mine.s : hsv.s;
  const shownV = mine ? mine.v : hsv.v;
  const pick = (h: number, s: number, v: number) => {
    const next = hsvHex(h, s, v);
    setPicked({ value: next, h, s, v });
    change(next);
  };
  // keeps the opacity while the color moves
  const hsvHex = (h: number, s: number, v: number) =>
    join(formatHex({ mode: "hsv", h, s, v }), opacity ? alpha : 1);

  const [dropper, setDropper] = useState(false);
  useEffect(() => setDropper("EyeDropper" in window), []);

  const typed = (next: string) => {
    const seen = read(split(next).base);
    if (seen) setHue(seen.hue);
    const h = hsvOf(split(next).base).h;
    if (h !== undefined) setHsvHue(h);
    change(next);
  };

  const labelId = label ? `${id}-label` : undefined;
  const heading = label && (
    <span id={labelId} className="fs:sm fw:500 us:none">
      {label}
    </span>
  );

  if (variant === "popover") {
    const drop = async () => {
      try {
        const picked = await new (
          window as unknown as {
            EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
          }
        ).EyeDropper().open();
        typed(join(normal(formatHex(picked.sRGBHex) ?? base), opacity ? alpha : 1));
      } catch {
        // dismissed with Esc
      }
    };

    return (
      <div className={merge("d:f fd:c ai:fs g:2 c:label", disabled ? "o:60 c:na" : "", className)}>
        {heading}
        <Popover.Root>
          <Popover.Trigger
            disabled={disabled}
            aria-label={`${label ?? "Color"}, ${value.toUpperCase()}`}
            render={
              <Button
                className={merge(
                  outline,
                  "d:if ai:c g:2 h:9 pl:2 pr:3 bw:1 bg:raised bs-o:key bc:rim c:label ff:m fs:sm us:none c:p h:bg:well",
                  RADIUS.control[shape],
                )}
              />
            }
          >
            <span
              aria-hidden
              className={merge("w:5 h:5 bw:1 bc:black/10", RADIUS.chip[shape])}
              style={{ background: fillOf(value) }}
            />
            {value.toUpperCase()}
          </Popover.Trigger>
          <Popover.Portal container={container}>
            <Popover.Positioner sideOffset={8} align="start">
              <Popover.Popup
                className={merge(
                  "d:f fd:c g:3 w:68 max-w:var(--available-width) p:3 bg:raised bc:line bw:1 c:label os:none bs-o:pop",
                  "tor:var(--transform-origin) tp:ot tdu:200 ttf:out-quart opening:o:0 opening:s:97 closing:o:0 closing:s:97 closing:tdu:100 closing:ttf:eo @prm:tp:none",
                  RADIUS.popup[shape],
                )}
              >
                <Area
                  hue={shownHue}
                  s={shownS}
                  v={shownV}
                  color={base}
                  onChange={(s, v) => pick(shownHue, s, v)}
                  disabled={disabled}
                  outline={outline}
                  shape={shape}
                />
                <Hue
                  value={Math.round(shownHue)}
                  onChange={(next) => {
                    setHsvHue(next);
                    pick(next, shownS, shownV);
                  }}
                  gradient={HSV_HUES}
                  thumb={`hsl(${shownHue} 100% 50%)`}
                  disabled={disabled}
                  within={within}
                />
                {opacity && (
                  <Slider.Root
                    value={Math.round(alpha * 100)}
                    onValueChange={(next) => {
                      const changed = join(base, Number(next) / 100);
                      if (mine) setPicked({ ...mine, value: changed });
                      change(changed);
                    }}
                    min={0}
                    max={100}
                    disabled={disabled}
                  >
                    <Slider.Control className="d:f ai:c py:2 us:none ta:none">
                      <Slider.Track
                        className="p:r h:3 w:100% br:9999 bs-o:sunk"
                        style={{ background: `linear-gradient(to right, transparent, ${base}), ${CHECKER}` }}
                      >
                        <Slider.Thumb
                          aria-label="Opacity"
                          getAriaValueText={(_, next) => `${next}%`}
                          className={merge("w:5 h:5 br:9999 bw:2 bc:white bs-o:key", within)}
                          style={{ background: fillOf(value) }}
                        />
                      </Slider.Track>
                    </Slider.Control>
                  </Slider.Root>
                )}
                <HexField
                  value={value}
                  onCommit={typed}
                  outline={outline}
                  shape={shape}
                  disabled={disabled}
                  alpha={opacity}
                  extra={
                    dropper && (
                      <Button
                        onClick={drop}
                        aria-label="Pick a color from the screen"
                        className={merge(
                          outline,
                          "d:f fs:0 ai:c jc:c w:9 h:9 p:0 bw:1 bg:raised bs-o:key bc:rim c:label c:p h:bg:well",
                          RADIUS.control[shape],
                        )}
                      >
                        <IconColorPicker aria-hidden className="w:4 h:4" />
                      </Button>
                    )
                  }
                />
                {swatches.length > 0 && (
                  <RadioGroup
                    aria-label="Saved colors"
                    value={swatches.map(normal).includes(base) ? base : ""}
                    onValueChange={(next) => typed(join(String(next), opacity ? alpha : 1))}
                    disabled={disabled}
                    className="d:f fw:w g:2"
                  >
                    {swatches.map((swatch) => (
                      <Radio.Root
                        key={swatch}
                        value={normal(swatch)}
                        aria-label={swatch.toUpperCase()}
                        className={(state) =>
                          merge(
                            outline,
                            "w:7 h:7 p:0 bw:1 bc:black/10 c:p",
                            RADIUS.chip[shape],
                            state.checked ? "ow:2 os:s oo:2 oc:label" : "",
                          )
                        }
                        style={{ background: swatch }}
                      />
                    ))}
                  </RadioGroup>
                )}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  }

  const pickHue = (next: number) => {
    setHue(next);
    const at = shades.indexOf(value);
    change(shadesOf(next)[at === -1 ? (read(value)?.step ?? 4) : at]);
  };

  return (
    <div
      className={merge(
        "d:f fd:c g:3 w:72 max-w:100% c:label",
        disabled ? "o:60 c:na" : "",
        className,
      )}
    >
      {heading}
      <Hue
        value={hue}
        onChange={pickHue}
        gradient={OKLCH_HUES}
        thumb={shades[4]}
        disabled={disabled}
        within={within}
        labelledBy={labelId}
      />
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
      <HexField
        value={value}
        onCommit={typed}
        outline={outline}
        shape={shape}
        disabled={disabled}
      />
    </div>
  );
}
