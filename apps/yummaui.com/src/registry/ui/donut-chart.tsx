"use client";

import { useState } from "react";
import { merge } from "yummacss/merge";

export interface DonutChartDatum {
  /** The part's name, in the middle on hover. */
  label: string;
  /** The part's size. */
  value: number;
}

export interface DonutChartProps {
  /**
   * The parts, in order around the circle. The first four take the chart
   * palette; a fifth and later read in gray, so fold small parts into "Other".
   */
  data: DonutChartDatum[];
  /** What the chart shows, for screen readers and its table. */
  ariaLabel: string;
  /**
   * The whole the circle measures against. Without it, the parts fill the
   * circle.
   */
  total?: number;
  /** The large text in the middle, such as a percentage. */
  centerValue?: string;
  /** A line under the middle text. */
  centerLabel?: string;
  /** How a value reads in the middle on hover and in the table. */
  format?: (value: number) => string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

// checked for color blindness side by side, in light and dark
const PALETTE = ["c:blue-5", "c:orange-7", "c:mint-8", "c:violet-7"];

/**
 * A circle of parts with a value in the middle, which names a part on hover.
 */
export default function DonutChart({
  data,
  ariaLabel,
  total,
  centerValue,
  centerLabel,
  format = String,
  className,
}: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const hovered = active === null ? null : data[active];
  const size = 160;
  const band = 16;
  const radius = (size - band) / 2 - 2;
  const length = 2 * Math.PI * radius;
  const whole = total ?? data.reduce((sum, d) => sum + d.value, 0);
  let start = 0;

  return (
    <div className={merge("p:r d:ib c:label", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="d:b o:v">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={band} className="c:well" />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((datum, index) => {
            const share = whole ? datum.value / whole : 0;
            // a 2px gap between parts
            const dash = Math.max(share * length - 2, 0);
            const offset = -start * length;
            start += share;
            return (
              <circle
                key={datum.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={active === index ? band + 4 : band}
                strokeDasharray={`${dash} ${length}`}
                strokeDashoffset={offset}
                className={`tp:a tdu:150 @prm:tp:none ${PALETTE[index] ?? "c:hint"}`}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
              />
            );
          })}
        </g>
        {/* the hovered part names itself in the middle, in place of the summary */}
        {(hovered || centerValue || centerLabel) && (
          <text x={size / 2} y={size / 2} textAnchor="middle" fill="currentColor">
            {(hovered ? format(hovered.value) : centerValue) && (
              <tspan x={size / 2} dy={-2} className="fs:xl fw:600 fvn:tn">
                {hovered ? format(hovered.value) : centerValue}
              </tspan>
            )}
            {(hovered ? hovered.label : centerLabel) && (
              <tspan x={size / 2} dy={18} className="c:hint fs:xs">
                {hovered ? hovered.label : centerLabel}
              </tspan>
            )}
          </text>
        )}
      </svg>
      {/* the data as a table, for screen readers */}
      <div className="p:a w:px h:px o:h ws:nw" style={{ clipPath: "inset(50%)" }}>
        <table>
          <caption>{ariaLabel}</caption>
          <tbody>
            {data.map((datum) => (
              <tr key={datum.label}>
                <th scope="row">{datum.label}</th>
                <td>{format(datum.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
