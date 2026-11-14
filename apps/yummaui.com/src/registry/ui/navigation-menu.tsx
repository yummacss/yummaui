"use client";

import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { IconChevronDown } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, Scroll, useShape, type Shape } from "./style";

// a panel slides in from the side you moved from through a blur, and out the other way
const SLIDE =
  "opening:o:0 closing:o:0 opening:fb:4 closing:fb:4 opening:from-left:ttx:-24 opening:from-right:ttx:24 closing:from-left:ttx:24 closing:from-right:ttx:-24";

export interface NavigationLink {
  title: string;
  href: string;
  description?: string;
  icon?: ReactNode;
}

export interface NavigationItem {
  label: string;
  /** A plain link in the bar. Ignored when `links` is set. */
  href?: string;
  /** The panel's links. With them the item opens a panel. */
  links?: NavigationLink[];
  /** Lay the panel's links out in two columns. */
  columns?: 1 | 2;
  /** A block beside the links, such as a summary or a preview. */
  aside?: ReactNode;
}

export interface NavigationMenuProps {
  /**
   * Where the popup is rendered. Defaults to `document.body`, which is right
   * almost always; pass an element to portal somewhere else, such as inside a
   * frame or a container that owns its own stacking context.
   */
  container?: HTMLElement | null;
  /**
   * The bar, left to right. Each item's `label`, plus `links` for a panel (with
   * `columns`) or `href` for a plain link.
   */
  items: NavigationItem[];
  /** The navigation's accessible name. */
  label?: string;
  /**
   * Corner radius on the bar, its items, the panel and its icon tiles. Inherits
   * the nearest `Shape`.
   */
  shape?: Shape;
  /**
   * The panel's scale-in, its resize between items and the slide between
   * panels. Turn it off for an instant menu, or when the user has asked for
   * reduced motion.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

/**
 * A bar of links whose items open panels of links, the panel resizing and
 * sliding as you move between them.
 */
export default function NavigationMenuBase({
  items,
  label = "Main",
  shape: shapeProp,
  animated = true,
  className,
  focus = true,
  container,
}: NavigationMenuProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [value, setValue] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const triggers = useRef(new Map<string, HTMLElement>());
  // the raised key sits under the open trigger; it jumps there unseen when the menu first opens
  const [key, setKey] = useState({ left: 0, width: 0, jump: true });

  useLayoutEffect(() => {
    const trigger = value ? triggers.current.get(value) : null;
    const bar = list.current;
    if (!trigger || !bar) return;
    const from = bar.getBoundingClientRect();
    const to = trigger.getBoundingClientRect();
    setKey((now) => ({ left: to.left - from.left - bar.clientLeft, width: to.width, jump: now.width === 0 }));
  }, [value]);

  useLayoutEffect(() => {
    if (!value) setKey((now) => ({ ...now, jump: true }));
    else if (key.jump) {
      const frame = requestAnimationFrame(() => setKey((now) => ({ ...now, jump: false })));
      return () => cancelAnimationFrame(frame);
    }
  }, [value, key.jump]);

  // the aside sits 5px inside the panel, so its corner is the panel's less that; a wrapping row is never a pill
  const row = shape === "pill" ? RADIUS.inset.pill : RADIUS.item[shape];

  const item = (open: boolean) =>
    merge(
      outline,
      "p:r d:f ai:c g:1 h:8 px:3 bw:1 bc:transparent bg:transparent fs:sm fw:500 td:none us:none c:p h:c:label",
      open ? "c:label" : "c:hint",
      RADIUS.item[shape],
    );

  return (
    <NavigationMenu.Root
      value={value}
      onValueChange={(next) => setValue(typeof next === "string" ? next : null)}
      aria-label={label}
      className={merge("d:f c:label", className)}
    >
      <NavigationMenu.List
        ref={list}
        className={merge(
          "p:r d:f ai:c g:px m:0 p:1 bg:well bs-o:sunk bw:1 bc:rim",
          RADIUS.bar[shape],
        )}
      >
        <li
          aria-hidden
          className={merge(
            "p:a t:1 h:8 lst:none bw:1 bc:rim bg:raised bs-o:key pe:none",
            RADIUS.item[shape],
            value ? "o:100" : "o:0",
            !animated || key.jump ? "tp:o tdu:150 @prm:tp:none" : "tp:a tdu:250 ttf:out-quart @prm:tp:none",
          )}
          style={{ left: key.left, width: key.width }}
        />
        {items.map((entry) => (
          <NavigationMenu.Item key={entry.label} value={entry.label}>
            {entry.links ? (
              <>
                <NavigationMenu.Trigger
                  ref={(node: HTMLElement | null) => {
                    if (node) triggers.current.set(entry.label, node);
                    else triggers.current.delete(entry.label);
                  }}
                  className={(state) => item(state.open)}
                >
                  {entry.label}
                  <NavigationMenu.Icon
                    className={(state) =>
                      merge(
                        "d:f c:hint",
                        state.open && "ro:36",
                        animated && "tp:t tdu:200 ttf:out-quart @prm:tp:none",
                      )
                    }
                  >
                    <IconChevronDown className="w:3 h:3" />
                  </NavigationMenu.Icon>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content
                  className={merge(
                    "p:1 w:max max-w:100%",
                    animated &&
                      `tp:a tdu:250 ttf:out-quart ${SLIDE} @prm:tp:none`,
                  )}
                >
                  {/* a panel taller than the room under the bar stops there and scrolls */}
                  <Scroll className="max-h:var(--available-height)">
                  <div className={entry.aside ? "d:f fd:c g:2 @sm:fd:r" : "d:f"}>
                  {entry.aside && (
                    <div className={merge("d:f fd:c jc:fe g:2 w:100% @sm:w:48 fs:0 p:3 bw:1 bc:line bg:well bs-o:sunk", RADIUS.inset[shape])}>
                      {entry.aside}
                    </div>
                  )}
                  <div
                    className={
                      entry.columns === 2
                        ? "d:g gtc:1 @sm:gtc:2 g:px w:72 @sm:w:112 ac:s"
                        : "d:g g:px w:72 ac:s"
                    }
                  >
                    {entry.links.map((link) => (
                      <NavigationMenu.Link
                        key={link.href}
                        href={link.href}
                        className={merge(
                          outline,
                          "d:f ai:s g:3 p:2 bw:1 bc:transparent c:label td:none h:bg:well",
                          row,
                        )}
                      >
                        {link.icon && (
                          <span
                            aria-hidden
                            className={merge(
                              "d:f ai:c jc:c fs:0 w:8 h:8 bw:1 bc:rim bg:well c:label",
                              RADIUS.item[shape],
                            )}
                          >
                            {link.icon}
                          </span>
                        )}
                        <span className="d:f fd:c">
                          <span className="fs:sm fw:500">{link.title}</span>
                          {link.description && (
                            <span className="c:hint fs:xs lh:4">
                              {link.description}
                            </span>
                          )}
                        </span>
                      </NavigationMenu.Link>
                    ))}
                  </div>
                  </div>
                  </Scroll>
                </NavigationMenu.Content>
              </>
            ) : (
              <NavigationMenu.Link href={entry.href} className={item(false)}>
                {entry.label}
              </NavigationMenu.Link>
            )}
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>

      <NavigationMenu.Portal container={container}>
        <NavigationMenu.Positioner
          sideOffset={8}
          align="center"
          collisionPadding={16}
          className={merge(
            "zi:50 w:var(--positioner-width) h:var(--positioner-height) max-w:var(--available-width)",
            animated && "tp:a tdu:250 ttf:out-quart @prm:tp:none",
          )}
        >
          <NavigationMenu.Popup
            className={merge(
              "p:r w:100% h:100% tor:var(--transform-origin) bg:raised c:label bw:1 bc:line bs-o:pop",
              RADIUS.popup[shape],
              animated &&
                "tp:a tdu:250 ttf:out-quart opening:o:0 opening:s:97 closing:o:0 closing:s:97 closing:tdu:100 closing:ttf:eo @prm:tp:none",
            )}
          >
            <NavigationMenu.Viewport className="p:r w:100% h:100% o:h" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
