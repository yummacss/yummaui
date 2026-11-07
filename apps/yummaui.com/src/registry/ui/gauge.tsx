"use client";

import { Meter } from "@base-ui/react/meter";
import { useEffect, useState } from "react";
import { merge } from "yummacss/merge";

const SIZES = {
  sm: { box: "w:28", value: "fs:xl", unit: "fs:xs", label: "fs:xs", stroke: 9 },
  md: { box: "w:44", value: "fs:3xl", unit: "fs:sm", label: "fs:sm", stroke: 8 },
  lg: { box: "w:60", value: "fs:4xl", unit: "fs:md", label: "fs:sm", stroke: 7 },
};

type Size = keyof typeof SIZES;

const INTENTS = {
  neutral: { arc: "c:fill", ink: "c:hint" },
  info: { arc: "c:blue", ink: "c:blue" },
  success: { arc: "c:green", ink: "c:green" },
  warning: { arc: "c:yellow", ink: "c:yellow-9" },
  danger: { arc: "c:red", ink: "c:red" },
} satisfies Record<string, { arc: string; ink: string }>;

type Intent = keyof typeof INTENTS;

export interface GaugeLevels {
  /** Below `warning`. */
  normal?: string;
  /** From `warning` up to `danger`. */
  warning?: string;
  /** From `danger` up. */
  danger?: string;
}

export interface GaugeProps {
  /** The current value. */
  value: number;
  /** Defaults to Base UI's own Meter minimum (0). */
  min?: number;
  /** Defaults to Base UI's own Meter maximum (100). */
  max?: number;
  /** Text under the value, and the gauge's accessible name. */
  label: string;
  /**
   * Reads the value as an amount, `72 GB`, in place of a percentage of the
   * range.
   */
  unit?: string;
  /** A line under the gauge, such as `72 of 100 GB used`. */
  description?: string;
  /** The value from which the arc turns yellow and names its level. */
  warning?: number;
  /** The value from which the arc turns red and names its level. */
  danger?: number;
  /**
   * What each level is called under the gauge, so color is never the only sign
   * of one. Shown only with `warning` or `danger`.
   */
  levels?: GaugeLevels;
  /**
   * What the reading means when no threshold applies. A threshold that is
   * reached takes its place.
   */
  intent?: Intent;
  /** Width of the gauge, with the type scaled to match. */
  size?: Size;
  /**
   * The arc sweeping in and the value counting up when it first shows. Turn it
   * off for a gauge that is simply there; reduced motion does the same.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

function useArrival(animated: boolean): number {
  const [progress, setProgress] = useState(animated ? 0 : 1);

  useEffect(() => {
    const still =
      !animated ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - began) / 1100, 1);
      setProgress(1 - (1 - t) ** 4);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  return progress;
}

/**
 * A value on a fixed range as a half-circle arc, read at a glance, with
 * thresholds that turn it yellow or red and name the level.
 */
export default function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  unit,
  description,
  warning,
  danger,
  levels,
  intent = "neutral",
  size = "md",
  animated = true,
  className,
}: GaugeProps) {
  const progress = useArrival(animated);
  const scale = SIZES[size];
  const share = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const level =
    danger !== undefined && value >= danger
      ? "danger"
      : warning !== undefined && value >= warning
        ? "warning"
        : "normal";
  const tone = INTENTS[level === "normal" ? intent : level];
  const names = { normal: "Normal", warning: "High", danger: "Critical", ...levels };
  const thresholds = warning !== undefined || danger !== undefined;
  const reading = unit
    ? `${Math.round(value * progress)}`
    : `${Math.round(share * 100 * progress)}`;
  const radius = 50 - scale.stroke / 2;
  const arc = `M ${scale.stroke / 2} 50 A ${radius} ${radius} 0 0 1 ${100 - scale.stroke / 2} 50`;

  return (
    <Meter.Root
      value={value}
      min={min}
      max={max}
      getAriaValueText={() =>
        [
          unit ? `${value} ${unit}` : `${Math.round(share * 100)}%`,
          thresholds ? names[level] : "",
        ]
          .filter(Boolean)
          .join(", ")
      }
      className={merge("d:if fd:c ai:c g:1 c:label fvn:tn", className)}
    >
      <div className={`p:r ${scale.box}`}>
        <svg
          aria-hidden
          viewBox={`0 0 100 ${50 + scale.stroke / 2}`}
          className="d:b w:100% o:v"
        >
          <path
            d={arc}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={scale.stroke}
            strokeLinecap="round"
            className="c:line"
          />
          {share > 0 && (
            <path
              d={arc}
              pathLength={100}
              fill="none"
              stroke="currentColor"
              strokeWidth={scale.stroke}
              strokeLinecap="round"
              strokeDasharray={`${share * 100 * progress} 100`}
              className={tone.arc}
            />
          )}
        </svg>
        <div className="p:a l:0 r:0 b:0 d:f fd:c ai:c">
          <span className={`${scale.value} fw:600 lh:1 ls:2`}>
            {reading}
            <span className={`${scale.unit} c:hint fw:500`}>
              {unit ? ` ${unit}` : "%"}
            </span>
          </span>
        </div>
      </div>
      <Meter.Label className={`${scale.label} c:hint`}>{label}</Meter.Label>
      {thresholds && (
        <span className={`fs:xs fw:500 ${level === "normal" ? "c:hint" : tone.ink}`}>
          {names[level]}
        </span>
      )}
      {description && <span className="fs:xs c:hint">{description}</span>}
    </Meter.Root>
  );
}
