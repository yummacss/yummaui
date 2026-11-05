"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, useIndicator, useShape, type Shape } from "./style";

type Theme = "light" | "dark" | "system";
type Size = "sm" | "md";

const THEMES: {
  value: Theme;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "dark", label: "Dark", icon: IconMoon },
  { value: "system", label: "System", icon: IconDeviceDesktop },
];

const SIZES: Record<Size, string> = {
  sm: "h:7 px:2 g:1 fs:xs",
  md: "h:8 px:3 g:2 fs:sm",
};

const ICON_ONLY: Record<Size, string> = {
  sm: "w:7 h:7",
  md: "w:8 h:8",
};

// the raised key slides under the picked option, so the options draw none
const PICKED = "bc:transparent c:label";
const UNPICKED = "bc:transparent c:hint h:c:label";

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
  /** Draws the icons alone, keeping each label as its accessible name. */
  iconOnly?: boolean;
  /** Height of the track and its options. */
  size?: Size;
  /**
   * Corner radius of the track. The options nest one step inside it. `squircle`
   * uses `corner-shape`, which degrades to a rounded square where that is
   * unsupported. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks every option and dims the control. */
  disabled?: boolean;
  /**
   * The raised key sliding to the picked option. Turn it off for an instant
   * jump; reduced motion does the same.
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
  iconOnly = false,
  size = "md",
  shape: shapeProp,
  disabled = false,
  animated = true,
  className,
  focus = true,
}: ThemeSwitcherProps) {
  const indicator = useIndicator<HTMLDivElement>();
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

  return (
    <ToggleGroup
      ref={indicator.ref}
      aria-label="Theme"
      value={[current]}
      onValueChange={pick}
      disabled={disabled}
      className={merge(
        "p:r d:f g:1 p:1 w:fc bg:well bs-o:sunk",
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
          RADIUS.item[shape],
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
              "p:r zi:10 d:f ai:c jc:c bw:1 bg:transparent fw:500 us:none tp:c tdu:150 ttf:io @prm:tp:none",
              disabled ? "c:na" : "c:p",
              iconOnly ? ICON_ONLY[size] : SIZES[size],
              RADIUS.item[shape],
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
