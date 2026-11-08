"use client";

import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, type Shape, useShape } from "./style";

export interface CardProps {
  /** The heading at the top. */
  title?: string;
  /** A line under the title. */
  description?: string;
  /** What the card holds, between the heading and the actions. */
  children?: ReactNode;
  /** Buttons along the bottom, right-aligned. */
  actions?: ReactNode;
  /** Corner radius of the card. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/** A raised panel with a heading, content and actions. */
export default function Card({
  title,
  description,
  children,
  actions,
  shape: shapeProp,
  className,
}: CardProps) {
  const shape = useShape(shapeProp);

  return (
    <div
      className={merge(
        "d:f fd:c g:4 p:5 bw:1 bc:rim bg:raised bs-o:key c:label",
        RADIUS.popup[shape],
        className,
      )}
    >
      {(title || description) && (
        <div className="d:f fd:c g:1">
          {title && <span className="fw:600">{title}</span>}
          {description && <span className="c:hint fs:sm">{description}</span>}
        </div>
      )}
      {children}
      {actions && <div className="d:f fw:w jc:fe g:2">{actions}</div>}
    </div>
  );
}
