"use client";

import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

type Tone = "loud" | "quiet";

const TONES: Record<Tone, string> = {
  loud: "bg:fill c:on-fill bs-o:key-fill",
  quiet: "bg:raised c:label bw:1 bc:rim bs-o:key",
};

export interface BannerAlertProps {
  /** The message. */
  children: ReactNode;
  /** A link or button at the message's end. */
  action?: ReactNode;
  /** Filled in the fill color for news, or in the well color for a notice. */
  tone?: "loud" | "quiet";
  /** Adds a button that slides the banner away. */
  dismissible?: boolean;
  /** Called once the banner is dismissed, such as to remember it. */
  onDismiss?: () => void;
  /**
   * Corner radius of the strip and its dismiss button. Inherits the nearest
   * `Shape`.
   */
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
 * A strip across the top of a page for news or a notice, loud or quiet, that
 * slides away when dismissed.
 */
export default function BannerAlert({
  children,
  action,
  tone = "loud",
  dismissible = true,
  onDismiss,
  shape: shapeProp,
  className,
  focus = true,
}: BannerAlertProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [state, setState] = useState<"shown" | "leaving" | "gone">("shown");

  if (state === "gone") return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      onTransitionEnd={(event) => {
        if (state !== "leaving" || event.target !== event.currentTarget) return;
        setState("gone");
        onDismiss?.();
      }}
      className={merge(
        "d:g w:100% tp:a tdu:200 ttf:out-quart @prm:tp:none",
        state === "leaving" ? "o:0" : "o:100",
        className,
      )}
      style={{ gridTemplateRows: state === "leaving" ? "0fr" : "1fr" }}
    >
      {/* room for the key's shadow, which the collapsing row would clip */}
      <div className={merge("o:h min-h:0", state === "leaving" ? "" : "px:1 pb:1")}>
        <div className={merge("d:f fw:w ai:c g:3 py:2 pl:4 pr:2 fs:sm", TONES[tone], RADIUS.bar[shape])}>
          <div className="f:1 min-w:48">{children}</div>
          {action && <div className="fw:600">{action}</div>}
          {dismissible && (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => {
                // with reduced motion there is no transition to end
                if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
                  setState("gone");
                  onDismiss?.();
                } else setState("leaving");
              }}
              className={merge(outline, "d:f ai:c jc:c w:7 h:7 bw:0 bg:transparent c:current c:p o:70 h:o:100", RADIUS.item[shape])}
            >
              <IconX aria-hidden className="w:4 h:4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
