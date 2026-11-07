"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

// one step of the fill per rank, so the accent recolors the map; the lightest repeats
const TONES = [
  "bg:fill c:on-fill",
  "bg:fill/80 c:on-fill",
  "bg:fill/60 c:on-fill",
  "bg:fill/40 c:label",
  "bg:fill/25 c:label",
  "bg:fill/15 c:label",
];

export interface TreemapItem {
  /** Its name on the tile and in its label. */
  label: string;
  /** Its size, in `unit`. */
  value: number;
}

export interface TreemapProps {
  /** The shares, in any order; the map sorts them biggest first. */
  data: TreemapItem[];
  /** The heading over the map, and its accessible name. */
  label?: string;
  /** The unit every value is read in. */
  unit?: string;
  /** Formats the values and shares. */
  locale?: string;
  /** Corner radius of the card and the tiles. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The focus outline on each tile. `true` draws it, `false` removes it, and a
   * string of Yumma CSS utilities restyles it. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes on the map itself, such as its height. `merge` folds them in
   * last, so one here replaces the component's own class for the same utility.
   */
  className?: string;
}

interface Tile extends TreemapItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

// lays the values out in rows that keep each tile as close to square as it can
function squarify(items: TreemapItem[], width: number, height: number): Tile[] {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const scale = (width * height) / total;
  const tiles: Tile[] = [];
  let rest = items.map((item) => ({ ...item, area: item.value * scale }));
  let box = { x: 0, y: 0, w: width, h: height };

  const worst = (row: { area: number }[], side: number) => {
    const sum = row.reduce((acc, item) => acc + item.area, 0);
    const max = Math.max(...row.map((item) => item.area));
    const min = Math.min(...row.map((item) => item.area));
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };

  while (rest.length) {
    const side = Math.min(box.w, box.h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) {
      row.push(rest[i]);
      i++;
    }
    rest = rest.slice(i);
    const sum = row.reduce((acc, item) => acc + item.area, 0);
    const across = box.w >= box.h;
    const thick = sum / side;
    let offset = 0;
    for (const item of row) {
      const length = item.area / thick;
      tiles.push(
        across
          ? { ...item, x: box.x, y: box.y + offset, w: thick, h: length }
          : { ...item, x: box.x + offset, y: box.y, w: length, h: thick },
      );
      offset += length;
    }
    box = across
      ? { x: box.x + thick, y: box.y, w: box.w - thick, h: box.h }
      : { x: box.x, y: box.y + thick, w: box.w, h: box.h - thick };
  }

  return tiles;
}

/**
 * Shares of a whole as tiles sized by value, shaded in steps of the fill so the
 * accent recolors them. Each tile is a button; arrow keys move between them.
 */
export default function Treemap({
  data,
  label = "Total",
  unit = "",
  locale = "en-US",
  shape: shapeProp,
  focus = true,
  className,
}: TreemapProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const map = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const node = map.current;
    if (!node) return;
    const measure = () => setSize({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  const laid = size.w ? squarify(sorted, size.w, size.h) : [];
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
  const amount = (value: number) => `${number.format(value)}${unit ? ` ${unit}` : ""}`;
  const describe = (item: TreemapItem) =>
    `${item.label}, ${amount(item.value)}, ${percent.format(item.value / (total || 1))}`;

  const move = (event: KeyboardEvent) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = active;
    if (event.key in step) next = active + step[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sorted.length - 1;
    else return;
    event.preventDefault();
    next = Math.min(Math.max(next, 0), sorted.length - 1);
    setActive(next);
    tiles.current[next]?.focus();
  };

  const shown = sorted[hovered ?? active];

  return (
    <div
      className={merge(
        "d:f fd:c g:3 w:120 max-w:100% p:5 bg:raised bs-o:key c:label fvn:tn bw:1 bc:rim",
        RADIUS.popup[shape],
      )}
    >
      <div className="d:f ai:b jc:sb g:2">
        <span className="fs:sm fw:600">{label}</span>
        <span className="c:hint fs:xs">{amount(total)}</span>
      </div>
      <div
        ref={map}
        role="group"
        aria-label={label}
        onKeyDown={move}
        onPointerLeave={() => setHovered(null)}
        className={merge("p:r h:72", className)}
      >
        {laid.map((tile, index) => {
          const roomy = tile.w >= 72 && tile.h >= 44;
          return (
            <button
              key={tile.label}
              ref={(node) => {
                tiles.current[index] = node;
              }}
              type="button"
              tabIndex={index === active ? 0 : -1}
              aria-label={describe(tile)}
              onFocus={() => setActive(index)}
              onPointerEnter={() => setHovered(index)}
              style={{
                left: tile.x + 2,
                top: tile.y + 2,
                width: Math.max(tile.w - 4, 0),
                height: Math.max(tile.h - 4, 0),
              }}
              className={merge(
                outline,
                "p:a d:f fd:c ai:fs jc:fe p:3 bw:0 o:h ta:l c:p",
                TONES[Math.min(index, TONES.length - 1)],
                RADIUS.block[shape],
              )}
            >
              {roomy && (
                <>
                  <span className="fs:sm fw:600 ws:nw">{tile.label}</span>
                  <span className="fs:xs o:80 ws:nw">{amount(tile.value)}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      {shown && (
        <span aria-hidden className="fs:xs c:hint">
          <span className="c:label fw:500">{shown.label}</span> ·{" "}
          {amount(shown.value)} · {percent.format(shown.value / (total || 1))}
        </span>
      )}
    </div>
  );
}
