"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { IconAlertTriangle, IconCheck, IconChevronRight, IconLoader2, IconTool } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

type State = "running" | "done" | "failed";

export interface ToolCallProps {
  /** The tool's name, such as `search_files`. */
  name: string;
  /** What it was asked, in a few words, beside the name. */
  summary?: string;
  /** Where it is: running, done or failed. */
  state?: "running" | "done" | "failed";
  /** What it was given, shown when the card is open. */
  input?: string;
  /** What it gave back, or the error, shown when the card is open. */
  output?: string;
  /** A glyph for the tool. */
  icon?: ReactNode;
  /** Open on its input and output at the start. */
  defaultOpen?: boolean;
  /** Corner radius of the card. Inherits the nearest `Shape`. */
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

const STATES: Record<State, { label: string; icon: ReactNode; tone: string }> = {
  running: { label: "Running", icon: <IconLoader2 aria-hidden className="w:4 h:4 an:spin adu:700 atf:l aic:i @prm:an:none" />, tone: "c:hint" },
  done: { label: "Done", icon: <IconCheck aria-hidden className="w:4 h:4" />, tone: "c:hint" },
  failed: { label: "Failed", icon: <IconAlertTriangle aria-hidden className="w:4 h:4" />, tone: "c:red" },
};

/**
 * One call the model made to a tool: its name, what it was asked and where it
 * is, opening to the input and the output.
 */
export default function ToolCall({
  name,
  summary,
  state = "done",
  input,
  output,
  icon,
  defaultOpen = false,
  shape: shapeProp,
  className,
  focus = true,
}: ToolCallProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const status = STATES[state];
  const [open, setOpen] = useState(defaultOpen);
  const block = merge("m:0 px:3 py:2 bg:well bs-o:sunk ff:m fs:xs lh:4 ox:auto ws:p", RADIUS.block[shape]);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={merge("w:100% bw:1 bc:rim bg:raised bs-o:key o:h c:label", RADIUS.popup[shape], className)}
    >
      <Collapsible.Trigger
        className={merge(outline, "d:f ai:c g:3 w:100% px:3 py:2 bw:0 bg:transparent ta:l c:p", RADIUS.popup[shape])}
      >
        <span className={merge("d:f ai:c jc:c w:6 h:6 fs:0 bg:well bs-o:sunk c:hint", RADIUS.chip[shape])}>
          {icon ?? <IconTool aria-hidden className="w:4 h:4" />}
        </span>
        <span className="ff:m fs:xs fw:500">{name}</span>
        <span className="f:1 min-w:0 o:h to:e ws:nw c:hint fs:sm">{summary}</span>
        <span className={merge("d:f ai:c g:1 fs:xs", status.tone)}>
          {status.icon}
          {status.label}
        </span>
        <IconChevronRight aria-hidden className={merge("w:4 h:4 c:hint tp:t tdu:150 @prm:tp:none", open ? "ro:18" : "")} />
      </Collapsible.Trigger>
      <Collapsible.Panel className="o:h h:var(--collapsible-panel-height) tp:a tdu:200 ttf:out-quart opening:h:0 closing:h:0 @prm:tp:none">
        <div className="d:f fd:c g:2 px:3 pt:2 pb:3 btw:1 bc:line">
          {input && (
            <>
              <span className="ff:m fs:xs c:hint">Input</span>
              <pre className={block}>{input}</pre>
            </>
          )}
          {output && (
            <>
              <span className="ff:m fs:xs c:hint">{state === "failed" ? "Error" : "Output"}</span>
              <pre className={block}>{output}</pre>
            </>
          )}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
