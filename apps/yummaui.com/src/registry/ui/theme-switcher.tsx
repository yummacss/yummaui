"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, useIndicator, useShape, type Shape } from "./style";

type Theme = "light" | "dark" | "system";
type Size = "sm" | "md";
type Variant = "segmented" | "cycle";

const THEMES: {
  value: Theme;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "dark", label: "Dark", icon: IconMoon },
  { value: "system", label: "System", icon: IconDeviceDesktop },
];

// the same measures as Tabs, so the two read as one family
const SIZES: Record<Size, string> = {
  sm: "py:1 px:2 g:1 fs:xs",
  md: "py:2 px:3 g:2 fs:sm",
};

const ICON_ONLY: Record<Size, string> = {
  sm: "p:1",
  md: "p:2",
};

// one button, Button's secondary look at its icon-only sizes
const CYCLE_SIZES: Record<Size, string> = {
  sm: "w:8 h:8",
  md: "w:9 h:9",
};

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

// the raised key slides under the picked option, so the options draw none
const PICKED = "c:label";
const UNPICKED = "c:hint h:c:label";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export interface ThemeSwitcherProps {
  /** The picked theme, controlled. Pair it with `onValueChange`. */
  value?: Theme;
  /** The theme picked on first render, uncontrolled. */
  defaultValue?: Theme;
  /**
   * Called with the theme whenever it changes, and once with a remembered one.
   * Applying it, a class or an attribute on the page, is yours to do.
   */
  onValueChange?: (value: Theme) => void;
  /**
   * Remembers the choice in `localStorage` under this key and restores it on
   * the next visit. Leave it out and nothing is stored.
   */
  storageKey?: string;
  /**
   * `segmented` shows every theme on a track; `cycle` is one button that moves
   * System, Light, Dark on each press, showing the current one.
   */
  variant?: Variant;
  /**
   * Draws the icons alone, keeping each label as its accessible name. Ignored
   * by `cycle`.
   */
  iconOnly?: boolean;
  /** Height of the track and its options, or of the `cycle` button. */
  size?: Size;
  /**
   * Corner radius of the track and of the key that slides on it. Inherits the
   * nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks every option and dims the control. */
  disabled?: boolean;
  /**
   * The raised key sliding to the picked option. Turn it off for an instant
   * jump; reduced motion does the same. On `cycle`, the new icon turning in.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

/**
 * Light, dark & system as one control, with an icon for each, that reports the
 * choice and can remember it.
 */
export default function ThemeSwitcher({
  value,
  defaultValue = "system",
  onValueChange,
  storageKey,
  variant = "segmented",
  iconOnly = false,
  size = "md",
  shape: shapeProp,
  disabled = false,
  animated = true,
  className,
  focus = true,
}: ThemeSwitcherProps) {
  const indicator = useIndicator<HTMLDivElement>(variant === "segmented");
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [internal, setInternal] = useState<Theme>(defaultValue);
  const current = value ?? internal;

  const notify = useRef(onValueChange);
  notify.current = onValueChange;

  useEffect(() => {
    if (!storageKey) return;
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(storageKey);
    } catch {}
    if (!isTheme(saved)) return;
    setInternal(saved);
    notify.current?.(saved);
  }, [storageKey]);

  // pressing the picked option again would leave none picked, so it is ignored
  const pick = (next: unknown[]) => {
    const theme = next[0];
    if (!isTheme(theme)) return;
    setInternal(theme);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch {}
    }
    onValueChange?.(theme);
  };

  if (variant === "cycle") {
    const theme = THEMES.find((entry) => entry.value === current) ?? THEMES[2];
    const next = THEMES.find((entry) => entry.value === NEXT[current]) ?? THEMES[0];
    return (
      <Button
        type="button"
        onClick={() => pick([next.value])}
        disabled={disabled}
        aria-label={`Theme: ${theme.label}. Switch to ${next.label}`}
        className={merge(
          outline,
          "d:f ai:c jc:c bw:1 bg:raised bs-o:key bc:rim c:label us:none tp:c tdu:150 ttf:out-quart @prm:tp:none",
          disabled ? "o:60 c:na" : "c:p h:bg:well",
          CYCLE_SIZES[size],
          RADIUS.control[shape],
          className,
        )}
      >
        {/* re-keyed, so each theme's icon turns in */}
        <theme.icon
          key={theme.value}
          className={merge(
            "w:4 h:4 fs:0",
            animated && "tp:ot tdu:300 ttf:out-back @st:s:50 @st:o:0 @st:ro:-20 @prm:tp:none",
          )}
        />
      </Button>
    );
  }

  return (
    <ToggleGroup
      ref={indicator.ref}
      aria-label="Theme"
      value={[current]}
      onValueChange={pick}
      disabled={disabled}
      className={merge(
        "p:r d:f w:fc bg:well bs-o:sunk",
        RADIUS.bar[shape],
        disabled ? "o:60" : "",
        className,
      )}
    >
      <span
        aria-hidden
        style={indicator.style}
        className={merge(
          "p:a l:0 t:0 zi:0 bg:raised bs-o:key bw:1 bc:rim",
          RADIUS.control[shape],
          animated && indicator.ready && "tp:a tdu:300 ttf:out-quart @prm:tp:none",
        )}
      />
      {THEMES.map((theme) => (
        <Toggle
          key={theme.value}
          value={theme.value}
          aria-label={iconOnly ? theme.label : undefined}
          className={(state) =>
            merge(
              outline,
              "p:r zi:10 d:f ai:c jc:c bg:transparent fw:500 us:none tp:c tdu:150 ttf:io @prm:tp:none",
              disabled ? "c:na" : "c:p",
              iconOnly ? ICON_ONLY[size] : SIZES[size],
              RADIUS.control[shape],
              state.pressed ? PICKED : UNPICKED,
            )
          }
        >
          <theme.icon className="w:4 h:4 fs:0" />
          {!iconOnly && theme.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
