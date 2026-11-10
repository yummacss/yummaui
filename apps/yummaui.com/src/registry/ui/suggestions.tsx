"use client";

import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface Suggestion {
  /** What the suggestion asks, which `onSelect` receives. */
  label: string;
  /** A line under the label, for cards. */
  description?: string;
  /** A glyph before the label, for chips. */
  icon?: ReactNode;
}

export interface SuggestionsProps {
  /** The prompts to start from. */
  items: Suggestion[];
  /** Called with the picked suggestion, such as to fill the prompt. */
  onSelect?: (suggestion: Suggestion) => void;
  /**
   * A row of chips that scrolls sideways, or a grid of cards for an empty chat.
   */
  variant?: "chips" | "cards";
  /** Corner radius of the chips or cards. Inherits the nearest `Shape`. */
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
 * Prompts to start from, as raised keys that press in: a row of chips, or a
 * grid of cards for an empty chat.
 */
export default function Suggestions({
  items,
  onSelect,
  variant = "chips",
  shape: shapeProp,
  className,
  focus = true,
}: SuggestionsProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const key = "bw:1 bc:rim bg:raised bs-o:key c:label c:p h:bg:well a:bs-o:sunk";

  if (variant === "cards") {
    return (
      <div className={merge("d:g gtc:2 g:2 w:100%", className)}>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect?.(item)}
            className={merge(outline, key, "d:f fd:c g:1 p:3 ta:l", RADIUS.popup[shape])}
          >
            <span className="fs:sm fw:500">{item.label}</span>
            {item.description && <span className="c:hint fs:sm">{item.description}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={merge("d:f g:2 w:100% ox:auto pb:1", className)} style={{ scrollbarWidth: "none" }}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect?.(item)}
          className={merge(outline, key, "d:if fs:0 ai:c g:2 h:9 px:3 fs:sm ws:nw", RADIUS.control[shape])}
        >
          {item.icon && <span className="d:f c:hint">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
