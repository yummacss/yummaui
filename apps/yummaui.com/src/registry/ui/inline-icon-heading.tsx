"use client";

import { IconMicrophone, IconPencil, IconVideo } from "@tabler/icons-react";
import { Fragment, type ReactNode } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, type Shape, useShape } from "./style";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "fs:xxl",
  md: "fs:3xl",
  lg: "fs:4xl",
};

// each icon arrives in turn, so the eye reads the words in order
const DELAYS = ["td:200", "td:350", "td:500", "td:650", "td:800"];

/** A word in a chip, with the icon that names it and any punctuation after it. */
export interface InlineIconHeadingChip {
  label: string;
  icon: ReactNode;
  /** Text right after the chip, such as a comma, kept on its line. */
  after?: string;
}

/** The heading, in order: plain text between chips. */
export type InlineIconHeadingPart = string | InlineIconHeadingChip;

const ICON = "w:calc(.62em) h:calc(.62em)";

const PARTS: InlineIconHeadingPart[] = [
  "Everything you have",
  { label: "written", icon: <IconPencil className={ICON} />, after: "," },
  { label: "filmed", icon: <IconVideo className={ICON} /> },
  "&",
  { label: "recorded", icon: <IconMicrophone className={ICON} />, after: "," },
  "kept in one folder.",
];

export interface InlineIconHeadingProps {
  /**
   * The heading, in order: plain text, and chips that pair a word with its
   * icon.
   */
  parts?: InlineIconHeadingPart[];
  /** Text size of the whole heading; the chips scale with it. */
  size?: Size;
  /**
   * The corners of each chip & of the icon tile inside it. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
  /**
   * The icons pop in one after another as the heading first renders. Turn it
   * off for a heading that is simply there, or when the user has asked for
   * reduced motion.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

function Chip({
  icon,
  index,
  shape,
  animated,
  after,
  children,
}: {
  icon: ReactNode;
  index: number;
  shape: Shape;
  animated: boolean;
  after?: string;
  children: ReactNode;
}) {
  // the comma after a chip stays on its line
  return (
    <span className="ws:nw">
      <span
        className={`d:if ai:c g:calc(.2em) py:calc(.08em) pl:calc(.1em) pr:calc(.3em) bg:raised bs-o:key bc:rim bw:1 c:label lh:1 ws:nw va:m ${RADIUS.textChip[shape]}`}
      >
        <span
          aria-hidden
          className={`d:if ai:c jc:c w:calc(1em) h:calc(1em) bg:check bc:edge bw:1 c:on-fill bs-o:key-fill ${RADIUS.textTile[shape]} ${
            animated
              ? `tp:a tdu:500 ttf:out-back @st:s:30 @st:o:0 @st:ro:-20 @prm:tp:none ${DELAYS[index % DELAYS.length]}`
              : ""
          }`}
        >
          {icon}
        </span>
        {children}
      </span>
      {after}
    </span>
  );
}

/**
 * A centered heading whose key words each sit in a raised chip with the icon
 * that names them: a pen for written, a camera for filmed, a microphone for
 * recorded.
 */
export default function InlineIconHeading({
  parts = PARTS,
  size = "md",
  shape: shapeProp,
  animated = true,
  className,
}: InlineIconHeadingProps) {
  const shape = useShape(shapeProp);
  let chips = 0;
  return (
    <h2
      className={merge(
        "m:0 mx:auto max-w:md ta:c tw:b c:label fw:500 lh:3",
        SIZES[size],
        className,
      )}
    >
      {parts.map((part, index) => {
        const space = index > 0 ? " " : "";
        if (typeof part === "string") return `${space}${part}`;
        const order = chips++;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: position is the identity here
          <Fragment key={index}>
            {space}
            <Chip
              icon={part.icon}
              index={order}
              shape={shape}
              animated={animated}
              after={part.after}
            >
              {part.label}
            </Chip>
          </Fragment>
        );
      })}
    </h2>
  );
}
