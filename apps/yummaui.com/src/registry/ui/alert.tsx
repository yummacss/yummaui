"use client";

import { Button } from "@base-ui/react/button";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

type Tone = "info" | "success" | "warning" | "danger";

const TILES: Record<Tone, string> = {
  info: "bg:blue/10 bc:blue/25 c:blue-6",
  success: "bg:green/10 bc:green/25 c:green-6",
  warning: "bg:orange/10 bc:orange/25 c:orange-6",
  danger: "bg:red/10 bc:red/25 c:red-6",
};

const ICONS: Record<Tone, ReactNode> = {
  info: <IconInfoCircle aria-hidden className="w:4 h:4" />,
  success: <IconCircleCheck aria-hidden className="w:4 h:4" />,
  warning: <IconAlertTriangle aria-hidden className="w:4 h:4" />,
  danger: <IconAlertCircle aria-hidden className="w:4 h:4" />,
};

export interface AlertProps {
  /** What the alert means; it colors the icon tile only. */
  tone?: Tone;
  /** The first line, in bold. */
  title: string;
  /** More detail under the title. */
  description?: ReactNode;
  /** A glyph in the tile, in place of the tone's own icon. */
  icon?: ReactNode;
  /** A button at the end, such as Upgrade. */
  action?: ReactNode;
  /** Shows a close button, and is called when it is pressed. */
  onDismiss?: () => void;
  /** What the close button says to a screen reader. */
  dismissLabel?: string;
  /** Corner radius of the alert & its tile. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A message in a raised card, its tone shown on the icon tile, with an optional
 * action and close button.
 */
export default function Alert({
  tone = "info",
  title,
  description,
  icon,
  action,
  onDismiss,
  dismissLabel = "Dismiss",
  shape: shapeProp,
  focus = true,
  className,
}: AlertProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const urgent = tone === "warning" || tone === "danger";

  return (
    <div
      role={urgent ? "alert" : "status"}
      className={merge(
        "d:f ai:c g:3 py:3 pl:3 pr:3 bw:1 bc:rim bg:raised bs-o:key c:label",
        RADIUS.block[shape],
        className,
      )}
    >
      <span
        className={merge(
          "d:f fs:0 ai:c jc:c w:8 h:8 bw:1",
          TILES[tone],
          RADIUS.item[shape],
        )}
      >
        {icon ?? ICONS[tone]}
      </span>
      <div className="d:f fd:c f:1 min-w:0">
        <span className="fs:sm fw:600">{title}</span>
        {description && <span className="c:hint fs:sm">{description}</span>}
      </div>
      {action && <div className="d:f fs:0">{action}</div>}
      {onDismiss && (
        <Button
          onClick={onDismiss}
          aria-label={dismissLabel}
          className={merge(
            outline,
            "d:f fs:0 ai:c jc:c w:7 h:7 p:0 bw:0 bg:transparent c:hint c:p h:c:label h:bg:well",
            RADIUS.item[shape],
          )}
        >
          <IconX aria-hidden className="w:4 h:4" />
        </Button>
      )}
    </div>
  );
}
