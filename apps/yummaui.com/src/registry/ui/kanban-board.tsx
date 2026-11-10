"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface KanbanCard {
  /** Stays with the card as it moves; unique across the board. */
  id: string;
  /** The card's text. */
  title: string;
  /** A small line under the title, such as a label or a date. */
  meta?: string;
  /** Drawn at the card's corner, such as an avatar. */
  end?: ReactNode;
}

export interface KanbanColumn {
  /** Unique across the board. */
  id: string;
  /** The heading over the column. */
  title: string;
  /** The cards, top to bottom. */
  cards: KanbanCard[];
}

export interface KanbanBoardProps {
  /** The columns, left to right, each with its cards. */
  defaultColumns?: KanbanColumn[];
  /** Called with the board after a card is dropped. */
  onColumnsChange?: (columns: KanbanColumn[]) => void;
  /** Shows how many cards each column holds. */
  counts?: boolean;
  /** Corner radius of the columns and cards. Inherits the nearest `Shape`. */
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

type Cards = Record<string, KanbanCard[]>;

const toCards = (columns: KanbanColumn[]): Cards =>
  Object.fromEntries(columns.map((column) => [column.id, column.cards]));

const toColumns = (columns: KanbanColumn[], cards: Cards): KanbanColumn[] =>
  columns.map((column) => ({ ...column, cards: cards[column.id] ?? [] }));

function Card({
  card,
  index,
  column,
  shape,
  outline,
}: {
  card: KanbanCard;
  index: number;
  column: string;
  shape: Shape;
  outline: string;
}) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: column,
    type: "card",
    accept: "card",
  });

  return (
    <li
      ref={ref}
      className={merge(
        outline,
        "d:f fd:c g:2 py:2 px:3 bw:1 bc:rim bg:raised c:label c:g ta:none us:none",
        RADIUS.block[shape],
        isDragging ? "bs-o:pop zi:10" : "bs-o:key",
      )}
    >
      <span className="fs:sm">{card.title}</span>
      {(card.meta || card.end) && (
        <span className="d:f ai:c jc:sb g:2">
          <span className="c:hint fs:xs ff:m">{card.meta}</span>
          {card.end}
        </span>
      )}
    </li>
  );
}

function Column({
  column,
  cards,
  counts,
  shape,
  outline,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  counts: boolean;
  shape: Shape;
  outline: string;
}) {
  // low priority, so a card under the pointer wins over the column around it
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: "column",
    accept: "card",
    collisionPriority: 1,
  });

  return (
    <section
      aria-label={column.title}
      className={merge(
        "d:f fd:c g:2 p:2 min-w:48 tp:c tdu:150 @prm:tp:none",
        RADIUS.popup[shape],
        isDropTarget ? "bg:rim" : "bg:well",
      )}
    >
      <h3 className="d:f ai:c jc:sb m:0 px:1 pt:1 fs:sm fw:600 c:label">
        {column.title}
        {counts && (
          <span className="c:hint fs:xs fw:400 ff:m fvn:tn">
            {cards.length}
          </span>
        )}
      </h3>
      <ul ref={ref} className="d:f fd:c g:2 f:1 min-h:16 m:0 p:0 lst:none">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            column={column.id}
            shape={shape}
            outline={outline}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * Columns of cards moved by dragging, within a column or across, with a
 * pointer, a finger or the keyboard.
 */
export default function KanbanBoard({
  defaultColumns: columns = [],
  onColumnsChange,
  counts = true,
  shape: shapeProp,
  className,
  focus = true,
}: KanbanBoardProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [cards, setCards] = useState(() => toCards(columns));
  const latest = useRef(cards);
  latest.current = cards;
  // the board before the drag, put back if it is canceled
  const before = useRef(cards);

  return (
    <DragDropProvider
      onDragStart={() => {
        before.current = cards;
      }}
      onDragOver={(event) => {
        setCards((current) => move(current, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setCards(before.current);
          return;
        }
        onColumnsChange?.(toColumns(columns, latest.current));
      }}
    >
      <div
        className={merge(
          "d:g g:3 w:100% ox:auto pb:1",
          className,
        )}
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(12rem, 1fr))` }}
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={cards[column.id] ?? []}
            counts={counts}
            shape={shape}
            outline={outline}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
