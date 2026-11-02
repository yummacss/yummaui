"use client";

import { Button } from "@base-ui/react/button";
import { Separator } from "@base-ui/react/separator";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import { type Corner, FOCUS, RADIUS, shapeOf, useCorner } from "./style";


type Orientation = "horizontal" | "vertical";

export interface SeparatorProps {
  /**
   * Renders as a clickable button in the middle, sized & shaped to match. Wins
   * over `label` if both are set.
   */
  icon?: ReactNode;
  /** Called when the icon button is pressed. */
  onIconClick?: () => void;
  /** The icon button's accessible name, such as "Add a section". */
  iconLabel?: string;
  /** Renders as plain text in the middle. Ignored if `icon` is set. */
  label?: ReactNode;
  /**
   * Corner radius on the icon button, the only part with corners. Only visible
   * alongside `icon`. Inherits the nearest `Shape`, where `pill` draws a
   * circle.
   */
  iconShape?: Corner;
  /**
   * A vertical rule for a row layout, like a button group. Applies to the
   * `icon` and `label` forms too, which turn with it.
   */
  orientation?: Orientation;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

/**
 * A horizontal or vertical divider, plain, or with a clickable icon or a text
 * label in the middle.
 */
export default function SeparatorBase({
  icon,
  onIconClick,
  iconLabel,
  label,
  iconShape: iconShapeProp,
  orientation = "horizontal",
  className,
  focus = true,
}: SeparatorProps) {
  const iconShape = useCorner(iconShapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";

  const vertical = orientation === "vertical";

  // a percentage height beats align-self: stretch, so a vertical rule in a row
  // that sizes to its content measures zero
  const rule = vertical ? "w:0 as:s" : "h:0 w:100%";
  const line = vertical
    ? "blw:1 bc:line"
    : "btw:1 bc:line";

  if (!icon && !label) {
    return (
      <Separator
        orientation={orientation}
        className={merge(rule, line, className)}
      />
    );
  }

  const buttonClasses = merge(
    outline,
    "d:if ai:c jc:c w:8 h:8 bg:raised bs-o:key bc:rim c:label bw:1 tp:a tdu:150 ttf:io a:s:96 wc:s @prm:tp:none @prm:a:s:100 us:none c:p h:bg:well",
    RADIUS.control[shapeOf(iconShape)],
  );

  const half = `fg:1 ${vertical ? "w:0" : "h:0"} ${line}`;

  return (
    <div
      className={merge(
        `d:f ai:c g:2 ${vertical ? "fd:c h:100% as:s" : "w:100%"}`,
        className,
      )}
    >
      <Separator orientation={orientation} className={half} />
      {icon ? (
        <Button
          aria-label={iconLabel}
          className={buttonClasses}
          onClick={onIconClick}
        >
          {icon}
        </Button>
      ) : (
        <span className="fs:0 c:hint fs:xs fw:500 tt:u ls:3">{label}</span>
      )}
      <Separator orientation={orientation} className={half} />
    </div>
  );
}
