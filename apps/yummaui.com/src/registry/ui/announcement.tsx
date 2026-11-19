"use client";

import { IconArrowRight } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import Badge from "./badge";
import { FOCUS, RADIUS, type Shape, type Size, useShape } from "./style";

type Intent = "neutral" | "info" | "success" | "warning" | "danger";
type Side = "leading" | "trailing";

// the pill's padding leaves the badge an even 4px all round
const SIZES: Record<Size, { start: string; end: string; text: string; icon: string }> = {
  sm: { start: "p:1 pr:2", end: "p:1 pl:3", text: "fs:xs", icon: "w:3 h:3" },
  md: { start: "p:1 pr:3", end: "p:1 pl:3", text: "fs:sm", icon: "w:4 h:4" },
  lg: { start: "p:1 pr:3", end: "p:1 pl:4", text: "fs:md", icon: "w:4 h:4" },
};

export interface AnnouncementProps {
  /** The message beside the badge. */
  children: ReactNode;
  /** The badge's word, such as "New". */
  label: string;
  /** Where the announcement goes. Without it, the pill is plain text. */
  href?: string;
  /** What the news means, which tints the badge. */
  intent?: Intent;
  /** A solid badge in place of the tinted one, for news that leads a page. */
  solid?: boolean;
  /** A dot in the badge, before its word. */
  dot?: boolean;
  /** Which end the badge sits at. */
  badgePosition?: Side;
  /** An arrow at the end, saying the pill is a link. Shown with `href`. */
  arrow?: boolean;
  /** Padding and text size, the badge's with it. */
  size?: Size;
  /**
   * Corner radius of the announcement and its badge. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/** A badge beside a short message, such as news above a heading. */
export default function Announcement({
  children,
  label,
  href,
  intent = "info",
  solid = false,
  dot = false,
  badgePosition = "leading",
  arrow = true,
  size = "md",
  shape: shapeProp,
  focus = true,
  className,
}: AnnouncementProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const spec = SIZES[size];
  const trailing = badgePosition === "trailing";

  const tag = (
    <Badge variant={solid ? "solid" : "subtle"} intent={intent} dot={dot} size={size === "lg" ? "md" : "sm"} shape={shape} className="fs:0">
      {label}
    </Badge>
  );
  const body = (
    <>
      {!trailing && tag}
      <span className="as:c min-w:0 ws:nw o:h to:e">{children}</span>
      {trailing && tag}
      {href && arrow && !trailing && <IconArrowRight aria-hidden className={merge("as:c fs:0 c:hint", spec.icon)} />}
    </>
  );
  const pill = merge(
    // the badge stretches to the pill's height, so the space above and below it is the padding exactly, on any font
    "d:if ai:s g:2 max-w:100% bw:1 bc:rim bg:raised bs-o:key c:label td:none",
    spec.text,
    trailing ? spec.end : spec.start,
    RADIUS.control[shape],
    className,
  );

  return href ? (
    <a href={href} className={merge(outline, pill, "tp:c tdu:150 h:bg:well @prm:tp:none")}>
      {body}
    </a>
  ) : (
    <span className={pill}>{body}</span>
  );
}
