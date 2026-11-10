"use client";

import type { ReactNode } from "react";
import { Children, Fragment } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { merge } from "yummacss/merge";
import { RADIUS, type Shape, useShape } from "./style";

export interface ResizablePanelsProps {
  /**
   * The panels, one per child, with a handle between each pair. A child can be
   * another `ResizablePanels` to split the other way.
   */
  children: ReactNode;
  /** Side by side, or stacked top to bottom. */
  orientation?: "horizontal" | "vertical";
  /**
   * Each panel's starting size in percent, in order. Shares out evenly without
   * it.
   */
  defaultSizes?: number[];
  /** The smallest a panel can get, in percent. */
  minSize?: number;
  /** Draws a small knob on each handle, so it reads as something to drag. */
  grip?: boolean;
  /**
   * Draws the border and corners. `false` for a group inside another, which
   * already has them.
   */
  bordered?: boolean;
  /** Corner radius of the frame. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * Panels split by handles you drag or move with the arrow keys; a double click
 * puts a panel back to its starting size.
 */
export default function ResizablePanels({
  children,
  orientation = "horizontal",
  defaultSizes,
  minSize = 10,
  grip = true,
  bordered = true,
  shape: shapeProp,
  className,
  focus = true,
}: ResizablePanelsProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge("fv:bg:label", focus === true ? "" : focus) : "";
  const panels = Children.toArray(children);
  const across = orientation === "horizontal";

  return (
    <Group
      orientation={orientation}
      className={merge(
        "w:100% h:100% bg:raised c:label",
        bordered ? "bw:1 bc:rim bs-o:key o:h" : "",
        bordered ? RADIUS.popup[shape] : "",
        className,
      )}
    >
      {panels.map((panel, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <Separator
              className={merge(
                "p:r d:f ai:c jc:c bg:line os:none tp:c tdu:150 @prm:tp:none",
                "h:bg:label resizing:bg:label",
                outline,
                across ? "w:px c:cr" : "h:px c:rr",
              )}
            >
              {grip && (
                <span
                  aria-hidden
                  className={merge(
                    "p:a zi:10 bw:1 bc:rim bg:raised br:9999",
                    across ? "w:2 h:6" : "w:6 h:2",
                  )}
                />
              )}
            </Separator>
          )}
          <Panel
            defaultSize={defaultSizes?.[index]}
            minSize={minSize}
            className="d:f fd:c h:100% o:auto"
          >
            {panel}
          </Panel>
        </Fragment>
      ))}
    </Group>
  );
}
