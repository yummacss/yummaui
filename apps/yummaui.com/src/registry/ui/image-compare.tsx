"use client";

import { IconArrowsHorizontal } from "@tabler/icons-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { merge } from "yummacss/merge";
import { FOCUS_WITHIN, RADIUS, type Shape, useShape } from "./style";

export interface ImageCompareProps {
  /** The picture on the left, before the change. */
  before: string;
  /** The picture on the right, after it. */
  after: string;
  /** What both pictures show, for screen readers. */
  alt: string;
  /** The label over the left side. `""` drops it. */
  beforeLabel?: string;
  /** The label over the right side. `""` drops it. */
  afterLabel?: string;
  /** Where the divider starts, in percent from the left. */
  defaultPosition?: number;
  /** The frame's width over its height, such as `16 / 10`. */
  aspectRatio?: string;
  /** Corner radius of the frame. Inherits the nearest `Shape`. */
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
 * Two pictures under one divider, dragged across or moved with the arrow keys,
 * to show a before and an after.
 */
export default function ImageCompare({
  before,
  after,
  alt,
  beforeLabel = "Before",
  afterLabel = "After",
  defaultPosition = 50,
  aspectRatio = "16 / 10",
  shape: shapeProp,
  className,
  focus = true,
}: ImageCompareProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS_WITHIN, focus === true ? "" : focus) : "";
  const label = "p:a zi:10 t:3 px:2 py:1 br:9999 bg:black/50 c:white fs:xs pe:none";

  return (
    <div
      className={merge("p:r w:100% o:h bw:1 bc:rim", outline, RADIUS.popup[shape], className)}
      style={{ aspectRatio }}
    >
      <ReactCompareSlider
        defaultPosition={defaultPosition}
        style={{ width: "100%", height: "100%" }}
        itemOne={<ReactCompareSliderImage src={before} alt={`${alt}, before`} />}
        itemTwo={<ReactCompareSliderImage src={after} alt={`${alt}, after`} />}
        handle={
          <div className="p:r d:f jc:c h:100% w:0">
            <span className="p:a t:0 b:0 bg:white bs-o:pop" style={{ width: 2 }} />
            <span className="p:a t:50% d:f ai:c jc:c w:9 h:9 br:9999 bg:white c:black bs-o:pop">
              <IconArrowsHorizontal aria-hidden className="w:4 h:4" />
            </span>
          </div>
        }
      />
      {beforeLabel && <span className={merge(label, "l:3")}>{beforeLabel}</span>}
      {afterLabel && <span className={merge(label, "r:3")}>{afterLabel}</span>}
    </div>
  );
}
