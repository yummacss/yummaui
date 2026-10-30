"use client";

import {
  IconFileTypePdf,
  IconFileTypeXls,
  IconMenu2,
  IconPhoto,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";
import Drawer from "./drawer";
import Field from "./field";
import Sidebar, { type SidebarProps } from "./sidebar";

const RECENT = [
  {
    name: "budget.xlsx",
    detail: "Edited 10 minutes ago",
    icon: <IconFileTypeXls className="w:4 h:4 c:mint" />,
  },
  {
    name: "receipts.pdf",
    detail: "Edited yesterday",
    icon: <IconFileTypePdf className="w:4 h:4 c:red" />,
  },
  {
    name: "scan.png",
    detail: "Added on Monday",
    icon: <IconPhoto className="w:4 h:4 c:mint" />,
  },
];

function Recent() {
  return (
    <div className="d:f fd:c g:2">
      <h2 className="m:0 tw:b fs:xs fw:500 c:hint">Recent</h2>
      <ul className="m:0 p:0 bw:1 bc:rim o:h">
        {RECENT.map((file) => (
          <li
            key={file.name}
            className="d:f ai:c g:3 h:12 px:3 bg:raised btw:1 bc:line fc:btw:0"
          >
            <span className="d:f fs:0 ai:c jc:c w:7 h:7 bg:well">
              {file.icon}
            </span>
            <span className="f:1 min-w:0 fs:sm fw:500 o:h to:e ws:nw">
              {file.name}
            </span>
            <span className="fs:xs c:hint ws:nw">{file.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface AppShellProps
  extends Pick<
    SidebarProps,
    | "groups"
    | "current"
    | "workspaces"
    | "onWorkspaceChange"
    | "user"
    | "onSignOut"
  > {
  /** The page heading in the top bar. */
  title?: string;
  /** Buttons at the end of the top bar. A New button stands in when unset. */
  actions?: ReactNode;
  /** The page. A list of recent files stands in when unset. */
  children?: ReactNode;
  /**
   * Where the drawer and menus are portalled. Leave unset to portal into
   * `document.body`; pass an element to keep them inside a scrolling frame.
   */
  container?: HTMLElement | null;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An app's frame: the Sidebar beside a top bar and the page. On a phone the
 * sidebar moves into a drawer the top bar opens.
 */
export default function AppShell({
  title = "My files",
  actions,
  children,
  container,
  className,
  ...sidebar
}: AppShellProps) {
  return (
    <div className={merge("d:f w:100% h:100% min-h:0 bg:field c:label", className)}>
      <Sidebar
        {...sidebar}
        container={container}
        className="d:none fs:0 @md:d:f"
      />

      <div className="d:f fd:c f:1 min-w:0">
        <header className="d:f ai:c g:3 h:12 px:4 bbw:1 bc:line @md:px:6">
          <div className="d:b @md:d:none">
            <Drawer
              container={container}
              side="left"
              title="Menu"
              showClose={false}
              trigger="Menu"
              triggerIcon={<IconMenu2 className="w:4 h:4" />}
            >
              <Sidebar
                {...sidebar}
                container={container}
                className="w:100% p:0 brw:0 bg:transparent"
              />
            </Drawer>
          </div>
          <h1 className="m:0 tw:b fs:sm fw:500 o:h to:e ws:nw">{title}</h1>
          <div className="d:none f:1 jc:c @lg:d:f">
            <Field
              aria-label="Search files"
              placeholder="Search files"
              icon={<IconSearch className="w:4 h:4" />}
              size="sm"
              className="w:100% max-w:72"
            />
          </div>
          <div className="d:f ai:c g:2 ml:auto @lg:ml:0">
            {actions ?? (
              <Button size="sm" icon={<IconPlus className="w:4 h:4" />}>
                New
              </Button>
            )}
          </div>
        </header>

        <main className="f:1 min-h:0 oy:auto p:4 @md:p:6">
          {children ?? <Recent />}
        </main>
      </div>
    </div>
  );
}
