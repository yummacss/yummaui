"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { IconBulb, IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface ReasoningProps {
  /** The steps of the thinking, shown when it is open. */
  children: ReactNode;
  /** Still thinking: a shimmering line, open on its steps. */
  thinking?: boolean;
  /** How long it thought, for the line once it is done. */
  seconds?: number;
  /** Open at the start. It folds itself away when thinking ends. */
  defaultOpen?: boolean;
  /** Corner radius of the line's focus. Inherits the nearest `Shape`. */
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
 * The model's thinking: a shimmering line while it thinks, then how long it
 * took, which folds open to the steps.
 */
export default function Reasoning({
  children,
  thinking = false,
  seconds,
  defaultOpen = false,
  shape: shapeProp,
  className,
  focus = true,
}: ReasoningProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [open, setOpen] = useState(defaultOpen || thinking);

  // open while it thinks, folded away once it is done
  const was = useRef(thinking);
  useEffect(() => {
    if (was.current !== thinking) setOpen(thinking);
    was.current = thinking;
  }, [thinking]);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className={merge("d:f fd:c g:2 c:label", className)}>
      <Collapsible.Trigger
        className={merge(outline, "d:if ai:c g:2 w:fc py:1 pr:1 bw:0 bg:transparent c:hint fs:sm c:p h:c:label", RADIUS.item[shape])}
      >
        {thinking ? (
          <span className="c:label an:shimmer adu:1000 atf:l aic:i @prm:an:none" style={SHIMMER}>
            Thinking…
          </span>
        ) : (
          <>
            <IconBulb aria-hidden className="w:4 h:4" />
            {seconds === undefined ? "Thought" : `Thought for ${seconds}s`}
          </>
        )}
        <IconChevronRight
          aria-hidden
          className={merge("w:4 h:4 tp:t tdu:150 @prm:tp:none", open ? "ro:18" : "")}
        />
      </Collapsible.Trigger>
      <Collapsible.Panel className="o:h h:var(--collapsible-panel-height) tp:a tdu:200 ttf:out-quart opening:h:0 closing:h:0 @prm:tp:none">
        <div className="ml:2 pl:4 blw:2 bc:line c:hint fs:sm lh:4">{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

// a brighter band that sweeps across the label
const SHIMMER = {
  maskImage: "linear-gradient(90deg, rgb(0 0 0 / .45) 40%, black 50%, rgb(0 0 0 / .45) 60%)",
  maskSize: "300% 100%",
} as const;
