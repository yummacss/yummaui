"use client";

import {
  IconChevronDown,
  IconFolder,
  IconHome,
  IconPhoto,
  IconSelector,
  IconSettings,
  IconShare,
  IconStar,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import Avatar from "./avatar";
import Badge from "./badge";
import Menu from "./menu";

export interface SidebarLink {
  label: string;
  href: string;
  icon?: ReactNode;
  /** A count or word beside the label, such as unread items. */
  badge?: string | number;
}

export interface SidebarGroup {
  /** A heading over the group. The first group usually has none. */
  label?: string;
  links: SidebarLink[];
}

export interface SidebarWorkspace {
  name: string;
  /** A line under the name, such as the space it uses. */
  detail?: string;
}

const ICON = "w:4 h:4";

type Shape = "rounded" | "square" | "squircle" | "pill";

const LINK_SHAPES: Record<Shape, string> = {
  rounded: "br:md",
  square: "",
  squircle: "br:lg cs:s",
  pill: "br:9999",
};

// the workspace's letter tile; a pill sidebar gives it a circle
const TILE_SHAPES: Record<Shape, string> = {
  rounded: "br:sm",
  square: "",
  squircle: "br:md cs:s",
  pill: "br:9999",
};

const GROUPS: SidebarGroup[] = [
  {
    links: [
      { label: "Home", href: "#home", icon: <IconHome className={ICON} /> },
      { label: "My files", href: "#files", icon: <IconFolder className={ICON} /> },
      { label: "Photos", href: "#photos", icon: <IconPhoto className={ICON} /> },
      { label: "Starred", href: "#starred", icon: <IconStar className={ICON} /> },
    ],
  },
  {
    label: "Sharing",
    links: [
      {
        label: "Shared with me",
        href: "#shared",
        icon: <IconShare className={ICON} />,
        badge: 3,
      },
      { label: "People", href: "#people", icon: <IconUsers className={ICON} /> },
    ],
  },
  {
    links: [
      { label: "Trash", href: "#trash", icon: <IconTrash className={ICON} /> },
      { label: "Settings", href: "#settings", icon: <IconSettings className={ICON} /> },
    ],
  },
];

const WORKSPACES: SidebarWorkspace[] = [
  { name: "My library", detail: "12.4 GB of 50 GB" },
  { name: "Archive", detail: "External drive" },
];

const LINK =
  "d:f ai:c g:2 h:8 px:2 fs:sm td:none c:hint tp:c tdu:100 h:bg:well h:c:label ow:0 oc:focus/40 fv:os:s fv:ow:2 fv:oo:0";
const CURRENT = "bg:well c:label fw:500";

export interface SidebarProps {
  /** The navigation, in groups. */
  groups?: SidebarGroup[];
  /**
   * The `href` of the page shown first, marked as current until a link is
   * picked.
   */
  current?: string;
  /** Called with a link's `href` when it is picked. */
  onNavigate?: (href: string) => void;
  /**
   * The workspaces the switcher at the top lists; the first is the active one.
   */
  workspaces?: SidebarWorkspace[];
  /** Called with a workspace's name when it is picked from the switcher. */
  onWorkspaceChange?: (name: string) => void;
  /** Corner radius of the links, menus, badges & avatar. */
  shape?: Shape;
  /** Who is signed in, shown at the bottom with their menu. */
  user?: { name: string; email: string };
  /** Called when Sign out is picked from the user menu. */
  onSignOut?: () => void;
  /**
   * Where the menus are portalled. Leave unset to portal into `document.body`;
   * pass an element to keep them inside a scrolling frame.
   */
  container?: HTMLElement | null;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An app's sidebar: a workspace switcher, grouped links with badges and the
 * signed-in user's menu at the bottom.
 */
export default function Sidebar({
  groups = GROUPS,
  current = "#files",
  onNavigate,
  workspaces = WORKSPACES,
  onWorkspaceChange,
  shape = "rounded",
  user = { name: "Ada Lovelace", email: "ada@example.com" },
  onSignOut,
  container,
  className,
}: SidebarProps) {
  const active = workspaces[0];
  const [here, setHere] = useState(current);

  return (
    <aside
      className={merge(
        "d:f fd:c g:4 w:60 h:100% p:3 bg:raised brw:1 bc:line c:label",
        className,
      )}
    >
      {active && (
        <Menu
          container={container}
          shape={shape}
          className="w:100%"
          trigger={
            <span className="d:f ai:c g:2 w:100% ta:l">
              <span
                className={merge(
                  "d:f fs:0 ai:c jc:c w:7 h:7 bg:fill c:on-fill fs:xs fw:500",
                  TILE_SHAPES[shape],
                )}
              >
                {active.name.charAt(0)}
              </span>
              <span className="d:f fd:c f:1 min-w:0">
                <span className="fs:sm fw:500 o:h to:e ws:nw">{active.name}</span>
                {active.detail && (
                  <span className="fs:xs c:hint o:h to:e ws:nw">
                    {active.detail}
                  </span>
                )}
              </span>
              <IconSelector className="w:4 h:4 fs:0 c:hint" />
            </span>
          }
          items={workspaces.map((workspace) => ({
            label: workspace.name,
            onClick: () => onWorkspaceChange?.(workspace.name),
          }))}
        />
      )}

      <nav aria-label="Main" className="d:f fd:c g:4 f:1 min-h:0 oy:auto">
        {groups.map((group, index) => (
          <div key={group.label ?? index} className="d:f fd:c g:px">
            {group.label && (
              <span className="px:2 pb:1 fs:xs fw:500 c:hint">
                {group.label}
              </span>
            )}
            {group.links.map((link) => {
              const isCurrent = link.href === here;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => {
                    setHere(link.href);
                    onNavigate?.(link.href);
                  }}
                  className={merge(
                    LINK,
                    LINK_SHAPES[shape],
                    isCurrent ? CURRENT : "",
                  )}
                >
                  {link.icon && (
                    <span className="d:f fs:0" aria-hidden>
                      {link.icon}
                    </span>
                  )}
                  <span className="f:1 min-w:0 o:h to:e ws:nw">{link.label}</span>
                  {link.badge !== undefined && (
                    <Badge size="sm" tone="subtle" shape={shape}>
                      {link.badge}
                    </Badge>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <Menu
        container={container}
        shape={shape}
        className="w:100%"
        trigger={
          <span className="d:f ai:c g:2 w:100% ta:l">
            <Avatar
              name={user.name}
              size="sm"
              tint="indigo"
              shape={shape === "square" ? "square" : "circle"}
            />
            <span className="d:f fd:c f:1 min-w:0">
              <span className="fs:sm fw:500 o:h to:e ws:nw">{user.name}</span>
              <span className="fs:xs c:hint o:h to:e ws:nw">{user.email}</span>
            </span>
            <IconChevronDown className="w:4 h:4 fs:0 c:hint" />
          </span>
        }
        items={[
          { label: "Profile" },
          { label: "Settings" },
          { type: "separator" },
          { label: "Sign out", destructive: true, onClick: onSignOut },
        ]}
      />
    </aside>
  );
}
