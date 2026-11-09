"use client";

import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";

export interface SparklineProps {
  /** The values, oldest first. */
  values: number[];
  /** What the line shows, for screen readers, such as "Revenue, rising". */
  ariaLabel: string;
  /**
   * The drawing's width in pixels. Without it, the line fills its container.
   */
  width?: number;
  /** The drawing's height in pixels. */
  height?: number;
  /** A dot on the latest value. */
  dot?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/** A small trend line in the fill color, with no axes. */
export default function Sparkline({
  values,
  ariaLabel,
  width: fixed,
  height = 32,
  dot = true,
  className,
}: SparklineProps) {
  const box = useRef<HTMLSpanElement>(null);
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (fixed !== undefined || !el) return;
    const observer = new ResizeObserver(([entry]) => setMeasured(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [fixed]);

  const width = fixed ?? measured;
  const pad = dot ? 4 : 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (index: number) =>
    pad + (values.length > 1 ? (index * (width - pad * 2)) / (values.length - 1) : 0);
  const y = (value: number) =>
    height - pad - (max === min ? 0.5 : (value - min) / (max - min)) * (height - pad * 2);
  const d = values.map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`).join("");

  return (
    <span
      ref={box}
      role="img"
      aria-label={ariaLabel}
      className={merge("d:b c:label", fixed === undefined ? "w:100%" : "", className)}
      style={{ height, width: fixed }}
    >
      {width > 0 && (
        <svg aria-hidden width={width} height={height} className="d:b o:v c:fill">
          <path d={d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {dot && values.length > 0 && (
            <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={3} fill="currentColor" />
          )}
        </svg>
      )}
    </span>
  );
}
