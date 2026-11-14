"use client";

import { move } from "@dnd-kit/helpers";
import { Feedback } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { IconGripVertical } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useLift, useShape } from "./style";

// the drop springs into its place with a little overshoot, and the rest make room on the movement curve
const SETTLE = { duration: 350, easing: "cubic-bezier(0.34, 1.3, 0.64, 1)" };
const ROOM = { duration: 250, easing: "cubic-bezier(0.25, 1, 0.5, 1)", idle: false };


export interface SortableListItem {
  /** Stays with the item as it moves; unique within the list. */
  id: string;
  /** The item's text. */
  label: string;
  /** Quieter text at the row's end, such as a duration. */
  meta?: string;
  /** A glyph before the label. */
  icon?: ReactNode;
}

export interface SortableListProps {
  /** The rows, top to bottom. */
  defaultItems?: SortableListItem[];
  /** Controlled order. Pass it with `onItemsChange`. */
  items?: SortableListItem[];
  /** Called with the new order after a drop. */
  onItemsChange?: (items: SortableListItem[]) => void;
  /**
   * Drag by the grip alone, which leaves the rest of the row free for buttons
   * and links. `false` lets the whole row drag.
   */
  handle?: boolean;
  /** Numbers each row by its place. */
  numbered?: boolean;
  /** Names the list for screen readers. */
  ariaLabel?: string;
  /** Corner radius of the list and its rows. Inherits the nearest `Shape`. */
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

function Row({
  item,
  index,
  handle,
  numbered,
  shape,
  outline,
}: {
  item: SortableListItem;
  index: number;
  handle: boolean;
  numbered: boolean;
  shape: Shape;
  outline: string;
}) {
  const grip = useRef<HTMLButtonElement>(null);
  const { ref, isDragging } = useSortable({
    id: item.id,
    index,
    handle: handle ? grip : undefined,
    transition: ROOM,
  });

  return (
    <li
      ref={ref}
      className={merge(
        "d:f ai:c g:2 h:11 pl:1 pr:3 bw:1 bc:rim bg:raised bs-o:key c:label",
        RADIUS.item[shape],
        handle ? "" : "c:g ta:none",
        isDragging ? "zi:10" : "",
      )}
    >
      <button
        ref={grip}
        type="button"
        aria-label={`Reorder ${item.label}`}
        tabIndex={handle ? 0 : -1}
        className={merge(
          outline,
          "d:f ai:c jc:c w:7 h:8 bw:0 bg:transparent c:hint h:c:label ta:none",
          handle ? "c:g" : "pe:none",
          RADIUS.item[shape],
        )}
      >
        <IconGripVertical aria-hidden className="w:4 h:4" />
      </button>
      {numbered && (
        <span className="w:4 c:hint fs:xs ff:m fvn:tn">{index + 1}</span>
      )}
      {item.icon && <span className="d:f c:hint">{item.icon}</span>}
      <span className="f:1 min-w:0 o:h to:e ws:nw">{item.label}</span>
      {item.meta && <span className="c:hint fs:xs fvn:tn">{item.meta}</span>}
    </li>
  );
}

/**
 * Rows reordered by dragging, with a pointer, a finger or the keyboard: Space
 * lifts a row, the arrows move it and Space drops it.
 */
export default function SortableList({
  defaultItems = [],
  items: controlled,
  onItemsChange,
  handle = true,
  numbered = false,
  ariaLabel,
  shape: shapeProp,
  className,
  focus = true,
}: SortableListProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [own, setOwn] = useState(defaultItems);
  const items = controlled ?? own;
  const lift = useLift();

  return (
    <DragDropProvider
      plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: SETTLE })]}
      onDragStart={lift.onDragStart}
      onDragMove={lift.onDragMove}
      onDragEnd={(event) => {
        lift.onDragEnd();
        if (event.canceled) return;
        const next = move(items, event);
        setOwn(next);
        onItemsChange?.(next);
      }}
    >
      <ul
        aria-label={ariaLabel}
        className={merge(
          "d:f fd:c g:1 p:1 m:0 lst:none w:100% bw:1 bc:line bg:well bs-o:sunk",
          RADIUS.popup[shape],
          className,
        )}
      >
        {items.map((item, index) => (
          <Row
            key={item.id}
            item={item}
            index={index}
            handle={handle}
            numbered={numbered}
            shape={shape}
            outline={outline}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}
