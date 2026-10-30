"use client";

import { IconPaletteFilled } from "@tabler/icons-react";
import { useState } from "react";
import Button from "./button";
import Popover from "./popover";

const COLORS = [
  { name: "Yellow", swatch: "bg:yellow h:bg:yellow", ink: "c:yellow" },
  { name: "Pink", swatch: "bg:pink h:bg:pink", ink: "c:pink" },
  { name: "Violet", swatch: "bg:violet h:bg:violet", ink: "c:violet" },
  { name: "Blue", swatch: "bg:blue h:bg:blue", ink: "c:blue" },
  { name: "Mint", swatch: "bg:mint h:bg:mint", ink: "c:mint" },
  { name: "Slate", swatch: "bg:slate h:bg:slate", ink: "c:slate" },
];

export default function PopoverFolderColor({
  container,
}: {
  container?: HTMLElement | null;
}) {
  const [color, setColor] = useState(COLORS[0]);

  return (
    <Popover
      trigger={<IconPaletteFilled className={`w:4 h:4 ${color.ink}`} />}
      triggerLabel="Folder color"
      triggerVariant="label"
      title="Taxes"
      container={container}
    >
      <div className="d:f g:2 pt:1">
        {COLORS.map((entry) => {
          const picked = entry.name === color.name;
          return (
            <Button
              key={entry.name}
              aria-label={entry.name}
              aria-pressed={picked}
              onClick={() => setColor(entry)}
              className={`w:6 h:6 p:0 br:9999 bw:1 bc:black/15 bs-o:none ${entry.swatch} ${
                picked ? "os:s ow:2 oo:2 oc:label" : ""
              }`}
            />
          );
        })}
      </div>
    </Popover>
  );
}
