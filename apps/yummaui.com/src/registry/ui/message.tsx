"use client";

import { IconCheck, IconCopy, IconRefresh, IconThumbUp } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";
import { RADIUS, type Shape, useShape } from "./style";

export interface MessageProps {
  /**
   * Who wrote it: the person's turn sits on the right in a raised bubble, the
   * assistant's on the left as plain text.
   */
  from?: "user" | "assistant";
  /** The message. */
  children: ReactNode;
  /** A name over an assistant's message. */
  name?: string;
  /** A small mark beside the name, such as the model's. */
  avatar?: ReactNode;
  /** The text Copy puts on the clipboard. Without it there is no Copy. */
  copyText?: string;
  /** Adds Retry under an assistant's message. */
  onRetry?: () => void;
  /**
   * Adds a thumbs up under an assistant's message, called with its new state.
   */
  onFeedback?: (good: boolean) => void;
  /**
   * Corner radius of the bubble and the action buttons. Inherits the nearest
   * `Shape`.
   */
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
 * One turn of a conversation: the person's in a raised bubble on the right, the
 * assistant's as text on the left with Copy, Retry and a thumbs up.
 */
export default function Message({
  from = "assistant",
  children,
  name,
  avatar,
  copyText,
  onRetry,
  onFeedback,
  shape: shapeProp,
  className,
  focus = true,
}: MessageProps) {
  const shape = useShape(shapeProp);
  const [copied, setCopied] = useState(false);
  const [good, setGood] = useState(false);

  if (from === "user") {
    return (
      <div className={merge("d:f jc:fe w:100%", className)}>
        <div className={merge("max-w:80% px:3 py:2 bw:1 bc:rim bg:raised bs-o:key c:label lh:4 ow:bw", RADIUS.popup[shape])}>
          {children}
        </div>
      </div>
    );
  }

  const actions = copyText !== undefined || onRetry || onFeedback;

  return (
    <div className={merge("d:f fd:c g:2 w:100% c:label", className)}>
      {(name || avatar) && (
        <span className="d:f ai:c g:2 c:hint fs:xs">
          {avatar}
          {name}
        </span>
      )}
      <div className="lh:5 ow:bw">{children}</div>
      {actions && (
        <div role="toolbar" aria-label="Message actions" className="d:f g:1">
          {copyText !== undefined && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={copied ? "Copied" : "Copy"}
              icon={copied ? <IconCheck className="w:4 h:4" /> : <IconCopy className="w:4 h:4" />}
              onClick={() => {
                void navigator.clipboard?.writeText(copyText).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              shape={shape}
              focus={focus}
            />
          )}
          {onRetry && (
            <Button variant="ghost" size="sm" iconOnly aria-label="Retry" icon={<IconRefresh className="w:4 h:4" />} onClick={onRetry} shape={shape} focus={focus} />
          )}
          {onFeedback && (
            <Button
              variant={good ? "subtle" : "ghost"}
              size="sm"
              iconOnly
              aria-label="Good answer"
              icon={<IconThumbUp className="w:4 h:4" />}
              onClick={() => {
                setGood(!good);
                onFeedback(!good);
              }}
              shape={shape}
              focus={focus}
            />
          )}
        </div>
      )}
    </div>
  );
}
