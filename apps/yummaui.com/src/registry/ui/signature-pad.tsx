"use client";

import { IconArrowBackUp } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import SignaturePadEngine from "signature_pad";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface SignaturePadProps {
  /**
   * Called after each stroke, undo and clear: the signature as a transparent
   * PNG, or `null` once empty.
   */
  onChange?: (png: string | null) => void;
  /** The line under the pad, until someone signs. */
  placeholder?: string;
  /** The pad's height in pixels. */
  height?: number;
  /** Names the pad for screen readers. */
  ariaLabel?: string;
  /** Turns drawing off and dims the pad. */
  disabled?: boolean;
  /** Corner radius of the pad and its buttons. Inherits the nearest `Shape`. */
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
 * A pad to sign with a pointer, a finger or a pen; the line thins as it speeds
 * up. Undo takes back one stroke.
 */
export default function SignaturePad({
  onChange,
  placeholder = "Sign above the line",
  height = 200,
  ariaLabel = "Signature",
  disabled = false,
  shape: shapeProp,
  className,
  focus = true,
}: SignaturePadProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SignaturePadEngine | null>(null);
  const report = useRef(onChange);
  report.current = onChange;
  const [strokes, setStrokes] = useState(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    // the ink is the text color, read off the canvas so a theme change reaches it
    const pad = new SignaturePadEngine(el, {
      penColor: getComputedStyle(el).color,
      minWidth: 0.8,
      maxWidth: 2.6,
    });
    engine.current = pad;
    const emit = () => {
      setStrokes(pad.toData().length);
      report.current?.(pad.isEmpty() ? null : pad.toDataURL("image/png"));
    };
    pad.addEventListener("beginStroke", () => {
      pad.penColor = getComputedStyle(el).color;
    });
    pad.addEventListener("endStroke", emit);

    // the canvas draws at the screen's density and keeps its strokes through a resize
    const fit = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = pad.toData();
      el.width = el.offsetWidth * ratio;
      el.height = el.offsetHeight * ratio;
      el.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      pad.fromData(data);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => {
      observer.disconnect();
      pad.off();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    const pad = engine.current;
    if (!pad) return;
    if (disabled) pad.off();
    else pad.on();
  }, [disabled]);

  const change = (data: ReturnType<SignaturePadEngine["toData"]>) => {
    const pad = engine.current;
    if (!pad) return;
    pad.fromData(data);
    setStrokes(data.length);
    onChange?.(pad.isEmpty() ? null : pad.toDataURL("image/png"));
  };

  const button = merge(
    outline,
    "d:f ai:c g:2 h:8 px:3 bw:1 bc:rim bg:raised bs-o:key c:label fs:sm fw:500",
    RADIUS.control[shape],
  );
  const idle = disabled || strokes === 0;

  return (
    <div className={merge("d:f fd:c g:2 w:100% c:label", className)}>
      <div
        className={merge(
          "p:r bw:1 bc:rim bg:raised bs-o:key o:h",
          RADIUS.popup[shape],
          disabled ? "o:60" : "",
        )}
        style={{ height }}
      >
        <canvas
          ref={canvas}
          role="img"
          aria-label={ariaLabel}
          className={merge("p:a i:0 w:100% h:100% ta:none c:label", disabled ? "c:na" : "c:ch")}
        />
        <span aria-hidden className="p:a l:6 r:6 b:12 btw:1 bs:d bc:rim pe:none" />
        <span aria-hidden className="p:a l:6 b:13 c:hint fs:lg pe:none">
          ×
        </span>
        {strokes === 0 && (
          <span className="p:a l:0 r:0 b:4 ta:c c:hint fs:xs pe:none">
            {placeholder}
          </span>
        )}
      </div>
      <div className="d:f g:2">
        <button
          type="button"
          disabled={idle}
          onClick={() => change(engine.current?.toData().slice(0, -1) ?? [])}
          className={merge(button, idle ? "o:50 c:d" : "c:p h:bg:well")}
        >
          <IconArrowBackUp aria-hidden className="w:4 h:4" />
          Undo
        </button>
        <button
          type="button"
          disabled={idle}
          onClick={() => change([])}
          className={merge(button, idle ? "o:50 c:d" : "c:p h:bg:well")}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
