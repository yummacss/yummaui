"use client";

import { merge } from "yummacss/merge";
import { RADIUS, useShape } from "./style";

// letters without their accents and case, one for one, so a match maps back to the text
const fold = (text: string) =>
  text
    .split("")
    .map((char) => {
      const plain = char.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
      return plain.length === 1 ? plain : char;
    })
    .join("");

function parts(text: string, query: string | string[]) {
  const needles = (Array.isArray(query) ? query : [query]).map((q) => fold(q.trim())).filter(Boolean);
  if (!needles.length) return [{ text, match: false }];
  const folded = fold(text);
  const hit = Array.from({ length: text.length }, () => false);
  for (const needle of needles) {
    let at = folded.indexOf(needle);
    while (at > -1) {
      hit.fill(true, at, at + needle.length);
      at = folded.indexOf(needle, at + needle.length);
    }
  }
  const out: { text: string; match: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = out[out.length - 1];
    if (last && last.match === hit[i]) last.text += text[i];
    else out.push({ text: text[i], match: hit[i] });
  }
  return out;
}

export interface HighlightProps {
  /** The text to show. */
  text: string;
  /**
   * What to mark: every place it appears, ignoring case and accents. Pass a
   * list to mark several words.
   */
  query: string | string[];
  /** The marks fading in as they appear. Reduced motion turns it off. */
  animated?: boolean;
  /**
   * Extra classes on the marks. `merge` folds them in last, so one here
   * replaces the component's own class for the same utility.
   */
  className?: string;
}

/** Text with the parts that match a search marked, such as in a result list. */
export default function Highlight({ text, query, animated = true, className }: HighlightProps) {
  const shape = useShape();
  const mark = merge(
    "c:current bg:yellow/35",
    RADIUS.textChip[shape],
    animated && "tp:a tdu:200 ttf:out-quart @st:bg:transparent @prm:tp:none",
    className,
  );
  return (
    <>
      {parts(text, query).map((part, index) =>
        part.match ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: the parts follow the text
          <mark key={index} className={mark}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
