"use client";

import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

// empty, then four steps of the fill, so the accent recolors every step
const LEVELS = ["bg:line", "bg:fill/25", "bg:fill/50", "bg:fill/75", "bg:fill"];

const SIZES = {
  sm: { cell: "w:2 h:2", row: "h:2" },
  md: { cell: "w:3 h:3", row: "h:3" },
};

const DAY = 86_400_000;

export interface ActivityDay {
  /** The day, as `YYYY-MM-DD`. */
  date: string;
  /** How much happened that day. */
  count: number;
}

export interface ActivityHeatmapProps {
  /** One entry per day with activity. Days left out count as zero. */
  data: ActivityDay[];
  /** The last day shown, as `YYYY-MM-DD`. Defaults to today. */
  end?: string;
  /** How many weeks back from `end`, each a column starting on Monday. */
  weeks?: number;
  /** The heading over the grid, and its accessible name. */
  label?: string;
  /** What a count counts, in the plural, for the total & each day's label. */
  unit?: string;
  /** Formats the month and day names. */
  locale?: string;
  /** Size of each day. */
  size?: keyof typeof SIZES;
  /** Corner radius on the card and the days. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The focus outline on each day. `true` draws it, `false` removes it, and a
   * string of Yumma CSS utilities restyles it. Removing it outright and
   * putting nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/**
 * A year of daily counts as a grid of days, a column per week from Monday,
 * shaded by how much happened. Arrow keys move between days.
 */
export default function ActivityHeatmap({
  data,
  end,
  weeks = 53,
  label = "Activity",
  unit = "contributions",
  locale = "en-US",
  size = "md",
  shape: shapeProp,
  focus = true,
  className,
}: ActivityHeatmapProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const counts = new Map(data.map((day) => [day.date, day.count]));
  const last = Date.parse(end ?? iso(Date.now()));
  // monday of the last week, then back to the first column
  const weekday = (new Date(last).getUTCDay() + 6) % 7;
  const first = last - weekday * DAY - (weeks - 1) * 7 * DAY;
  const days = Array.from({ length: weeks * 7 }, (_, index) => {
    const time = first + index * DAY;
    const date = iso(time);
    return { index, time, date, count: counts.get(date) ?? 0, future: time > last };
  });
  const shown = days.filter((day) => !day.future);
  const peak = Math.max(...shown.map((day) => day.count), 1);
  const total = shown.reduce((sum, day) => sum + day.count, 0);
  const level = (count: number) => (count ? Math.ceil((count / peak) * 4) : 0);

  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const long = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const describe = (day: (typeof days)[number]) =>
    `${day.count.toLocaleString(locale)} ${unit} on ${long.format(day.time)}`;

  const months = Array.from({ length: weeks }, (_, column) => {
    const time = first + column * 7 * DAY;
    const previous = new Date(time - 7 * DAY).getUTCMonth();
    // a name in the last two columns would run past the grid
    return column > 0 && column < weeks - 2 && new Date(time).getUTCMonth() !== previous
      ? { column, name: month.format(time) }
      : null;
  }).filter((entry) => entry !== null);

  const [active, setActive] = useState(shown.length - 1);
  const [hovered, setHovered] = useState<number | null>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (event: KeyboardEvent) => {
    const step: Record<string, number> = {
      ArrowUp: -1,
      ArrowDown: 1,
      ArrowLeft: -7,
      ArrowRight: 7,
    };
    let next = active;
    if (event.key in step) next = active + step[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = shown.length - 1;
    else return;
    event.preventDefault();
    next = Math.min(Math.max(next, 0), shown.length - 1);
    setActive(next);
    cells.current[next]?.focus();
  };

  const caption = hovered ?? active;

  return (
    <div
      className={merge(
        "d:f fd:c g:3 max-w:100% p:5 bg:raised bs-o:key c:label fvn:tn bw:1 bc:rim",
        RADIUS.popup[shape],
        className,
      )}
    >
      <div className="d:f fw:w ai:b jc:sb g:2">
        <span className="fs:sm fw:600">{label}</span>
        <span className="c:hint fs:xs">
          {total.toLocaleString(locale)} {unit}
        </span>
      </div>

      <div className="d:f g:2 ox:auto">
        <div aria-hidden className="d:g gtr:7 g:1 pt:5 fs:0 c:hint lh:1">
          {["Mon", "", "Wed", "", "Fri", "", ""].map((name, row) => (
            <span key={row} className={`d:f ai:c fs:xs ${SIZES[size].row}`}>
              {name}
            </span>
          ))}
        </div>
        <div className="d:f fd:c g:1 fs:0">
          <div aria-hidden className="p:r h:4 fs:xs c:hint">
            {months.map(({ column, name }) => (
              <span
                key={column}
                className="p:a"
                style={{ left: `calc(${column} * (100% / ${weeks}))` }}
              >
                {name}
              </span>
            ))}
          </div>
          <div
            role="group"
            aria-label={label}
            onKeyDown={move}
            onPointerLeave={() => setHovered(null)}
            className="d:g gtr:7 gaf:c g:1"
          >
            {days.map((day) =>
              day.future ? (
                <span key={day.date} className={SIZES[size].cell} />
              ) : (
                <button
                  key={day.date}
                  ref={(node) => {
                    cells.current[day.index] = node;
                  }}
                  type="button"
                  tabIndex={day.index === active ? 0 : -1}
                  aria-label={describe(day)}
                  onFocus={() => setActive(day.index)}
                  onPointerEnter={() => setHovered(day.index)}
                  className={merge(
                    outline,
                    SIZES[size].cell,
                    "d:b p:0 bw:0",
                    LEVELS[level(day.count)],
                    RADIUS.chip[shape],
                  )}
                />
              ),
            )}
          </div>
        </div>
      </div>

      <div className="d:f fw:w ai:c jc:sb g:2 fs:xs c:hint">
        <span aria-hidden className="c:label">
          {describe(shown[caption] ?? shown[shown.length - 1])}
        </span>
        <div aria-hidden className="d:f ai:c g:1">
          <span className="mr:1">Less</span>
          {LEVELS.map((shade) => (
            <span
              key={shade}
              className={merge(SIZES[size].cell, shade, RADIUS.chip[shape])}
            />
          ))}
          <span className="ml:1">More</span>
        </div>
      </div>
    </div>
  );
}
