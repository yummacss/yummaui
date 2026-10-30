import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";

type IconTone = "accent" | "neutral";
type Shape = "rounded" | "square" | "squircle" | "pill";

const ICON_TONES: Record<IconTone, string> = {
  accent: "c:label",
  neutral: "c:hint",
};


export interface EmptyStateProps {
  /** The glyph in the badge. No badge renders without one. */
  icon?: ReactNode;
  /**
   * `accent` for an invitation to act, `neutral` for a plain absence: nothing
   * found, nothing to do.
   */
  iconTone?: IconTone;
  /** The heading. */
  title: string;
  /** A line under the title. */
  description?: string;
  /** Corner radius of the buttons. */
  shape?: Shape;
  /** The filled button. Omit it for a state with nothing to do. */
  primaryLabel?: string;
  /** A glyph before the primary label. */
  primaryIcon?: ReactNode;
  /** Called when the primary button is pressed. */
  onPrimary?: () => void;
  /** The outlined button beside the primary one. */
  secondaryLabel?: string;
  /** A glyph before the secondary action's label. */
  secondaryIcon?: ReactNode;
  /** Called when the secondary button is pressed. */
  onSecondary?: () => void;
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
 * A placeholder for an empty list, with an optional badge icon and up to two
 * actions.
 */
export default function EmptyStateBase({
  icon,
  iconTone = "accent",
  title,
  description,
  primaryLabel,
  primaryIcon,
  secondaryIcon,
  onPrimary,
  secondaryLabel,
  onSecondary,
  shape = "square",
  className,
  focus = true,
}: EmptyStateProps) {
  const hasActions = Boolean(primaryLabel || secondaryLabel);

  const gap = icon || hasActions ? "g:4" : "g:1";

  const rootClasses = merge("d:f fd:c ai:c jc:c p:8", gap, className);

  const badgeClasses = [
    "d:f ai:c jc:c",
    ICON_TONES[iconTone],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses}>
      {icon && <div className={badgeClasses}>{icon}</div>}

      <div className="d:f fd:c ai:c g:1 ta:c">
        <span className="c:label fs:md fw:500">{title}</span>
        {description && <span className="c:hint fs:sm">{description}</span>}
      </div>

      {hasActions && (
        <div className="d:f g:3">
          {secondaryLabel && (
            <Button
              variant="secondary"
              icon={secondaryIcon}
              shape={shape}
              focus={focus}
              onClick={onSecondary}
            >
              {secondaryLabel}
            </Button>
          )}
          {primaryLabel && (
            <Button
              icon={primaryIcon}
              shape={shape}
              focus={focus}
              onClick={onPrimary}
            >
              {primaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
