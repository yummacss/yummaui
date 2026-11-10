"use client";

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
  // words keep their place as the text grows, so only the new ones animate
  const words = text.split(/(\s+)/);
  const fade = animated ? "an:reveal adu:500 ttf:eo @prm:an:none" : "";
  const caret = (
    <span
      aria-hidden
      className="d:ib w:2 h:4 ml:1 bg:label br:sm va:m an:blink adu:1000 aic:i @prm:an:none"
    />
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
                className="d:b w:2 h:2 br:9999 bg:hint an:pulse adu:1000 aic:i @prm:an:none"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        )}
        {pending === "caret" && caret}
      </div>
    );
  }

  return (
    <div className={merge("lh:5 c:label ow:bw", className)} aria-live="polite">
      {words.map((word, index) =>
        /\s/.test(word) ? (
          word
        ) : (
          <span key={index} className={fade}>
            {word}
          </span>
        ),
      )}
      {streaming && caret}
    </div>
  );
}

// a brighter band that sweeps across the label
const SHIMMER = {
  maskImage: "linear-gradient(90deg, rgb(0 0 0 / .45) 40%, black 50%, rgb(0 0 0 / .45) 60%)",
  maskSize: "300% 100%",
} as const;
