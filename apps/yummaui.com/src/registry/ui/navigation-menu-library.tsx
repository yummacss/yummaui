"use client";

import {
  IconArchive,
  IconClock,
  IconFile,
  IconPhoto,
  IconStar,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import NavigationMenu from "./navigation-menu";

export default function NavigationMenuLibrary({ container }: { container?: HTMLElement | null }) {
  return (
    <NavigationMenu
      container={container}
      items={[
        {
          label: "Files",
          links: [
            { title: "Recent", href: "/files/recent", description: "What you opened this week.", icon: <IconClock className="w:4 h:4" /> },
            { title: "Starred", href: "/files/starred", description: "The files you keep coming back to.", icon: <IconStar className="w:4 h:4" /> },
            { title: "Trash", href: "/files/trash", description: "Deleted files, kept for 30 days.", icon: <IconTrash className="w:4 h:4" /> },
          ],
        },
        {
          label: "Library",
          columns: 2,
          aside: (
            <>
              <span className="fs:sm fw:600">Storage</span>
              <span className="d:f h:2 g:px o:h bg:line br:9999" aria-hidden>
                <span className="h:100% bg:fill" style={{ width: "44%" }} />
                <span className="h:100% bg:fill/40" style={{ width: "19%" }} />
              </span>
              <span className="c:hint fs:xs fvn:tn">12.7 of 20 GB used</span>
            </>
          ),
          links: [
            { title: "Photos", href: "/library/photos", description: "Scans & pictures, by date.", icon: <IconPhoto className="w:4 h:4" /> },
            { title: "Videos", href: "/library/videos", description: "Clips, with the longest first.", icon: <IconVideo className="w:4 h:4" /> },
            { title: "Documents", href: "/library/documents", description: "Notes, sheets & PDFs.", icon: <IconFile className="w:4 h:4" /> },
            { title: "Archives", href: "/library/archives", description: "Zips you have not opened.", icon: <IconArchive className="w:4 h:4" /> },
          ],
        },
        { label: "Settings", href: "/settings" },
      ]}
    />
  );
}
