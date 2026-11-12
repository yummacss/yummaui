"use client";

import { IconLayoutColumns, IconLayoutRows } from "@tabler/icons-react";
import { diffLines, diffWordsWithSpace } from "diff";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape, Scroll } from "./style";
import Toggle from "./toggle";
import ToggleGroup from "./toggle-group";

type View = "unified" | "split";

export interface DiffViewerProps {
  /** The text before the change. */
  before: string;
  /** The text after it. */
  after: string;
  /** The file's name in the header. */
  filename?: string;
  /**
   * One column with removed lines over added ones, or the two sides next to
   * each other.
   */
  defaultView?: "unified" | "split";
  /**
   * Unchanged lines kept around each change; longer runs fold behind a button.
   */
  context?: number;
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

interface Row {
  kind: "same" | "change";
  old?: { line: number; text: ReactNode };
  new?: { line: number; text: ReactNode };
}

const lines = (value: string) => value.replace(/\n$/, "").split("\n");

// the words that changed inside a line, marked on each side
function words(before: string, after: string, shape: Shape): [ReactNode, ReactNode] {
  const parts = diffWordsWithSpace(before, after);
  const side = (keep: "added" | "removed", tint: string) =>
    parts
      .filter((part) => !part[keep === "added" ? "removed" : "added"])
      .map((part, index) =>
        part[keep] ? (
          <mark key={index} className={`${tint} c:current ${RADIUS.textChip[shape]}`}>
            {part.value}
          </mark>
        ) : (
          part.value
        ),
      );
  return [side("removed", "bg:red/25"), side("added", "bg:green/25")];
}

function rowsOf(before: string, after: string, shape: Shape): Row[] {
  const rows: Row[] = [];
  const changes = diffLines(before, after);
  let a = 1;
  let b = 1;
  for (let index = 0; index < changes.length; index++) {
    const change = changes[index];
    if (!change.added && !change.removed) {
      for (const text of lines(change.value)) {
        rows.push({ kind: "same", old: { line: a++, text }, new: { line: b++, text } });
      }
      continue;
    }
    // a removal followed by an addition pairs up line by line
    const removed = change.removed ? lines(change.value) : [];
    const next = changes[index + 1];
    const added = change.added
      ? lines(change.value)
      : next?.added
        ? lines(next.value)
        : [];
    if (change.removed && next?.added) index++;
    for (let at = 0; at < Math.max(removed.length, added.length); at++) {
      const old = removed[at];
      const neu = added[at];
      const [oldText, newText] =
        old !== undefined && neu !== undefined ? words(old, neu, shape) : [old, neu];
      rows.push({
        kind: "change",
        old: old !== undefined ? { line: a++, text: oldText } : undefined,
        new: neu !== undefined ? { line: b++, text: newText } : undefined,
      });
    }
  }
  return rows;
}

/**
 * A change between two texts, one column or side by side, with the changed
 * words marked and long unchanged runs folded away.
 */
export default function DiffViewer({
  before,
  after,
  filename,
  defaultView = "unified",
  context = 2,
  shape: shapeProp,
  className,
  focus = true,
}: DiffViewerProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [view, setView] = useState<View>(defaultView);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const rows = useMemo(() => rowsOf(before, after, shape), [before, after, shape]);
  const added = rows.filter((row) => row.kind === "change" && row.new).length;
  const removed = rows.filter((row) => row.kind === "change" && row.old).length;

  // runs of unchanged rows longer than the context on both sides fold away
  const shown: (Row | { fold: number; from: number })[] = [];
  for (let start = 0; start < rows.length; ) {
    if (rows[start].kind === "change") {
      shown.push(rows[start++]);
      continue;
    }
    let end = start;
    while (end < rows.length && rows[end].kind === "same") end++;
    const head = start === 0 ? 0 : context;
    const tail = end === rows.length ? 0 : context;
    if (end - start > head + tail + 1 && !opened.has(start)) {
      shown.push(...rows.slice(start, start + head));
      shown.push({ fold: end - start - head - tail, from: start });
      shown.push(...rows.slice(end - tail, end));
    } else {
      shown.push(...rows.slice(start, end));
    }
    start = end;
  }

  const number = "w:0 px:2 ta:r c:hint us:none ws:nw";
  const sign = "w:0 pl:2 us:none";
  const code = "w:100% px:2 ws:p";
  const columns = view === "unified" ? 4 : 6;

  const cells = (row: Row, side: "old" | "new") => {
    const part = row[side];
    const tint =
      row.kind === "same" ? "" : part ? (side === "old" ? "bg:red/10" : "bg:green/10") : "bg:well";
    return (
      <>
        <td className={merge(number, tint, side === "new" && view === "split" ? "blw:1 bc:line" : "")}>
          {part?.line}
        </td>
        <td
          className={merge(
            sign,
            tint,
            part && row.kind === "change" ? (side === "old" ? "c:red-6" : "c:green-6") : "c:hint",
          )}
        >
          {row.kind === "change" && part ? (side === "old" ? "-" : "+") : ""}
        </td>
        <td className={merge(code, tint)}>{part?.text}</td>
      </>
    );
  };


  return (
    <div
      className={merge(
        "w:100% bw:1 bc:rim bg:raised bs-o:key o:h c:label",
        RADIUS.popup[shape],
        className,
      )}
    >
      <div className="d:f fw:w ai:c jc:sb g:2 py:2 pl:3 pr:2 bbw:1 bc:line">
        <span className="d:f ai:c g:3 min-w:0">
          {filename && <span className="ff:m fs:xs fw:500 o:h to:e ws:nw">{filename}</span>}
          <span className="d:f g:2 ff:m fs:xs fvn:tn">
            <span className="c:green-6">+{added}</span>
            <span className="c:red-6">-{removed}</span>
          </span>
        </span>
        <ToggleGroup
          value={[view]}
          onValueChange={(next) => next[0] && setView(next[0] as View)}
          shape={shape}
        >
          <Toggle value="unified" label="Unified" size="sm" focus={focus} icon={<IconLayoutRows className="w:4 h:4" />} />
          <Toggle value="split" label="Split" size="sm" focus={focus} icon={<IconLayoutColumns className="w:4 h:4" />} />
        </ToggleGroup>
      </div>
      <Scroll axis="x" viewport="pb:2">
        <table className="w:100% bc:c ff:m fs:xs lh:6">
          <tbody>
            {shown.map((row, index) => {
              if ("fold" in row) {
                return (
                  <tr key={`fold-${row.from}`}>
                    <td colSpan={columns} className="py:1 ta:c bg:well">
                      <button
                        type="button"
                        onClick={() => setOpened((now) => new Set(now).add(row.from))}
                        className={merge(outline, "px:2 bw:0 bg:transparent c:hint h:c:label ff:d fs:xs c:p", RADIUS.item[shape])}
                      >
                        Show {row.fold} unchanged lines
                      </button>
                    </td>
                  </tr>
                );
              }
              if (view === "split") {
                return (
                  <tr key={index}>
                    {cells(row, "old")}
                    {cells(row, "new")}
                  </tr>
                );
              }
              if (row.kind === "same") {
                return (
                  <tr key={index}>
                    <td className={number}>{row.old?.line}</td>
                    <td className={number}>{row.new?.line}</td>
                    <td className={merge(sign, "c:hint")} />
                    <td className={code}>{row.old?.text}</td>
                  </tr>
                );
              }
              return [
                row.old && (
                  <tr key={`${index}-old`}>
                    <td className={merge(number, "bg:red/10")}>{row.old.line}</td>
                    <td className={merge(number, "bg:red/10")} />
                    <td className={merge(sign, "bg:red/10 c:red-6")}>-</td>
                    <td className={merge(code, "bg:red/10")}>{row.old.text}</td>
                  </tr>
                ),
                row.new && (
                  <tr key={`${index}-new`}>
                    <td className={merge(number, "bg:green/10")} />
                    <td className={merge(number, "bg:green/10")}>{row.new.line}</td>
                    <td className={merge(sign, "bg:green/10 c:green-6")}>+</td>
                    <td className={merge(code, "bg:green/10")}>{row.new.text}</td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </Scroll>
    </div>
  );
}
