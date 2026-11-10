"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";

export interface MarqueeProps {
  /** The items, such as logos or tags, repeated for as long as the row runs. */
  children: ReactNode;
  /** Seconds for one full pass; higher is slower. */
  duration?: number;
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
  duration = 30,
  reverse = false,
  pauseOnHover = true,
  fade = true,
  ariaLabel,
  className,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  // two copies end to end, so moving half the width loops without a seam
  const copy = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="d:f ai:c g:4 pr:4 fs:0">
      {children}
    </div>
  );

  return (
    <div
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={merge("w:100% o:h c:label", className)}
      style={
        fade
          ? {
              maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            }
          : undefined
      }
    >
      <div
        className={merge(
          "d:f w:max an:marquee atf:l aic:i @prm:an:none",
        )}
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal", animationPlayState: paused ? "paused" : "running" }}
      >
        {copy(Boolean(ariaLabel))}
        {copy(true)}
      </div>
    </div>
  );
}
