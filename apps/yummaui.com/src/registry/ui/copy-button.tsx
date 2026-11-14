"use client";

import { Button } from "@base-ui/react/button";
import { IconCheck, IconCopy, IconX } from "@tabler/icons-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, type Size, shake, spring, useShape } from "./style";

type State = "idle" | "copied" | "failed";

const SIZES: Record<Size, string> = {
  sm: "h:8 px:3 fs:xs",
  md: "h:9 px:4 fs:sm",
  lg: "h:11 px:5 fs:md",
};

const ICON_ONLY: Record<Size, string> = {
  sm: "w:8 h:8",
  md: "w:9 h:9",
  lg: "w:11 h:11",
};

const COLOR: Record<State, string> = {
  idle: "c:label",
  copied: "c:green-7",
  failed: "c:red-7",
};

const ICON = "w:4 h:4";

// the copy of last resort, for a page the clipboard API refuses
function copyBySelection(text: string, doc: Document) {
  const area = doc.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  doc.body.append(area);
  area.select();
  let done = false;
  try {
    done = doc.execCommand("copy");
  } catch {
    done = false;
  }
  area.remove();
  return done;
}

export interface CopyButtonProps {
  /** The text a press puts on the clipboard. */
  value: string;
  /** What the button says, and its name to screen readers when `iconOnly`. */
  copyLabel?: string;
  /** What the button says once the text is on the clipboard. */
  copiedLabel?: string;
  /** What the button says when the browser will not copy. */
  failedLabel?: string;
  /**
   * Draws the icon alone, keeping `copyLabel` as the accessible name.
   */
  iconOnly?: boolean;
  /**
   * Shows `value` in a sunk field with the button at its end. When the browser
   * will not copy, the text is selected, so the keyboard can.
   */
  field?: boolean;
  /** Called with `value` once it is on the clipboard. */
  onCopy?: (value: string) => void;
  /** Height, padding and text size. */
  size?: Size;
  /**
   * Corner radius. `squircle` uses `corner-shape`, which degrades to a rounded
   * square where that is unsupported. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks copying and dims the button. */
  disabled?: boolean;
  /**
   * The icon crossing over, the word rolling and a shake on a refusal. Reduced
   * motion turns them off.
   */
  animated?: boolean;
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

/**
 * Puts text on the clipboard and says so in place: the icon turns to a check
 * and the word rolls to "Copied".
 */
export default function CopyButton({
  value,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  failedLabel = "Cannot copy",
  iconOnly = false,
  field = false,
  onCopy,
  size = "md",
  shape: shapeProp,
  disabled = false,
  animated = true,
  focus = true,
  className,
}: CopyButtonProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [state, setState] = useState<State>("idle");
  const button = useRef<HTMLButtonElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const words = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const last = useRef<State>("idle");

  useEffect(() => () => clearTimeout(timer.current), []);

  // the word leaving rolls up and out as the next one rolls in from below
  useLayoutEffect(() => {
    const box = words.current;
    const was = last.current;
    last.current = state;
    if (!box || was === state || !animated) return;
    const view = box.ownerDocument.defaultView ?? window;
    if (view.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timing = spring(420, 30);
    box.querySelector(`[data-word="${was}"]`)?.animate(
      [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }],
      { ...timing, duration: 200, easing: "ease-in" },
    );
    box.querySelector(`[data-word="${state}"]`)?.animate(
      [{ transform: "translateY(100%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
      timing,
    );
  }, [state, animated]);

  const settle = (next: State) => {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  const copy = async () => {
    const doc = button.current?.ownerDocument ?? document;
    let done = false;
    try {
      await navigator.clipboard.writeText(value);
      done = true;
    } catch {
      done = copyBySelection(value, doc);
    }
    if (done) {
      settle("copied");
      onCopy?.(value);
      return;
    }
    settle("failed");
    if (animated) shake(button.current);
    // the text selected, so the keyboard's own copy still works
    if (field && text.current) {
      const range = doc.createRange();
      range.selectNodeContents(text.current);
      const selection = doc.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const labels: Record<State, string> = { idle: copyLabel, copied: copiedLabel, failed: failedLabel };
  const glyph = {
    idle: <IconCopy className={ICON} />,
    copied: <IconCheck className={ICON} />,
    failed: <IconX className={ICON} />,
  };
  const piece = merge("d:f", animated && "tp:a tdu:200 ttf:out-quart @prm:tp:o");

  const control = (
    <Button
      ref={button}
      onClick={copy}
      disabled={disabled}
      aria-label={iconOnly ? labels[state] : undefined}
      className={merge(
        outline,
        "p:r d:if fs:0 ai:c jc:c g:2 bw:1 bg:raised bs-o:key bc:rim fw:500 us:none",
        "tdu:150 ttf:out-quart a:s:96 @prm:a:s:100",
        disabled ? "o:60 c:na" : "c:p h:bg:well",
        COLOR[state],
        iconOnly ? ICON_ONLY[size] : SIZES[size],
        // in a field the key sits inside its 1px border and 4px padding, so its corner is the field's less 5px
        field ? RADIUS.controlInset[shape] : RADIUS.control[shape],
        !field && className,
      )}
    >
      {/* three icons in one place, crossing over as the state turns */}
      <span aria-hidden className="d:g pi:c">
        {(Object.keys(glyph) as State[]).map((key) => (
          <span
            key={key}
            className={merge(piece, key === state ? "o:100 s:100 fb:0" : "o:0 s:25 fb:4")}
            style={{ gridArea: "1 / 1" }}
          >
            {glyph[key]}
          </span>
        ))}
      </span>
      {!iconOnly && (
        // every word in one cell, so the button keeps the width of the longest
        <span ref={words} aria-hidden className="d:g o:h ws:nw">
          {(Object.keys(labels) as State[]).map((key) => (
            <span key={key} data-word={key} className={key === state ? "o:100" : "o:0"} style={{ gridArea: "1 / 1" }}>
              {labels[key]}
            </span>
          ))}
        </span>
      )}
      {!iconOnly && <span className="p:a w:px h:px o:h ws:nw">{copyLabel}</span>}
    </Button>
  );

  const status = (
    <span aria-live="polite" className="p:a w:px h:px o:h">
      {state === "copied" ? copiedLabel : state === "failed" ? failedLabel : ""}
    </span>
  );

  if (!field) {
    return (
      <>
        {control}
        {status}
      </>
    );
  }

  return (
    <div
      className={merge(
        "d:f ai:c g:2 min-w:0 py:1 pr:1 pl:3 bw:1 bc:rim bg:field bs-o:sunk",
        RADIUS.control[shape],
        className,
      )}
    >
      <span ref={text} className="f:1 min-w:0 ff:m fs:sm c:label ws:nw o:h to:e">
        {value}
      </span>
      {control}
      {status}
    </div>
  );
}
