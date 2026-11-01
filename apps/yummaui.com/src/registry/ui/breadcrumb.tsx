"use client";

import { IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, type Size, SIZE, useShape } from "./style";

type Separator = "chevron" | "slash";

const SEPARATOR_SIZES: Record<Size, string> = {
  sm: "w:4 h:4",
  md: "w:5 h:5",
  lg: "w:6 h:6",
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}

export interface BreadcrumbProps {
  /**
   * Each item's `label`, `href`, optional `icon` and `iconOnly`. The last item
   * is always rendered as the current page: a plain span with
   * `aria-current="page"`, never a link, regardless of whether it has an
   * `href`.
   */
  items: BreadcrumbItem[];
  /** Wraps the trail in a bordered card. */
  bordered?: boolean;
  /**
   * Corner radius. Only visible when `bordered` is set. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
  /** Text size of every item. */
  size?: Size;
  /** The mark between items. */
  separator?: Separator;
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
 * A navigation trail, plain or in a bordered card, with three sizes and two
 * separator styles.
 */
export default function BreadcrumbBase({
  items,
  bordered = false,
  shape: shapeProp,
  size = "md",
  separator = "chevron",
  className,
  focus = true,
}: BreadcrumbProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";

  const navClasses = merge(
    "d:f ai:c g:2",
    bordered
      ? "px:3 py:2 bg:raised bs-o:key bc:rim bw:1"
      : "",
    bordered ? RADIUS.control[shape] : "",
    className,
  );

  const labelClasses = [SIZE.text[size], "fw:400"].filter(Boolean).join(" ");
  // the current page sits in a raised chip
  const currentClasses = [
    SIZE.text[size],
    "px:2 py:1 bw:1 bg:raised bs-o:key bc:rim fw:500 c:label",
    RADIUS.chip[shape],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav aria-label="Breadcrumb" className={navClasses}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        const linkClasses = merge(
          outline,
          "d:f ai:c min-h:6",
          item.icon ? "g:2" : "",
          "c:hint h:c:label",
        );

        return (
          <span key={item.label} className="d:f ai:c g:2">
            {isLast ? (
              <span
                className={["d:f ai:c g:1", currentClasses].join(" ")}
                aria-current="page"
              >
                {item.label}
                {item.icon}
              </span>
            ) : (
              <a
                href={item.href ?? "#"}
                className={linkClasses}
                aria-label={item.iconOnly ? item.label : undefined}
              >
                {item.icon}
                {!item.iconOnly && (
                  <span className={labelClasses}>{item.label}</span>
                )}
              </a>
            )}
            {!isLast &&
              (separator === "chevron" ? (
                <IconChevronRight
                  className={`c:hint ${SEPARATOR_SIZES[size]}`}
                  aria-hidden="true"
                />
              ) : (
                <span className={`c:hint ${SIZE.text[size]}`} aria-hidden="true">
                  /
                </span>
              ))}
          </span>
        );
      })}
    </nav>
  );
}
