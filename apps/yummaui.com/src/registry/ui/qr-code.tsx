"use client";

import { type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { encode } from "uqr";
import { merge } from "yummacss/merge";
import { RADIUS, type Shape, type Size, useShape } from "./style";

type Modules = "square" | "rounded" | "dots";
type Level = "L" | "M" | "Q" | "H";

const TILE: Record<Size, string> = { sm: "w:32 p:2", md: "w:48 p:3", lg: "w:64 p:4" };

const CAPTION: Record<Size, string> = { sm: "w:32", md: "w:48", lg: "w:64" };

// the address as people read it, without the scheme
const address = (value: string) => value.replace(/^https?:\/\//, "").replace(/\/$/, "");

// the eyes' outer and inner corners, in modules, for each shape
const EYE: Record<Shape, [number, number]> = {
  none: [0, 0],
  rounded: [1.6, 0.8],
  squircle: [2.4, 1.1],
  pill: [3.5, 1.5],
};

const box = (x: number, y: number, w: number, r: number) =>
  r
    ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${w - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${2 * r - w}a${r} ${r} 0 0 1 ${-r} ${-r}v${2 * r - w}a${r} ${r} 0 0 1 ${r} ${-r}Z`
    : `M${x} ${y}h${w}v${w}h${-w}Z`;

export interface QrCodeProps {
  /** The text the code holds, usually a link. */
  value: string;
  /**
   * What the code opens, written under it and read to screen readers, such as
   * "Yumma UI website".
   */
  label?: string;
  /**
   * Writes the address under the code, so people see where it goes before they
   * scan.
   */
  showValue?: boolean;
  /** How each module is drawn. Square reads at the smallest sizes. */
  modules?: Modules;
  /**
   * How much of the code can be covered and still read: `L` 7%, `M` 15%, `Q`
   * 25%, `H` 30%. An `icon` raises it to `H`.
   */
  level?: Level;
  /** A glyph in the middle, on a dark key, such as your app's mark. */
  icon?: ReactNode;
  /** The tile's width: 128, 192 or 256 pixels. */
  size?: Size;
  /**
   * Corner radius of the tile and the three eyes. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /**
   * The modules popping in from the middle when the value changes. Reduced
   * motion turns it off.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * Text drawn as a code a phone camera reads, dark on a white tile in either
 * scheme.
 */
export default function QrCode({
  value,
  label,
  showValue = true,
  modules = "rounded",
  level = "M",
  icon,
  size = "md",
  shape: shapeProp,
  animated = true,
  className,
}: QrCodeProps) {
  const shape = useShape(shapeProp);
  const svg = useRef<SVGSVGElement>(null);

  const { cells, eyes, hole, count } = useMemo(() => {
    const { data, size: count } = encode(value || " ", { ecc: icon ? "H" : level, border: 0 });
    const eye = (x: number, y: number) =>
      (x < 7 && y < 7) || (x >= count - 7 && y < 7) || (x < 7 && y >= count - 7);
    // an odd number of modules wide, so the hole sits on the grid's middle
    const span = icon ? Math.round(count * 0.22) | 1 : 0;
    const start = (count - span) / 2;
    const covered = (x: number, y: number) =>
      span > 0 && x >= start - 1 && x < start + span + 1 && y >= start - 1 && y < start + span + 1;
    const cells: [number, number][] = [];
    data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on && !eye(x, y) && !covered(x, y)) cells.push([x, y]);
      }),
    );
    return {
      cells,
      eyes: [
        [0, 0],
        [count - 7, 0],
        [0, count - 7],
      ],
      hole: span ? { at: start + 0.5, width: span - 1 } : null,
      count,
    };
  }, [value, level, icon]);

  // each module pops in after a delay that grows with its distance from the middle
  useLayoutEffect(() => {
    const root = svg.current;
    if (!root || !animated) return;
    const view = root.ownerDocument.defaultView ?? window;
    if (view.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const middle = (count - 1) / 2;
    const far = Math.hypot(middle, middle);
    for (const part of root.querySelectorAll<SVGElement>("[data-at]")) {
      const [x, y] = (part.dataset.at ?? "0 0").split(" ").map(Number);
      part.animate([{ opacity: 0, scale: "0.2" }, { opacity: 1, scale: "1" }], {
        duration: 400,
        delay: (Math.hypot(x - middle, y - middle) / far) * 250,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "backwards",
      });
    }
  }, [cells, animated, count]);

  const [outer, inner] = EYE[shape];
  const part = { transformBox: "fill-box", transformOrigin: "center" } as const;

  return (
    <div className={merge("d:if fd:c ai:c g:3", className)}>
      <div className={merge("d:b fs:0 bg:white bw:1 bc:line", TILE[size], RADIUS.popup[shape])}>
        <div className="p:r">
          <svg
            ref={svg}
            role="img"
            aria-label={label ?? value}
            viewBox={`0 0 ${count} ${count}`}
            fill="currentColor"
            className="d:b w:100% h:auto c:black"
          >
            {cells.map(([x, y]) =>
              modules === "dots" ? (
                <circle key={`${x} ${y}`} data-at={`${x} ${y}`} style={part} cx={x + 0.5} cy={y + 0.5} r={0.42} />
              ) : (
                <rect
                  key={`${x} ${y}`}
                  data-at={`${x} ${y}`}
                  style={part}
                  x={x + 0.06}
                  y={y + 0.06}
                  width={0.88}
                  height={0.88}
                  rx={modules === "rounded" ? 0.3 : 0}
                />
              ),
            )}
            {eyes.map(([x, y]) => (
              <g key={`${x} ${y}`} data-at={`${x} ${y}`} style={part}>
                <path fillRule="evenodd" d={`${box(x, y, 7, outer)}${box(x + 1, y + 1, 5, Math.max(0, outer - 1))}`} />
                <path d={box(x + 2, y + 2, 3, inner)} />
              </g>
            ))}
            {hole && (
              <rect
                data-at={`${count / 2} ${count / 2}`}
                style={part}
                x={hole.at}
                y={hole.at}
                width={hole.width}
                height={hole.width}
                rx={hole.width * 0.28}
              />
            )}
          </svg>
          {hole && (
            // the glyph over the svg, so it keeps its own size in pixels
            <span
              aria-hidden
              className="p:a d:f ai:c jc:c c:white pe:none"
              style={{ inset: `${(hole.at / count) * 100}%` }}
            >
              {icon}
            </span>
          )}
        </div>
      </div>
      {(label || showValue) && (
        <div className={merge("d:f fd:c ai:c g:1 min-w:0 ta:c", CAPTION[size])}>
          {label && <span className="fs:sm fw:500 c:label">{label}</span>}
          {showValue && <span className="w:100% ff:m fs:xs c:hint ws:nw o:h to:e">{address(value)}</span>}
        </div>
      )}
    </div>
  );
}
