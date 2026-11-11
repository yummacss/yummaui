"use client";

import { Button } from "@base-ui/react/button";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { Tabs } from "@base-ui/react/tabs";
import { IconCheck, IconCopy, IconFile } from "@tabler/icons-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, Swap, useShape } from "./style";

export interface CodeBlockTab {
  /** The tab's name, such as a package manager or a file. */
  label: string;
  /** The tab's text, as Copy puts it on the clipboard. */
  code: string;
  /** The tab's lines from your highlighter, one node per line. */
  lines?: ReactNode[];
}

export interface CodeBlockProps {
  /** The text to show, and what Copy puts on the clipboard. */
  code?: string;
  /**
   * The same text from your highlighter, one node per line. Without it the
   * lines show plain.
   */
  lines?: ReactNode[];
  /** A file name in the header, beside a file icon. */
  title?: string;
  /** A glyph before `title`, in place of the file icon. */
  icon?: ReactNode;
  /** Versions of the same snippet, one per tab, such as package managers. */
  tabs?: CodeBlockTab[];
  /** Lines to mark, counting from 1. */
  highlightLines?: number[];
  /** Numbers down the left. */
  lineNumbers?: boolean;
  /**
   * How many lines show before the block scrolls. Shift and the wheel scroll it
   * sideways.
   */
  maxLines?: number;
  /**
   * Takes its container's height and scrolls inside it, in place of `maxLines`.
   */
  fill?: boolean;
  /**
   * The scrollbars fading in while you scroll or hover. Turn it off to keep
   * them shown; reduced motion does the same.
   */
  animated?: boolean;
  /** What the copy button says. */
  copyLabel?: string;
  /** What the copy button says for a moment once it has copied. */
  copiedLabel?: string;
  /**
   * Corner radius of the block and its buttons. Inherits the nearest `Shape`.
   */
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

function Lines({
  code,
  lines,
  highlightLines = [],
  lineNumbers,
  maxLines,
  fill,
  animated,
  outline,
}: {
  code: string;
  lines?: ReactNode[];
  highlightLines?: number[];
  lineNumbers: boolean;
  maxLines: number;
  fill: boolean;
  animated: boolean;
  outline: string;
}) {
  const rows = lines ?? code.split("\n");

  const fade = animated
    ? "o:0 tp:o tdu:200 ttf:io hovering:o:100 scrolling:o:100 scrolling:tdu:0 @prm:tp:none"
    : "o:100";

  return (
    <ScrollArea.Root className={fill ? "p:r d:f fd:c f:1 min-h:0" : "p:r"}>
      {/* iOS enlarges text in wide scrolling blocks unless told not to; tabs indent two columns */}
      <ScrollArea.Viewport
        tabIndex={0}
        className={merge(outline, "ob:c", fill && "f:1 min-h:0")}
        style={{
          // each line is 1.25rem, plus the block's 1.5rem of padding
          maxHeight: fill ? undefined : `calc(${maxLines} * 1.25rem + 1.5rem)`,
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
          tabSize: 2,
        }}
      >
        <pre className="m:0 py:3">
          <code className="d:b w:fc min-w:100% ff:m fs:xs lh:5">
            {rows.map((line, index) => {
              const marked = highlightLines.includes(index + 1);
              return (
                <span
                  key={index}
                  className={`d:b pl:4 pr:6 blw:2 ${marked ? "bc:label bg:well" : "bc:transparent"}`}
                >
                  {lineNumbers && (
                    <span aria-hidden className="d:ib w:6 mr:3 c:hint ta:r us:none">
                      {index + 1}
                    </span>
                  )}
                  {line === "" ? "​" : line}
                </span>
              );
            })}
          </code>
        </pre>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className={merge("d:f jc:c w:2 py:1", fade)}
      >
        <ScrollArea.Thumb className="w:1 br:9999 bg:hint/50" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar
        orientation="horizontal"
        className={merge("d:f fd:c jc:c h:2 px:1", fade)}
      >
        <ScrollArea.Thumb className="h:1 br:9999 bg:hint/50" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

/**
 * Code in a raised card with a file name or tabs, a copy button and marked
 * lines; your highlighter fills the lines.
 */
export default function CodeBlock({
  code = "",
  lines,
  title,
  icon,
  tabs,
  highlightLines,
  lineNumbers = true,
  maxLines = 20,
  fill = false,
  animated = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  shape: shapeProp,
  focus = true,
  className,
}: CodeBlockProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [tab, setTab] = useState(tabs?.[0]?.label ?? "");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const current = tabs?.find((item) => item.label === tab) ?? tabs?.[0];
  const text = current ? current.code : code;

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const copyButton = (
    <Button
      onClick={copy}
      className={merge(
        outline,
        "d:f fs:0 ai:c g:1 h:7 px:2 bw:1 bg:raised bs-o:key bc:rim fw:500 us:none c:p h:bg:well",
        copied ? "c:green-7" : "c:label",
        RADIUS.item[shape],
      )}
    >
      <Swap swapped={copied} from={<IconCopy className="w:4 h:4" />} to={<IconCheck className="w:4 h:4" />} />
      <span className="fs:xs">{copied ? copiedLabel : copyLabel}</span>
    </Button>
  );

  const status = (
    <span aria-live="polite" className="p:a w:px h:px o:h">
      {copied ? copiedLabel : ""}
    </span>
  );

  const frame = merge(
    "p:r min-w:0 o:h bw:1 bc:rim bg:raised bs-o:key c:label",
    fill && "d:f fd:c f:1 min-h:0",
    RADIUS.popup[shape],
    className,
  );
  const header = "d:f ai:c jc:sb g:2 h:10 pr:2 bbw:1 bc:line";

  if (tabs?.length) {
    return (
      <Tabs.Root value={tab} onValueChange={(next) => setTab(String(next))} className={frame}>
        <div className={`${header} pl:2`}>
          {/* the same well and sliding key as Tabs */}
          <Tabs.List
            className={merge("d:f p:r min-w:0 bg:well bs-o:sunk", RADIUS.bar[shape])}
          >
            {tabs.map((item) => (
              <Tabs.Tab
                key={item.label}
                value={item.label}
                className={(state) =>
                  merge(
                    outline,
                    "p:r zi:10 d:f ai:c fs:0 py:1 px:2 bw:0 bg:transparent fw:500 us:none c:p",
                    state.active ? "c:label" : "c:hint h:c:label",
                    RADIUS.control[shape],
                  )
                }
              >
                <span className="fs:xs">{item.label}</span>
              </Tabs.Tab>
            ))}
            <Tabs.Indicator
              className={merge(
                "p:a l:0 t:0 zi:0 bg:raised bs-o:key bw:1 bc:rim tp:a tdu:300 ttf:out-quart @prm:tp:none",
                RADIUS.control[shape],
              )}
              style={{
                translate: "var(--active-tab-left) var(--active-tab-top)",
                width: "var(--active-tab-width)",
                height: "var(--active-tab-height)",
              }}
            />
          </Tabs.List>
          {copyButton}
        </div>
        {tabs.map((item) => (
          <Tabs.Panel key={item.label} value={item.label}>
            <Lines
              code={item.code}
              lines={item.lines}
              highlightLines={highlightLines}
              lineNumbers={lineNumbers}
              maxLines={maxLines}
              fill={fill}
              animated={animated}
              outline={outline}
            />
          </Tabs.Panel>
        ))}
        {status}
      </Tabs.Root>
    );
  }

  return (
    <div className={frame}>
      {title ? (
        <div className={`${header} pl:4`}>
          <span className="d:f ai:c g:2 min-w:0 fs:sm fw:500">
            {icon ?? <IconFile aria-hidden className="w:4 h:4 c:hint" />}
            <span className="o:h to:e ws:nw">{title}</span>
          </span>
          {copyButton}
        </div>
      ) : null}
      {title ? (
        <Lines
          code={code}
          lines={lines}
          highlightLines={highlightLines}
          lineNumbers={lineNumbers}
          maxLines={maxLines}
          fill={fill}
          animated={animated}
          outline={outline}
        />
      ) : (
        // without a header, copy sits beside the code rather than over it
        <div className={fill ? "d:f f:1 min-h:0" : "d:f ai:fs"}>
          <div className={fill ? "d:f fd:c f:1 min-w:0" : "f:1 min-w:0"}>
            <Lines
              code={code}
              lines={lines}
              highlightLines={highlightLines}
              lineNumbers={lineNumbers}
              maxLines={maxLines}
              fill={fill}
              animated={animated}
              outline={outline}
            />
          </div>
          <div className="fs:0 pt:2 pr:2">{copyButton}</div>
        </div>
      )}
      {status}
    </div>
  );
}
