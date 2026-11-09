"use client";

import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { merge } from "yummacss/merge";
import Sparkline from "./sparkline";
import { RADIUS, type Shape, useShape } from "./style";

type Tone = "positive" | "negative" | "neutral";

const TONES: Record<Tone, string> = {
  positive: "c:green-7",
  negative: "c:red-6",
  neutral: "c:hint",
};

export interface StatProps {
  /** What the number counts. */
  label: string;
  /** The number, already formatted, such as `$58,210`. */
  value: string;
  /** The change, already formatted, such as `12.4%`. */
  change?: string;
  /** Which way the change went, which picks its arrow. */
  direction?: "up" | "down";
  /**
   * Whether the change is good news: `positive` reads green, `negative` red. A
   * rise in churn is `negative` though it goes up.
   */
  tone?: Tone;
  /** A trend line under the number, oldest value first. */
  trend?: number[];
  /** Corner radius of the card. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A labeled number in a raised card, with its change and an optional trend
 * line.
 */
export default function Stat({
  label,
  value,
  change,
  direction = "up",
  tone = "neutral",
  trend,
  shape: shapeProp,
  className,
}: StatProps) {
  const shape = useShape(shapeProp);
  const Arrow = direction === "up" ? IconArrowUpRight : IconArrowDownRight;

  return (
    <div
      className={merge(
        "d:f fd:c g:2 p:4 bw:1 bc:rim bg:raised bs-o:key c:label",
        RADIUS.popup[shape],
        className,
      )}
    >
      <span className="c:hint fs:sm">{label}</span>
      <span className="fs:3xl fw:600 fvn:tn">{value}</span>
      {change && (
        <span className={merge("d:f ai:c g:1 fs:sm fw:500 fvn:tn", TONES[tone])}>
          <Arrow aria-hidden className="w:4 h:4" />
          <span>
            <span className="p:a w:px h:px o:h">{direction === "up" ? "Up " : "Down "}</span>
            {change}
          </span>
        </span>
      )}
      {trend && trend.length > 1 && (
        <Sparkline values={trend} ariaLabel={`${label} trend`} height={32} className="mt:1" />
      )}
    </div>
  );
}
