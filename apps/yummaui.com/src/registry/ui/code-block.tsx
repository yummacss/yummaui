"use client";

import { Button } from "@base-ui/react/button";
import { Tabs } from "@base-ui/react/tabs";
import { IconCheck, IconCopy, IconFile } from "@tabler/icons-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

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
  /** Versions of the same snippet, one per tab, such as package managers. */
  tabs?: CodeBlockTab[];
  /** Lines to mark, counting from 1. */
  highlightLines?: number[];
  /** Numbers down the left. */
  lineNumbers?: boolean;
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
  outline,
}: {
  code: string;
  lines?: ReactNode[];
  highlightLines?: number[];
  lineNumbers: boolean;
  outline: string;
}) {
  const rows = lines ?? code.split("\n");

  return (
    // a scrolling region takes focus, so a keyboard can scroll it
    // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs to be focusable
    <pre tabIndex={0} className={merge(outline, "m:0 py:3 ox:auto")}>
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
  tabs,
  highlightLines,
  lineNumbers = true,
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
      {copied ? (
        <IconCheck aria-hidden className="w:4 h:4" />
      ) : (
        <IconCopy aria-hidden className="w:4 h:4" />
      )}
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
    RADIUS.popup[shape],
    className,
  );
  const header = "d:f ai:c jc:sb g:2 h:10 pr:2 bbw:1 bc:line";

  if (tabs?.length) {
    return (
      <Tabs.Root value={tab} onValueChange={(next) => setTab(String(next))} className={frame}>
        <div className={`${header} pl:2`}>
          <Tabs.List className="d:f ai:c g:1 min-w:0 ox:auto">
            {tabs.map((item) => (
              <Tabs.Tab
                key={item.label}
                value={item.label}
                className={(state) =>
                  merge(
                    outline,
                    "fs:0 h:7 px:3 bw:0 fw:500 us:none c:p",
                    state.active ? "bg:well c:label" : "bg:transparent c:hint h:c:label",
                    RADIUS.item[shape],
                  )
                }
              >
                <span className="fs:xs">{item.label}</span>
              </Tabs.Tab>
            ))}
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
            <IconFile aria-hidden className="w:4 h:4 c:hint" />
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
          outline={outline}
        />
      ) : (
        // without a header, copy sits beside the code rather than over it
        <div className="d:f ai:fs">
          <div className="f:1 min-w:0">
            <Lines
              code={code}
              lines={lines}
              highlightLines={highlightLines}
              lineNumbers={lineNumbers}
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
