"use client";

import { Button } from "@base-ui/react/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface PaginationProps {
  /** How many pages there are. */
  total: number;
  /**
   * The current page, counting from 1. Controlled; pair with `onPageChange`.
   */
  page?: number;
  /** The page it starts on when uncontrolled. */
  defaultPage?: number;
  /** Called with the new page whenever it changes. */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one before a gap. */
  siblings?: number;
  /** What the button before the pages says. */
  previousLabel?: string;
  /** What the button after the pages says. */
  nextLabel?: string;
  /** What the landmark is called for screen readers. */
  ariaLabel?: string;
  /** Corner radius of the buttons. Inherits the nearest `Shape`. */
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

/** The pages to show: numbers, and `null` where a run is left out. */
function pagesOf(page: number, total: number, siblings: number) {
  const shown = new Set([1, total]);
  for (let at = page - siblings; at <= page + siblings; at++)
    if (at >= 1 && at <= total) shown.add(at);
  const sorted = [...shown].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((at, index) => {
    const before = sorted[index - 1];
    if (before !== undefined && at - before === 2) out.push(at - 1);
    else if (before !== undefined && at - before > 2) out.push(null);
    out.push(at);
  });
  return out;
}

/**
 * Previous and Next keys around the page numbers, folding to "Page 3 of 10" on
 * a phone.
 */
export default function Pagination({
  total,
  page: controlled,
  defaultPage = 1,
  onPageChange,
  siblings = 1,
  previousLabel = "Previous",
  nextLabel = "Next",
  ariaLabel = "Pagination",
  shape: shapeProp,
  focus = true,
  className,
}: PaginationProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [own, setOwn] = useState(defaultPage);
  const page = Math.min(Math.max(controlled ?? own, 1), Math.max(total, 1));
  const go = (next: number) => {
    if (controlled === undefined) setOwn(next);
    onPageChange?.(next);
  };

  const key = (off: boolean) =>
    merge(
      outline,
      "d:if ai:c jc:c g:1 h:9 min-w:9 px:2 @sm:px:3 bw:1 bg:raised bs-o:key bc:rim c:label fs:sm fw:500 us:none",
      off ? "o:50 c:na" : "c:p h:bg:well",
      RADIUS.control[shape],
    );
  const number = (current: boolean) =>
    merge(
      outline,
      "d:if ai:c jc:c h:9 min-w:9 px:2 bw:0 fs:sm fw:500 fvn:tn us:none c:p",
      current ? "bg:fill c:on-fill bs-o:key-fill" : "bg:transparent c:hint h:c:label h:bg:well",
      RADIUS.control[shape],
    );

  return (
    <nav aria-label={ariaLabel} className={merge("d:f ai:c g:2", className)}>
      <Button
        className={key(page <= 1)}
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        aria-label={previousLabel}
      >
        <IconChevronLeft aria-hidden className="w:4 h:4" />
        <span aria-hidden className="d:none @sm:d:i">
          {previousLabel}
        </span>
      </Button>
      <ul className="d:none @sm:d:f ai:c g:1 m:0 p:0 lst:none">
        {pagesOf(page, total, siblings).map((at, index) => (
          <li key={at ?? `gap-${index}`}>
            {at === null ? (
              <span aria-hidden className="d:if ai:c jc:c h:9 min-w:9 c:hint fs:sm">
                …
              </span>
            ) : (
              <Button
                className={number(at === page)}
                aria-current={at === page ? "page" : undefined}
                aria-label={`Page ${at}`}
                onClick={() => go(at)}
              >
                {at}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <span aria-live="polite" className="@sm:d:none c:hint fs:sm fvn:tn">
        Page {page} of {total}
      </span>
      <Button
        className={key(page >= total)}
        disabled={page >= total}
        onClick={() => go(page + 1)}
        aria-label={nextLabel}
      >
        <span aria-hidden className="d:none @sm:d:i">
          {nextLabel}
        </span>
        <IconChevronRight aria-hidden className="w:4 h:4" />
      </Button>
    </nav>
  );
}
