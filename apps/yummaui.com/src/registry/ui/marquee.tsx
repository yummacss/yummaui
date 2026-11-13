"use client";

import { Toggle } from "@base-ui/react/toggle";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, Swap, useShape } from "./style";

export interface MarqueeProps {
  /** The items, such as logos or tags, repeated for as long as the row runs. */
  children: ReactNode;
  /** How fast the row moves, in pixels per second. */
  speed?: number;
  /** Runs left to right. */
  reverse?: boolean;
  /** Stops the row while a pointer is over it or focus is inside it. */
  pauseOnHover?: boolean;
  /** Controlled pause. Pass it with `onPausedChange`. */
  paused?: boolean;
  /**
   * Called when the pause key is pressed, with whether the row is now paused.
   */
  onPausedChange?: (paused: boolean) => void;
  /**
   * Shows a key at the row's end that pauses and resumes it. Turn it off only
   * when the page has its own control, since moving content needs one.
   */
  pauseButton?: boolean;
  /** Fades the row out at both ends. */
  fade?: boolean;
  /**
   * What the row holds, read once by screen readers instead of the moving copy.
   */
  ariaLabel?: string;
  /** Corner radius of the pause key. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An endless row that scrolls on its own, for logos or tags, with a key that
 * pauses it; it stands still when someone asks for reduced motion.
 */
export default function Marquee({
  children,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
  paused: pausedProp,
  onPausedChange,
  pauseButton = true,
  fade = true,
  ariaLabel,
  shape: shapeProp,
  focus = true,
  className,
}: MarqueeProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const frame = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(false);
  // a pointer over the row or focus inside it holds it without changing the pause
  const [held, setHeld] = useState(false);
  const stopped = pausedProp ?? own;
  // one copy's width, and how many copies fill the row with one to spare
  const [measure, setMeasure] = useState({ width: 0, copies: 2 });

  useEffect(() => {
    const row = frame.current;
    const copy = first.current;
    if (!row || !copy) return;
    const fit = () => {
      const width = copy.getBoundingClientRect().width;
      if (!width) return;
      const copies = Math.max(2, Math.ceil(row.clientWidth / width) + 1);
      setMeasure((now) =>
        now.width === width && now.copies === copies ? now : { width, copies },
      );
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    observer.observe(copy);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      className={merge("d:f ai:c g:2 w:100% c:label", className)}
    >
      <div
        ref={frame}
        onPointerEnter={() => pauseOnHover && setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => pauseOnHover && setHeld(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
        }}
        className="f:1 min-w:0 o:h py:2"
        style={
          fade
            ? {
                maskImage:
                  "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              }
            : undefined
        }
      >
        {/* moving by exactly one copy lands the next copy where the first began */}
        <div
          className={merge(
            "d:f w:max",
            measure.width ? "an:marquee atf:l aic:i @prm:an:none" : "",
          )}
          style={
            {
              "--marquee-shift": `${measure.width}px`,
              animationDuration: `${measure.width / speed}s`,
              animationDirection: reverse ? "reverse" : "normal",
              animationPlayState: stopped || held ? "paused" : "running",
            } as CSSProperties
          }
        >
          {Array.from({ length: measure.copies }, (_, index) => (
            <div
              key={index}
              ref={index === 0 ? first : undefined}
              aria-hidden={index > 0 || Boolean(ariaLabel) || undefined}
              className="d:f ai:c g:4 pr:4 fs:0"
            >
              {children}
            </div>
          ))}
        </div>
      </div>
      {pauseButton && (
        <Toggle
          pressed={stopped}
          onPressedChange={(next) => {
            setOwn(next);
            onPausedChange?.(next);
          }}
          aria-label="Pause"
          className={merge(
            outline,
            "d:if ai:c jc:c fs:0 w:8 h:8 bw:1 bc:rim bg:raised bs-o:key c:label c:p h:bg:well tp:t tdu:150 ttf:out-quart a:s:98 @prm:d:none",
            RADIUS.control[shape],
          )}
        >
          <Swap
            swapped={stopped}
            from={<IconPlayerPause className="w:4 h:4" />}
            to={<IconPlayerPlay className="w:4 h:4" />}
          />
        </Toggle>
      )}
    </div>
  );
}
