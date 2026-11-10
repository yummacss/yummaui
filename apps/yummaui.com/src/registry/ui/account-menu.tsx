"use client";

import { Menu } from "@base-ui/react/menu";
import { IconCheck, IconLogout, IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";
import Avatar from "./avatar";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface Account {
  /** The person's name, which also makes the avatar's initials. */
  name: string;
  /** The address under the name, and the line that tells two accounts apart. */
  email: string;
  /** A photo for the avatar. */
  image?: string;
}

export interface AccountMenuAction {
  /** The row's text. */
  label: string;
  /** A glyph before the label. */
  icon?: ReactNode;
  /** A key hint at the row's end, such as `⌘ ,`. */
  shortcut?: string;
  /** Called when the row is chosen. */
  onClick?: () => void;
}

export interface AccountMenuProps {
  /** Who is signed in: the avatar, and the card at the top of the menu. */
  account: Account;
  /**
   * Every signed-in account, the current one included, listed to switch
   * between.
   */
  accounts?: Account[];
  /** Called with the account picked from the list. */
  onSwitch?: (account: Account) => void;
  /** Rows under the card, such as Settings. */
  actions?: AccountMenuAction[];
  /** Called from the Add account row under the list. */
  onAddAccount?: () => void;
  /** Called from the Sign out row at the bottom. */
  onSignOut?: () => void;
  /** A dot on the avatar for presence. */
  status?: "none" | "online" | "offline" | "busy";
  /**
   * Where the popup is rendered. Defaults to `document.body`; pass an element
   * to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /** Corner radius of the popup and its rows. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An avatar that opens the signed-in account: its card, a few actions, other
 * accounts to switch to and Sign out.
 */
export default function AccountMenu({
  account,
  accounts = [],
  onSwitch,
  actions = [],
  onAddAccount,
  onSignOut,
  status = "none",
  container,
  shape: shapeProp,
  className,
  focus = true,
}: AccountMenuProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const item =
    (danger = false) =>
    (state: { highlighted: boolean }) =>
      merge(
        "d:f ai:c g:2 h:8 mx:1 pl:2 pr:3 fs:sm us:none c:p os:none",
        RADIUS.item[shape],
        danger ? "c:red" : "",
        state.highlighted ? (danger ? "bg:red c:white" : "bg:well") : "",
      );
  const separator = <Menu.Separator className="my:1 h:0 btw:1 bc:line" />;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Account, ${account.name}`}
        className={merge(outline, "d:if p:0 bw:0 bg:transparent br:9999 c:p", className)}
      >
        <Avatar src={account.image} name={account.name} status={status} />
      </Menu.Trigger>
      <Menu.Portal container={container}>
        <Menu.Positioner className="ow:0" sideOffset={8} align="end">
          <Menu.Popup
            className={merge(
              "w:68 max-w:calc(100vw-2rem) py:1 bw:1 bc:line bg:raised bs-o:pop c:label os:none",
              "tor:var(--transform-origin) tp:ot tdu:200 ttf:out-quart opening:o:0 opening:s:95 closing:o:0 closing:s:95 closing:tdu:100 @prm:tp:none",
              RADIUS.popup[shape],
            )}
          >
            <div className="d:f ai:c g:3 px:3 pt:2 pb:3">
              <Avatar src={account.image} name={account.name} size="lg" />
              <div className="d:f fd:c min-w:0">
                <span className="fw:600 o:h to:e ws:nw">{account.name}</span>
                <span className="c:hint fs:xs o:h to:e ws:nw">
                  {account.email}
                </span>
              </div>
            </div>
            {actions.length > 0 && separator}
            {actions.map((action) => (
              <Menu.Item
                key={action.label}
                onClick={action.onClick}
                className={item()}
              >
                {action.icon && <span className="d:f o:70">{action.icon}</span>}
                <span className="f:1">{action.label}</span>
                {action.shortcut && (
                  <kbd className="ml:auto pl:6 fs:xs fw:400 lh:4 ff:d o:60">{action.shortcut}</kbd>
                )}
              </Menu.Item>
            ))}
            {separator}
            {accounts.length > 1 && (
              <Menu.Group>
                <Menu.GroupLabel className="px:3 py:1 fs:xs fw:500 c:hint us:none">
                  Switch account
                </Menu.GroupLabel>
                {accounts.map((other) => {
                  const current = other.email === account.email;
                  return (
                    <Menu.Item
                      key={other.email}
                      onClick={() => !current && onSwitch?.(other)}
                      className={item()}
                    >
                      <Avatar src={other.image} name={other.name} size="sm" />
                      <span className="f:1 min-w:0 o:h to:e ws:nw">
                        {other.email}
                      </span>
                      {current && (
                        <IconCheck aria-label="Current" className="w:4 h:4" />
                      )}
                    </Menu.Item>
                  );
                })}
              </Menu.Group>
            )}
            <Menu.Item onClick={onAddAccount} className={item()}>
              <IconPlus aria-hidden className="w:4 h:4 o:70" />
              Add account
            </Menu.Item>
            {separator}
            <Menu.Item onClick={onSignOut} className={item(true)}>
              <IconLogout aria-hidden className="w:4 h:4" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
