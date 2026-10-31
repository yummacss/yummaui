"use client";

import { IconCopy, IconPencil, IconTrash } from "@tabler/icons-react";
import Tooltip from "./tooltip";

type Shape = "rounded" | "square" | "squircle" | "pill";

const BAR_SHAPES: Record<Shape, string> = {
  rounded: "br:lg",
  square: "",
  squircle: "br:xxl cs:s",
  pill: "br:9999",
};

const ACTIONS = [
  { label: "Rename", shortcut: "F2", Icon: IconPencil },
  { label: "Duplicate", shortcut: "Ctrl D", Icon: IconCopy },
  { label: "Move to Trash", shortcut: "Del", Icon: IconTrash },
];

export default function TooltipToolbar({
  shape = "rounded",
  container,
}: {
  shape?: Shape;
  container?: HTMLElement | null;
}) {
  return (
    <div
      className={`d:f g:1 p:1 bw:1 bg:raised bc:rim bs-o:key ${BAR_SHAPES[shape]}`}
    >
      {ACTIONS.map(({ label, shortcut, Icon }) => (
        <Tooltip
          key={label}
          trigger={<Icon className="w:4 h:4" />}
          triggerLabel={label}
          content={label}
          shortcut={shortcut}
          tone="dark"
          shape={shape}
          container={container}
        />
      ))}
    </div>
  );
}
