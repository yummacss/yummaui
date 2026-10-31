"use client";

import { Input } from "@base-ui/react/input";
import {
  IconChevronDown,
  IconCloud,
  IconFolder,
  IconHome,
  IconLogout,
  IconPhoto,
  IconSearch,
  IconSettings,
  IconShare,
  IconStar,
  IconTrash,
  IconUser,
  IconUserPlus,
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

export interface SidebarAccount {
  name: string;
  email: string;
}

export type SidebarStatus = "online" | "busy" | "offline";

const ICON = "w:4 h:4";

type Shape = "rounded" | "square" | "squircle" | "pill";

const LINK_SHAPES: Record<Shape, string> = {
  rounded: "br:md",
  square: "",
  squircle: "br:lg cs:s",
  pill: "br:9999",
};

// the brand's tile; a pill sidebar gives it a circle
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

const ADA: SidebarAccount = { name: "Ada Lovelace", email: "ada@yummaui.com" };

const STATUS_LABELS: Record<SidebarStatus, string> = {
  online: "Online",
  busy: "Busy",
  offline: "Offline",
};

const LINK =
  "d:f ai:c g:2 h:8 px:2 fs:sm td:none c:hint c:p us:none tp:c tdu:100 h:bg:well h:c:label ow:0 oc:focus/40 fv:os:s fv:ow:2 fv:oo:0";

const FIELD_SHAPES: Record<Shape, string> = {
  rounded: "br:lg",
  square: "",
  squircle: "br:xxl cs:s",
  pill: "br:9999",
};
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
  /** The app's name and mark at the top. */
  brand?: { name: string; logo?: ReactNode };
  /** Called with the text typed into the search field. */
  onSearch?: (query: string) => void;
  /** Corner radius of the links, menus, badges & avatar. */
  shape?: Shape;
  /** Who is signed in, shown at the bottom with their menu. */
  user?: SidebarAccount;
  /**
   * Every account the switcher in the user menu lists, the signed-in one
   * included.
   */
  accounts?: SidebarAccount[];
  /** Called with an account's email when it is picked from the switcher. */
  onAccountChange?: (email: string) => void;
  /** Called when Add account is picked from the switcher. */
  onAddAccount?: () => void;
  /** The user's status, shown on their avatar and picked from their menu. */
  status?: SidebarStatus;
  /** Called with the status picked from the user menu. */
  onStatusChange?: (status: SidebarStatus) => void;
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
  brand = { name: "Drive" },
  onSearch,
  shape = "rounded",
  user = ADA,
  accounts = [user],
  onAccountChange,
  onAddAccount,
  status: controlledStatus,
  onStatusChange,
  onSignOut,
  container,
  className,
}: SidebarProps) {
  const [here, setHere] = useState(current);
  const [userOpen, setUserOpen] = useState(false);
  const [ownStatus, setOwnStatus] = useState<SidebarStatus>("online");
  const status = controlledStatus ?? ownStatus;

  return (
    <aside
      className={merge(
        "d:f fd:c g:4 w:60 h:100% p:3 bg:raised brw:1 bc:line c:label",
        className,
      )}
    >
      <div className="d:f ai:c g:2 px:1 h:8">
        <span
          className={merge(
            "d:f fs:0 ai:c jc:c w:7 h:7 bg:fill bc:edge bw:1 bs-o:key-fill c:on-fill",
            TILE_SHAPES[shape],
          )}
        >
          {brand.logo ?? <IconCloud className={ICON} />}
        </span>
        <span className="fs:sm fw:600">{brand.name}</span>
      </div>

      <label className="p:r d:f ai:c c:t">
        <IconSearch
          aria-hidden
          className="p:a l:2 w:4 h:4 c:hint pe:none"
        />
        <Input
          type="search"
          placeholder="Search"
          aria-label="Search"
          onValueChange={(value) => onSearch?.(String(value))}
          className={merge(
            "w:100% h:8 pl:8 pr:2 bg:field bs-o:key bc:rim bw:1 c:label fs:sm ow:0 oc:focus/40 fv:os:s fv:ow:3 fv:oo:0 fv:bc:focus",
            FIELD_SHAPES[shape],
          )}
        />
      </label>

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
                    <Badge size="sm">{link.badge}</Badge>
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
        open={userOpen}
        onOpenChange={setUserOpen}
        trigger={
          <span className="d:f ai:c g:2 w:100% ta:l">
            <Avatar
              name={user.name}
              size="sm"
              tint="indigo"
              status={status}
              shape={shape === "square" ? "square" : "circle"}
            />
            <span className="d:f fd:c f:1 min-w:0">
              <span className="fs:sm fw:500 o:h to:e ws:nw">{user.name}</span>
              <span className="fs:xs c:hint o:h to:e ws:nw">{user.email}</span>
            </span>
            <IconChevronDown
              className={`w:4 h:4 fs:0 c:hint tp:t tdu:200 ttf:out-quart @prm:tp:none ${userOpen ? "ro:36" : "ro:0"}`}
            />
          </span>
        }
        items={[
          {
            type: "group",
            label: "Status",
            items: [
              {
                type: "radio",
                value: status,
                onValueChange: (value) => {
                  setOwnStatus(value as SidebarStatus);
                  onStatusChange?.(value as SidebarStatus);
                },
                options: (Object.keys(STATUS_LABELS) as SidebarStatus[]).map(
                  (value) => ({ value, label: STATUS_LABELS[value] }),
                ),
              },
            ],
          },
          { type: "separator" },
          {
            type: "submenu",
            label: "Switch account",
            icon: <IconUsers className={ICON} />,
            items: [
              ...accounts.map((account) => ({
                label: account.email,
                onClick: () => onAccountChange?.(account.email),
              })),
              { type: "separator" as const },
              {
                label: "Add account",
                icon: <IconUserPlus className={ICON} />,
                onClick: onAddAccount,
              },
            ],
          },
          { label: "Profile", icon: <IconUser className={ICON} /> },
          { label: "Settings", icon: <IconSettings className={ICON} /> },
          { type: "separator" },
          {
            label: "Sign out",
            icon: <IconLogout className={ICON} />,
            destructive: true,
            onClick: onSignOut,
          },
        ]}
      />
    </aside>
  );
}
