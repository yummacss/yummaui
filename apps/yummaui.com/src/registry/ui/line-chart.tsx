"use client";

import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";

export interface LineChartSeries {
  /** The series' name, in the legend and the tooltip. */
  name: string;
  /** One value per label, in order. */
  values: number[];
}

export interface LineChartProps {
  /** The points along the bottom, such as months. */
  labels: string[];
  /**
   * The lines. The first draws solid in the fill color; the rest draw dashed
   * and quieter, for a comparison such as last year.
   */
  series: LineChartSeries[];
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

/** A round step that splits the range into about four parts. */
function niceStep(range: number) {
  const raw = range / 4 || 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? raw;
}

/** Lines over a grid, a crosshair on hover and a legend. */
export default function LineChart({
  labels,
  series,
  ariaLabel,
  format = String,
  height = 200,
  className,
}: LineChartProps) {
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
  const right = 8;
  const bottom = 22;
  const top = 8;
  const all = series.flatMap((s) => s.values);
  const step = niceStep(Math.max(...all, 0) - Math.min(...all, 0));
  const min = Math.floor(Math.min(...all, 0) / step) * step;
  const max = Math.ceil(Math.max(...all, 0) / step) * step || step;
  const plot = height - bottom - top;
  const x = (index: number) =>
    left + (labels.length > 1 ? (index * (width - left - right)) / (labels.length - 1) : 0);
  const y = (value: number) => top + plot - ((value - min) / (max - min)) * plot;
  const ticks: number[] = [];
  for (let tick = min; tick <= max + step / 2; tick += step) ticks.push(tick);
  const every = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(width / 64))));
  const path = (values: number[]) =>
    values.map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`).join("");

  const pick = (clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect || labels.length < 2) return;
    const span = (width - left - right) / (labels.length - 1);
    setActive(Math.min(labels.length - 1, Math.max(0, Math.round((clientX - rect.left - left) / span))));
  };

  return (
    <div ref={box} className={merge("p:r d:f fd:c g:3 w:100% c:label", className)}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          aria-hidden
          className="d:b o:v us:none ta:m"
          onPointerMove={(event) => pick(event.clientX)}
          onPointerLeave={(event) => event.pointerType === "mouse" && setActive(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="c:line" stroke="currentColor" />
              <text x={left - 8} y={y(tick) + 4} textAnchor="end" className="c:hint fs:xs ff:m" fill="currentColor">
                {format(tick)}
              </text>
            </g>
          ))}
          {labels.map(
            (label, index) =>
              index % every === 0 && (
                <text key={label} x={x(index)} y={height - 6} textAnchor="middle" className="c:hint fs:xs ff:m" fill="currentColor">
                  {label}
                </text>
              ),
          )}
          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={top} y2={top + plot} className="c:rim" stroke="currentColor" />
          )}
          {/* the comparisons first, so the main line draws over them */}
          {series
            .slice(1)
            .map((s) => (
              <path key={s.name} d={path(s.values)} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" className="c:hint" />
            ))}
          {series[0] && (
            <path d={path(series[0].values)} className="c:fill" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {active !== null && series[0] && (
            <g>
              {/* an edge of the card's color, so the dot sits apart from the line */}
              <circle cx={x(active)} cy={y(series[0].values[active])} r={6.5} fill="currentColor" className="c:raised" />
              <circle cx={x(active)} cy={y(series[0].values[active])} r={4.5} fill="currentColor" className="c:fill" />
            </g>
          )}
          <rect x={left} y={0} width={Math.max(width - left - right, 0)} height={top + plot} fill="transparent" />
        </svg>
      )}
      {active !== null && series[0] && (
        <span
          aria-hidden
          className="p:a d:f g:2 px:2 py:1 br:md bw:1 bc:rim bg:raised bs-o:pop fs:xs ws:nw pe:none"
          style={{ left: x(active), top: y(series[0].values[active]) - 10, translate: "-50% -100%" }}
        >
          <span className="c:hint">{labels[active]}</span>
          {series.map((s, index) => (
            <span key={s.name} className={`fvn:tn ${index ? "c:hint" : "fw:600"}`}>
              {format(s.values[active])}
            </span>
          ))}
        </span>
      )}
      {series.length > 1 && (
        <div className="d:f fw:w g:4 c:hint fs:xs">
          {series.map((s, index) => (
            <span key={s.name} className="d:f ai:c g:2">
              <span aria-hidden className={`w:4 h:0 btw:2 ${index ? "bs:d bc:hint" : "bc:fill"}`} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      {/* the data as a table, for screen readers */}
      <div className="p:a w:px h:px o:h ws:nw" style={{ clipPath: "inset(50%)" }}>
        <table>
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th scope="col">Label</th>
              {series.map((s) => (
                <th key={s.name} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {series.map((s) => (
                  <td key={s.name}>{format(s.values[index])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
