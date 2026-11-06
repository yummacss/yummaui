"use client";

import { IconCloud } from "@tabler/icons-react";
import { useState } from "react";
import Sidebar from "./sidebar";
import { RADIUS, type Shape, useShape } from "./style";

const PAGES: Record<string, string> = {
  "#home": "Home",
  "#files": "My files",
  "#photos": "Photos",
  "#starred": "Starred",
  "#shared": "Shared with me",
  "#people": "People",
  "#trash": "Trash",
  "#settings": "Settings",
};

export default function SidebarPages({
  shape: shapeProp,
  container,
}: {
  shape?: Shape;
  container?: HTMLElement | null;
}) {
  const shape = useShape(shapeProp);
  const [page, setPage] = useState("#files");

  return (
    <div className="d:f w:100% h:100%">
      <Sidebar
        brand={{ name: "Drive", logo: <IconCloud className="w:4 h:4" /> }}
        current={page}
        onNavigate={setPage}
        shape={shape}
        container={container}
      />
      <div
        className={`d:f f:1 ai:c jc:c m:4 bw:2 bs:d bc:rim c:hint fs:sm us:none ${RADIUS.popup[shape]}`}
      >
        {PAGES[page] ?? "Page"} content
      </div>
    </div>
  );
}
