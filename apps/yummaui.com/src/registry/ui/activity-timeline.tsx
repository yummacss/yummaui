"use client";

import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, type Shape, useShape } from "./style";

export interface ActivityEvent {
  /** A glyph on the marker. Without one the marker is a small dot. */
  icon?: ReactNode;
  /** What happened, such as who did what. */
  title: ReactNode;
  /** When it happened, as people read it: `2 min ago`, `Yesterday`. */
  time: string;
  /** The same moment, machine-readable, for the `<time>` element. */
  dateTime?: string;
  /** A quote or detail under the line, such as a comment. */
  body?: ReactNode;
}

export interface ActivityTimelineProps {
  /** The events, newest first. */
  events: ActivityEvent[];
  /** Names the list for screen readers. */
  label?: string;
  /** Corner radius of the markers and quotes. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * Events down a line as an ordered list, each on a raised marker with when it
 * happened and an optional quote.
 */
export default function ActivityTimeline({
  events,
  label = "Activity",
  shape: shapeProp,
  className,
}: ActivityTimelineProps) {
  const shape = useShape(shapeProp);

  return (
    <ol aria-label={label} className={merge("d:f fd:c m:0 p:0 lst:none c:label fs:sm", className)}>
      {events.map((event, index) => {
        const last = index === events.length - 1;
        return (
          <li
            key={index}
            className="d:f g:3"
          >
            <div className="d:f fd:c ai:c fs:0">
              <span
                aria-hidden
                className={merge(
                  "d:f ai:c jc:c w:8 h:8 fs:0 bw:1 bc:rim bg:raised bs-o:key c:label",
                  RADIUS.control[shape],
                )}
              >
                {event.icon ?? <span className="w:2 h:2 br:9999 bg:hint" />}
              </span>
              {!last && <span aria-hidden className="f:1 w:px my:1 bg:line" />}
            </div>
            <div className={`f:1 min-w:0 d:f fd:c g:1 pt:1 ${last ? "" : "pb:5"}`}>
              <span>{event.title}</span>
              <time dateTime={event.dateTime} className="fs:xs c:hint">
                {event.time}
              </time>
              {event.body && (
                <div className={merge("mt:1 px:3 py:2 bg:well bw:1 bc:line fs:sm c:label", RADIUS.block[shape])}>
                  {event.body}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
