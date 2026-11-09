"use client";

import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";

export interface BarChartDatum {
  /** The bar's name, along the bottom. */
  label: string;
  /** The bar's value. */
  value: number;
}

export interface BarChartProps {
  /** One bar per item, left to right. */
  data: BarChartDatum[];
  /** What the chart shows, for screen readers and its table. */
  ariaLabel: string;
  /** How a value reads in the tooltip, the axis and the table. */
  format?: (value: number) => string;
  /** The plot's height in pixels. */
  height?: number;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/** A round number at or above the largest value, so the top line is easy to read. */
function ceiling(max: number) {
  if (max <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

/** Bars in the fill color with rounded tops, a grid and a tooltip on hover. */
export default function BarChart({
  data,
  ariaLabel,
  format = String,
  height = 200,
  className,
}: BarChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const left = 36;
  const bottom = 22;
  const top = 8;
  const max = ceiling(Math.max(...data.map((d) => d.value), 0));
  const plot = height - bottom - top;
  const y = (value: number) => top + plot - (value / max) * plot;
  const band = data.length ? (width - left) / data.length : 0;
  const gap = Math.min(8, band * 0.25);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  // fewer labels when bars get narrow
  const every = band < 32 ? Math.ceil(32 / Math.max(band, 1)) : 1;
  const shown = active === null ? null : data[active];

  return (
    <div ref={box} className={merge("p:r w:100% c:label", className)}>
      {width > 0 && (
        <svg width={width} height={height} aria-hidden className="d:b o:v us:none ta:m">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={left} x2={width} y1={y(tick)} y2={y(tick)} className="c:line" stroke="currentColor" />
              <text x={left - 8} y={y(tick) + 4} textAnchor="end" className="c:hint fs:xs ff:m" fill="currentColor">
                {format(tick)}
              </text>
            </g>
          ))}
          {data.map((datum, index) => {
            const x = left + index * band + gap / 2;
            const w = Math.max(band - gap, 1);
            const peak = y(datum.value);
            const r = Math.min(4, w / 2, top + plot - peak);
            return (
              <g key={datum.label}>
                {/* rounded at the value, square on the baseline */}
                <path
                  d={`M${x},${top + plot}V${peak + r}Q${x},${peak} ${x + r},${peak}H${x + w - r}Q${x + w},${peak} ${x + w},${peak + r}V${top + plot}Z`}
                  fill="currentColor"
                  className={`c:fill tp:o tdu:150 @prm:tp:none ${active === null || active === index ? "o:100" : "o:40"}`}
                />
                {index % every === 0 && (
                  <text x={x + w / 2} y={height - 6} textAnchor="middle" className="c:hint fs:xs ff:m" fill="currentColor">
                    {datum.label}
                  </text>
                )}
                <rect
                  x={left + index * band}
                  y={top}
                  width={band}
                  height={plot}
                  fill="transparent"
                  onPointerEnter={() => setActive(index)}
                  onPointerLeave={(event) => event.pointerType === "mouse" && setActive(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {shown && active !== null && (
        <span
          aria-hidden
          className="p:a d:f g:2 px:2 py:1 br:md bw:1 bc:rim bg:raised bs-o:pop fs:xs ws:nw pe:none"
          style={{
            left: left + active * band + band / 2,
            top: y(shown.value) - 8,
            translate: "-50% -100%",
          }}
        >
          <span className="c:hint">{shown.label}</span>
          <span className="fw:600 fvn:tn">{format(shown.value)}</span>
        </span>
      )}
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
