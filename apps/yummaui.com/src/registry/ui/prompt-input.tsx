"use client";

import {
  IconArrowUp,
  IconFileText,
  IconPlayerStop,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";
import { FOCUS_WITHIN, INPUT_TEXT, RADIUS, type Shape, useShape } from "./style";

export interface PromptSubmission {
  /** What was typed. */
  text: string;
  /** The files attached. */
  files: File[];
}

export interface PromptInputProps {
  /** Called with the message and its files on Send or Enter. */
  onSubmit?: (submission: PromptSubmission) => void;
  /** An answer is arriving: Send turns into Stop. */
  streaming?: boolean;
  /** Called from Stop while `streaming`. */
  onStop?: () => void;
  /** Drawn before Send, such as a Model Picker. */
  children?: ReactNode;
  /** The empty field's hint. */
  placeholder?: string;
  /** Starting text. */
  defaultValue?: string;
  /**
   * Corner radius of the field and its buttons. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Turns the whole input off. */
  disabled?: boolean;
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
 * Where a message is written: a field that grows, attached files, and Send that
 * turns into Stop.
 */
export default function PromptInput({
  onSubmit,
  streaming = false,
  onStop,
  children,
  placeholder = "Ask anything",
  defaultValue = "",
  shape: shapeProp,
  disabled = false,
  className,
  focus = true,
}: PromptInputProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS_WITHIN, focus === true ? "" : focus) : "";
  const [text, setText] = useState(defaultValue);
  const [files, setFiles] = useState<File[]>([]);
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  // the field grows with its text, up to a limit
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const submit = () => {
    if (!text.trim() || streaming || disabled) return;
    onSubmit?.({ text: text.trim(), files });
    setText("");
    setFiles([]);
  };

  return (
    <div
      className={merge(
        "d:f fd:c g:2 w:100% p:2 bw:1 bc:rim bg:field bs-o:sunk c:label",
        outline,
        RADIUS.box[shape],
        disabled ? "o:60" : "",
        className,
      )}
    >
      {files.length > 0 && (
        <div className="d:f fw:w g:2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className={merge("d:if ai:c g:2 h:9 pl:2 pr:1 bw:1 bc:rim bg:raised bs-o:key fs:xs", RADIUS.control[shape])}
            >
              <IconFileText aria-hidden className="w:4 h:4 c:hint" />
              <span className="max-w:40 o:h to:e ws:nw">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Remove ${file.name}`}
                icon={<IconX className="w:3 h:3" />}
                onClick={() => setFiles(files.filter((_, at) => at !== index))}
                focus={focus}
              />
            </span>
          ))}
        </div>
      )}
        <textarea
          ref={field}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          className={merge("w:100% px:2 py:1 bw:0 bg:transparent c:label lh:4 os:none ow:0 r:none", INPUT_TEXT)}
        />
      <div className="d:f ai:c g:2">
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              setFiles([...files, ...Array.from(event.target.files ?? [])]);
              event.target.value = "";
            }}
          />
          <Button variant="secondary" size="sm" iconOnly aria-label="Attach a file" icon={<IconPlus className="w:4 h:4" />} onClick={() => picker.current?.click()} shape={shape} disabled={disabled} focus={focus} />
          <span className="d:f jc:fe f:1 min-w:0">{children}</span>
          {streaming ? (
            <Button variant="primary" size="sm" iconOnly aria-label="Stop" icon={<IconPlayerStop className="w:4 h:4" />} onClick={onStop} shape={shape} focus={focus} />
          ) : (
            <Button variant="primary" size="sm" iconOnly aria-label="Send" icon={<IconArrowUp className="w:4 h:4" />} onClick={submit} disabled={disabled || !text.trim()} shape={shape} focus={focus} />
          )}
      </div>
    </div>
  );
}
