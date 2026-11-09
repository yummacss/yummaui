"use client";

import { IconArchive, IconFile, IconPhoto, IconVideo } from "@tabler/icons-react";
import ScrollArea from "./scroll-area";
import { RADIUS, useShape } from "./style";

const files = [
  { Icon: IconFile, name: "budget.xlsx", size: "24 KB" },
  { Icon: IconFile, name: "readme.md", size: "3 KB" },
  { Icon: IconPhoto, name: "scan-0412.png", size: "1.2 MB" },
  { Icon: IconPhoto, name: "beach.jpg", size: "3.4 MB" },
  { Icon: IconVideo, name: "holiday.mov", size: "860 MB" },
  { Icon: IconFile, name: "notes.txt", size: "1 KB" },
  { Icon: IconArchive, name: "receipts.zip", size: "18 MB" },
  { Icon: IconFile, name: "tax-return.pdf", size: "412 KB" },
  { Icon: IconPhoto, name: "passport.jpg", size: "2.1 MB" },
  { Icon: IconFile, name: "recipes.md", size: "6 KB" },
  { Icon: IconVideo, name: "birthday.mov", size: "1.2 GB" },
  { Icon: IconArchive, name: "old-photos.zip", size: "4.6 GB" },
  { Icon: IconFile, name: "packing-list.txt", size: "2 KB" },
  { Icon: IconPhoto, name: "wallpaper.png", size: "5.8 MB" },
];

export default function ScrollAreaFiles() {
  const shape = useShape(undefined, ["square", "rounded", "squircle"] as const);
  return (
    <div
      className={`d:f fd:c w:80 max-w:100% bg:raised bw:1 bc:rim c:label o:h ${RADIUS.popup[shape]}`}
    >
      <div className="d:f ai:b jc:sb px:4 pt:3 pb:2">
        <span className="fs:sm fw:500">Downloads</span>
        <span className="c:hint fs:xs">14 files</span>
      </div>
      <div className="h:0 btw:1 bc:line" />
      <ScrollArea shape={shape} className="h:64">
        <div className="d:f fd:c p:1 pr:3">
          {files.map(({ Icon, name, size }) => (
            <div
              key={name}
              className={`d:f ai:c g:3 h:8 px:2 fs:sm h:bg:well ${RADIUS.item[shape]}`}
            >
              <Icon className="w:4 h:4 c:label" />
              <span className="f:1">{name}</span>
              <span className="c:hint fs:xs">{size}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
