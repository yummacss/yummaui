"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import { Children, useCallback, useEffect, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface CarouselProps {
  /** The slides, one per child, such as pictures or cards. */
  children: ReactNode;
  /** Names the carousel for screen readers. */
  ariaLabel?: string;
  /** Wraps from the last slide back to the first. */
  loop?: boolean;
  /** Each slide's width over its height, such as `16 / 10`. */
  aspectRatio?: string;
  /** Draws the dots under the slides. */
  dots?: boolean;
  /** Corner radius of the slides and buttons. Inherits the nearest `Shape`. */
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
 * Slides one at a time, moved by swiping, dragging, the arrow keys, the buttons
 * or the dots; slides snap into place.
 */
export default function Carousel({
  children,
  ariaLabel = "Carousel",
  loop = false,
  aspectRatio = "16 / 10",
  dots = true,
  shape: shapeProp,
  className,
  focus = true,
}: CarouselProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const slides = Children.toArray(children);
  const [viewport, api] = useEmblaCarousel({ loop });
  const [selected, setSelected] = useState(0);
  const [ends, setEnds] = useState({ prev: false, next: false });

  const sync = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setEnds({ prev: api.canScrollPrev(), next: api.canScrollNext() });
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api, sync]);

  const button = merge(
    outline,
    "d:f ai:c jc:c w:8 h:8 bw:1 bc:rim bg:raised bs-o:key c:label",
    RADIUS.control[shape],
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={merge("d:f fd:c g:3 w:100% c:label", className)}
    >
      <div
        ref={viewport}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") api?.scrollPrev();
          if (event.key === "ArrowRight") api?.scrollNext();
        }}
        className={merge(outline, "o:h", RADIUS.popup[shape])}
      >
        <div className="d:f ml:-3">
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className="pl:3 min-w:0"
              style={{ flex: "0 0 100%" }}
            >
              <div className={merge("o:h us:none", RADIUS.popup[shape])} style={{ aspectRatio }}>
                {slide}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="d:f ai:c jc:sb g:3">
        {dots ? (
          <div className="d:f ai:c g:1">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selected}
                onClick={() => api?.scrollTo(index)}
                className={merge(
                  outline,
                  "h:2 bw:0 br:9999 c:p tp:w tdu:200 ttf:out-quart @prm:tp:none",
                  index === selected ? "w:6 bg:fill" : "w:2 bg:rim",
                )}
              />
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="d:f g:2">
          <button
            type="button"
            aria-label="Previous slide"
            disabled={!ends.prev}
            onClick={() => api?.scrollPrev()}
            className={merge(button, ends.prev ? "c:p h:bg:well" : "o:40 c:d")}
          >
            <IconChevronLeft aria-hidden className="w:4 h:4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            disabled={!ends.next}
            onClick={() => api?.scrollNext()}
            className={merge(button, ends.next ? "c:p h:bg:well" : "o:40 c:d")}
          >
            <IconChevronRight aria-hidden className="w:4 h:4" />
          </button>
        </div>
      </div>
    </section>
  );
}
