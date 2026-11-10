"use client";

import { merge } from "yummacss/merge";
import Meter from "./meter";
import { RADIUS, type Shape, useShape } from "./style";

export interface UsageMeterProps {
  /** How much of the allowance is used, in percent. */
  value: number;
  /** What the allowance covers. */
  label?: string;
  /** When it starts over, such as `Resets Monday at 9:00`. */
  resets?: string;
  /** The percent from which it warns. */
  warnAt?: number;
  /** Corner radius of the card and the bar. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The bar's fill as it moves. Turn it off for a meter that jumps, or when the
   * user has asked for reduced motion.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * How much of an allowance is used and when it starts over; it warns near the
 * end and says when it is full.
 */
export default function UsageMeter({
  value,
  label = "This week",
  resets,
  warnAt = 80,
  shape: shapeProp,
  animated = true,
  className,
}: UsageMeterProps) {
  const shape = useShape(shapeProp);
  const full = value >= 100;

  return (
    <div className={merge("w:100% p:4 bw:1 bc:rim bg:raised bs-o:key", RADIUS.popup[shape], className)}>
      <Meter
        value={Math.min(value, 100)}
        label={label}
        intent={full ? "danger" : value >= warnAt ? "warning" : "neutral"}
        shape={shape === "square" ? "square" : "pill"}
        animated={animated}
        className="w:100%"
      />
      {(full || resets) && (
        <p className="m:0 mt:2 c:hint fs:xs">
          {full ? `Limit reached.${resets ? ` ${resets}.` : ""}` : resets}
        </p>
      )}
    </div>
  );
}
