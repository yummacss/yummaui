"use client";

import { IconCopy, IconPencil, IconTrash } from "@tabler/icons-react";
import Tooltip from "./tooltip";
import { RADIUS, useShape, type Shape } from "./style";

const ACTIONS = [
  { label: "Rename", shortcut: "F2", Icon: IconPencil },
  { label: "Duplicate", shortcut: "Ctrl D", Icon: IconCopy },
  { label: "Move to Trash", shortcut: "Del", Icon: IconTrash },
];

export default function TooltipToolbar({
  shape: shapeProp,
  container,
}: {
  shape?: Shape;
  container?: HTMLElement | null;
}) {
  const shape = useShape(shapeProp);
  return (
    <div
      className={`d:f g:1 p:1 bw:1 bg:raised bc:rim bs-o:key ${RADIUS.bar[shape]}`}
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
