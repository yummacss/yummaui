"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { IconCheck } from "@tabler/icons-react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { merge } from "yummacss/merge";
import {
  FOCUS,
  FOCUS_WITHIN,
  INPUT_TEXT,
  RADIUS,
  type Shape,
  type Size,
  SIZE,
  useMorph,
  useShape,
} from "./style";

type Phase = "closed" | "open" | "done";

const PADDING: Record<Size, string> = {
  sm: "px:3 g:1 fs:xs",
  md: "px:4 g:2 fs:sm",
  lg: "px:5 g:2 fs:md",
};

// the submit sits inside the field, one step shorter
const SUBMIT: Record<Size, string> = {
  sm: "h:6 px:2 fs:xs",
  md: "h:7 px:3 fs:sm",
  lg: "h:9 px:4 fs:sm",
};

export interface ExpandingInputProps {
  /** What the button says, and the submit inside the open field. */
  label: string;
  /** A glyph before the label on the closed button. */
  icon?: ReactNode;
  /** The field's placeholder once it opens. */
  placeholder?: string;
  /** The kind of value, so the keyboard and the browser's checks fit it. */
  type?: "text" | "email" | "url" | "tel";
  /**
   * Called with the value on submit. While a promise it returns is pending the
   * submit waits; once it settles the done line shows.
   */
  onSubmit?: (value: string) => void | Promise<void>;
  /** What shows for a moment after a submit, before the button returns. */
  doneLabel?: string;
  /** Height of the button and the field. */
  size?: Size;
  /** Corner radius. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The width easing between the button and the field. Turn it off for an
   * instant change; reduced motion does the same.
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
 * A button that opens into a field where it sits, the button riding along as
 * its submit. Escape, or leaving it empty, closes it again.
 */
export default function ExpandingInput({
  label,
  icon,
  placeholder,
  type = "text",
  onSubmit,
  doneLabel = "Done",
  size = "md",
  shape: shapeProp,
  animated = true,
  focus = true,
  className,
}: ExpandingInputProps) {
  const shape = useShape(shapeProp);
  const [phase, setPhase] = useState<Phase>("closed");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const morph = useMorph<HTMLDivElement>(phase === "open", animated);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const returning = useRef(false);

  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const boxOutline = focus
    ? merge(FOCUS_WITHIN, focus === true ? "" : focus.replace(/\bfv:/g, "fw:"))
    : "";

  useEffect(() => {
    if (phase === "open") input.current?.focus();
    if (phase === "closed" && returning.current) {
      returning.current = false;
      trigger.current?.focus();
    }
    if (phase !== "done") return;
    const timer = setTimeout(() => setPhase("closed"), 2400);
    return () => clearTimeout(timer);
  }, [phase]);

  const close = (refocus: boolean) => {
    returning.current = refocus;
    setValue("");
    setPhase("closed");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !value.trim()) return;
    setBusy(true);
    try {
      await onSubmit?.(value.trim());
      setValue("");
      setPhase("done");
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close(true);
  };

  return (
    <div ref={morph} className={merge("d:if", className)}>
      {phase === "closed" && (
        <Button
          ref={trigger}
          onClick={() => setPhase("open")}
          className={merge(
            outline,
            "d:if ai:c jc:c bw:1 bg:raised bs-o:key bc:rim c:label fw:500 ws:nw us:none c:p h:bg:well",
            SIZE.height[size],
            PADDING[size],
            RADIUS.control[shape],
          )}
        >
          {icon}
          {label}
        </Button>
      )}

      {phase === "open" && (
        <form
          onSubmit={submit}
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            const leaving = !event.currentTarget.contains(event.relatedTarget);
            if (leaving && !value) close(false);
          }}
          className={merge(
            boxOutline,
            "d:f ai:c g:2 pl:3 pr:1 bw:1 bg:field bs-o:key bc:rim",
            INPUT_TEXT,
            SIZE.height[size],
            SIZE.width[size],
            RADIUS.control[shape],
          )}
        >
          <Input
            ref={input}
            type={type}
            value={value}
            onValueChange={setValue}
            placeholder={placeholder}
            aria-label={placeholder ?? label}
            className="f:1 min-w:0 h:100% p:0 bw:0 bg:transparent c:label os:none"
          />
          <Button
            type="submit"
            disabled={busy}
            focusableWhenDisabled
            className={merge(
              outline,
              "d:if ai:c jc:c fs:0 bw:1 bg:fill bc:edge c:on-fill bs-o:key-fill fw:500 ws:nw us:none c:p",
              SUBMIT[size],
              RADIUS.item[shape],
              busy && "o:60",
            )}
          >
            {label}
          </Button>
        </form>
      )}

      {phase === "done" && (
        <span
          role="status"
          className={merge(
            "d:if ai:c jc:c c:green-7 fw:500 ws:nw",
            SIZE.height[size],
            PADDING[size],
          )}
        >
          <IconCheck aria-hidden className="w:4 h:4" />
          {doneLabel}
        </span>
      )}
    </div>
  );
}
