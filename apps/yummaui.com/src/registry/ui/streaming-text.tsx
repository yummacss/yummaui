"use client";

import { useRef, type CSSProperties } from "react";
import { merge } from "yummacss/merge";

export interface StreamingTextProps {
  /** The text so far. Each new word fades in as the text grows. */
  text: string;
  /**
   * Still arriving: draws a caret after the last word, or the waiting line
   * before the first.
   */
  streaming?: boolean;
  /** What shows before the first word arrives. */
  pending?: "shimmer" | "dots" | "caret";
  /** The waiting line's words, for `shimmer`. */
  pendingLabel?: string;
  /**
   * The words' fade. Turn it off for text that appears at once, or when the
   * user has asked for reduced motion.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An answer as it arrives: each new word fades and sharpens in, with a caret
 * while it streams and a waiting line before the first word.
 */
export default function StreamingText({
  text,
  streaming = false,
  pending = "shimmer",
  pendingLabel = "Generating",
  animated = true,
  className,
}: StreamingTextProps) {
  // words keep their place as the text grows; ones that arrive together reveal one after another
  const words = text.split(/(\s+)/);
  const delays = useRef<number[]>([]);
  const count = words.filter((word) => word && !/\s/.test(word)).length;
  if (count < delays.current.length) delays.current = [];
  for (let at = delays.current.length, step = 0; at < count; at++, step++) {
    delays.current.push(step * STEP);
  }
  const last = delays.current[count - 1] ?? 0;
  const fade = animated ? "an:reveal adu:400 ttf:eo @prm:an:none" : "";
  const caret = (delay: number) => (
    <span aria-hidden className={merge(fade, "ad:var(--delay)")} style={{ "--delay": `${delay}ms`, animationFillMode: "backwards" } as CSSProperties}>
      <span className="d:ib w:calc(2px) h:calc(1.15em) ml:px va:tb bg:label br:9999 an:blink adu:1000 aic:i @prm:an:none" />
    </span>
  );

  if (!text && streaming) {
    return (
      <div className={merge("c:hint lh:5", className)} role="status">
        {pending === "shimmer" && (
          <span className="c:label an:shimmer adu:1000 atf:l aic:i @prm:an:none" style={SHIMMER}>
            {pendingLabel}
          </span>
        )}
        {pending === "dots" && (
          <span className="d:if ai:c g:1" aria-label={pendingLabel}>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="d:b w:2 h:2 br:9999 bg:hint an:pulse adu:1000 aic:i ad:var(--delay) @prm:an:none"
                style={{ "--delay": `${delay}ms` } as CSSProperties}
              />
            ))}
          </span>
        )}
        {pending === "caret" && caret(0)}
      </div>
    );
  }

  return (
    <div className={merge("lh:5 c:label ow:bw", className)} aria-live="polite">
      {(() => {
        let nth = 0;
        return words.map((word, index) => {
          if (!word || /\s/.test(word)) return word;
          const delay = delays.current[nth++] ?? 0;
          return (
            <span key={index} className={merge(fade, "ad:var(--delay)")} style={{ "--delay": `${delay}ms`, animationFillMode: "backwards" } as CSSProperties}>
              {word}
            </span>
          );
        });
      })()}
      {streaming && caret(last + 120)}
    </div>
  );
}

// milliseconds between words that arrive together
const STEP = 45;

// a brighter band that sweeps across the label
const SHIMMER = {
  maskImage: "linear-gradient(90deg, rgb(0 0 0 / .45) 40%, black 50%, rgb(0 0 0 / .45) 60%)",
  maskSize: "300% 100%",
} as const;
