"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";

export interface MarqueeProps {
  /** The items, such as logos or tags, repeated for as long as the row runs. */
  children: ReactNode;
  /** How fast the row moves, in pixels per second. */
  speed?: number;
  /** Runs left to right. */
  reverse?: boolean;
  /** Stops the row while a pointer is over it. */
  pauseOnHover?: boolean;
  /** Fades the row out at both ends. */
  fade?: boolean;
  /**
   * What the row holds, read once by screen readers instead of the moving copy.
   */
  ariaLabel?: string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An endless row that scrolls on its own, for logos or tags; it stands still
 * when someone asks for reduced motion.
 */
export default function Marquee({
  children,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
  fade = true,
  ariaLabel,
  className,
}: MarqueeProps) {
  const frame = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
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
      ref={frame}
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={merge("w:100% o:h py:2 c:label", className)}
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
            animationPlayState: paused ? "paused" : "running",
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
  );
}
