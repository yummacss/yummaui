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
  MESSAGE_IN,
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
   * The morph between the button and the field, the button riding to the
   * field's end as its submit. Turn it off for an instant change; reduced
   * motion does the same.
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
  // the box's width follows the phase; the key inside rides its edge
  const morph = useMorph<HTMLDivElement>(phase, animated);
  const input = useRef<HTMLInputElement>(null);
  const key = useRef<HTMLButtonElement>(null);
  const returning = useRef(false);
  const open = phase === "open";
  const done = phase === "done";

  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const boxOutline = focus
    ? merge(FOCUS_WITHIN, focus === true ? "" : focus.replace(/\bfv:/g, "fw:"))
    : "";
  // closing leaves on ease-out-in; opening and the success enter on out-quart
  const motion = animated
    ? `tp:a tdu:250 ${phase === "closed" ? "ttf:eo" : "ttf:out-quart"} @prm:tp:none`
    : "";

  useEffect(() => {
    if (open) input.current?.focus();
    if (phase === "closed" && returning.current) {
      returning.current = false;
      key.current?.focus();
    }
    if (!done) return;
    const timer = setTimeout(() => setPhase("closed"), 2400);
    return () => clearTimeout(timer);
  }, [phase, open, done]);

  const close = (refocus: boolean) => {
    returning.current = refocus;
    setValue("");
    setPhase("closed");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!open || busy || !value.trim()) return;
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
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    close(true);
  };

  return (
    <div ref={morph} className={merge("d:if", open ? SIZE.width[size] : "", className)}>
      <form
        onSubmit={submit}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          const leaving = !event.currentTarget.contains(event.relatedTarget);
          if (open && leaving && !value) close(false);
        }}
        className={merge(
          "p:r d:f ai:c w:100% bw:1",
          SIZE.height[size],
          RADIUS.control[shape],
          motion,
          open
            ? merge(boxOutline, "pl:3 pr:1 bg:field bc:rim bs-o:key")
            : "p:0 bg:transparent bc:transparent",
        )}
      >
        <Input
          ref={input}
          type={type}
          value={value}
          onValueChange={setValue}
          placeholder={placeholder}
          aria-label={placeholder ?? label}
          tabIndex={open ? 0 : -1}
          aria-hidden={!open || undefined}
          className={merge(
            "min-w:0 h:100% p:0 bw:0 bg:transparent c:label os:none",
            INPUT_TEXT,
            animated ? "tp:o tdu:150 ttf:out-quart @prm:tp:none" : "",
            open ? "f:1 o:100" : "w:0 o:0 pe:none",
          )}
          style={{ transitionDelay: open && animated ? "100ms" : undefined }}
        />
        {/* one key throughout: the closed button, the submit, then the success */}
        <Button
          ref={key}
          type={open ? "submit" : "button"}
          onClick={() => phase === "closed" && setPhase("open")}
          disabled={busy}
          focusableWhenDisabled
          aria-disabled={done || undefined}
          className={merge(
            outline,
            "d:if ai:c jc:c fs:0 bw:1 fw:500 ws:nw us:none c:p",
            motion,
            open
              ? merge("bg:fill bc:edge c:on-fill bs-o:key-fill", SUBMIT[size], RADIUS.item[shape])
              : merge(SIZE.height[size], PADDING[size], RADIUS.control[shape]),
            done
              ? "bg:green-7 bc:green-7 c:white bs-o:key-fill"
              : open
                ? ""
                : "bg:raised bc:rim c:label bs-o:key h:bg:well",
            busy && "o:60",
          )}
        >
          {done ? (
            <span key="done" className={`d:if ai:c g:2 ${animated ? MESSAGE_IN : ""}`}>
              <IconCheck aria-hidden className="w:4 h:4" />
              {doneLabel}
            </span>
          ) : (
            <span key="label" className="d:if ai:c g:2">
              {icon && !open && <span aria-hidden className="d:if">{icon}</span>}
              {label}
            </span>
          )}
        </Button>
        <span role="status" className="p:a w:px h:px o:h ws:nw">
          {done ? doneLabel : ""}
        </span>
      </form>
    </div>
  );
}
