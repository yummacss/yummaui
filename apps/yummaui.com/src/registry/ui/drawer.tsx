"use client";

import { Button } from "@base-ui/react/button";
import { Drawer } from "@base-ui/react/drawer";
import { IconX } from "@tabler/icons-react";
import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement, useState } from "react";
import { merge } from "yummacss/merge";
import ButtonBase from "./button";
import { asTrigger, FOCUS, RADIUS, Scroll, type Shape, type Size, useShape } from "./style";

type Side = "bottom" | "top" | "left" | "right";
type IconPosition = "leading" | "trailing";
type Variant = "edge" | "flyout";
type SnapPoint = number | string;
const SWIPE: Record<Side, "down" | "up" | "left" | "right"> = {
  bottom: "down",
  top: "up",
  left: "left",
  right: "right",
};

const VIEWPORTS: Record<Side, string> = {
  bottom: "d:f p:f i:0 fd:c ai:c jc:fe",
  top: "d:f p:f i:0 fd:c ai:c jc:fs",
  left: "d:f p:f i:0 jc:fs",
  right: "d:f p:f i:0 jc:fe",
};

// thin enough to leave the page's own edge controls alone
const SWIPE_AREAS: Record<Side, string> = {
  bottom: "p:f l:0 r:0 b:0 h:6 zi:10 d:f ai:c jc:c",
  top: "p:f l:0 r:0 t:0 h:6 zi:10 d:f ai:c jc:c",
  left: "p:f t:0 b:0 l:0 w:6 zi:10 d:f ai:c jc:c",
  right: "p:f t:0 b:0 r:0 w:6 zi:10 d:f ai:c jc:c",
};

const PLACEMENTS: Record<Side, string> = {
  bottom: "w:100% max-w:sm max-h:dvh",
  top: "w:100% max-w:sm max-h:dvh",
  left: "h:100% w:80",
  right: "h:100% w:80",
};

// the popup follows a swipe, and rests offstage while it opens & closes
const TRAVEL: Record<Side, { swipe: string; offstage: string }> = {
  bottom: {
    swipe: "tty:var(--drawer-swipe-movement-y)",
    offstage: "opening:tty:full closing:tty:full",
  },
  top: {
    swipe: "tty:var(--drawer-swipe-movement-y)",
    offstage: "opening:tty:-full closing:tty:-full",
  },
  left: {
    swipe: "ttx:var(--drawer-swipe-movement-x)",
    offstage: "opening:ttx:-full closing:ttx:-full",
  },
  right: {
    swipe: "ttx:var(--drawer-swipe-movement-x)",
    offstage: "opening:ttx:full closing:ttx:full",
  },
};

// only the edge that faces the page is rounded
const EDGE_SHAPES: Record<Side, Record<Shape, string>> = {
  bottom: { none: "", rounded: "btr:xxl", pill: "btr:3xl" },
  top: { none: "", rounded: "bbr:xxl", pill: "bbr:3xl" },
  left: { none: "", rounded: "brr:xxl", pill: "brr:3xl" },
  right: { none: "", rounded: "blr:xxl", pill: "blr:3xl" },
};

// the snap offset, dropped while a nested drawer is open so 20px of this one peeks above it
const LIFT: Partial<Record<Side, string>> = {
  bottom:
    "calc(var(--drawer-snap-point-offset, 0px) * (1 - min(var(--nested-drawers, 0), 1)) + min(var(--nested-drawers, 0), 1) * (var(--drawer-height, 0px) - var(--drawer-frontmost-height, 0px) - 1.25rem))",
  top: "calc(var(--drawer-snap-point-offset, 0px) * (1 - min(var(--nested-drawers, 0), 1)) - min(var(--nested-drawers, 0), 1) * (var(--drawer-height, 0px) - var(--drawer-frontmost-height, 0px) - 1.25rem))",
};

const SURFACE = "p:r d:f fd:c bg:raised bc:line c:label bw:1 bs-o:pop";

export interface DrawerProps {
  /**
   * Where the drawer is rendered. Defaults to `document.body`; pass an element
   * to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /**
   * The trigger button's label. An element, such as a list row, is the trigger
   * itself and keeps its own look. Leave it out when `open` opens it from code.
   */
  trigger?: ReactNode;
  /**
   * Your own element as the trigger, such as a link, an avatar or a picture, in
   * place of the default one. It takes the trigger's behavior and none of its
   * look; the focus outline and `className` merge onto its classes. An element
   * that cannot take focus, like an `<img>`, needs `tabIndex={0}`.
   */
  render?: ReactElement<{ className?: string }>;
  /**
   * Controlled open state, for opening it from code: a menu item, a keyboard
   * shortcut or a list row. Uncontrolled (the default) if omitted.
   */
  open?: boolean;
  /** Called whenever it opens or closes, controlled or not. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Heights a `bottom` or `top` drawer rests at, as a fraction of the screen or
   * a length.
   */
  snapPoints?: SnapPoint[];
  /** The snap point it opens at. The first one when omitted. */
  defaultSnapPoint?: SnapPoint;
  /** Controlled snap point, with `onSnapPointChange`. */
  snapPoint?: SnapPoint | null;
  /** Called whenever it moves to another snap point. */
  onSnapPointChange?: (snapPoint: SnapPoint | null) => void;
  /**
   * `true` locks the page while it is open; `false` leaves the page usable;
   * `trap-focus` keeps focus inside but leaves the page scrolling.
   */
  modal?: boolean | "trap-focus";
  /**
   * A strip along its edge, marked with a grab bar, that opens it with a swipe.
   */
  swipeToOpen?: boolean;
  /** A glyph beside the trigger's label. */
  triggerIcon?: ReactNode;
  /** Which end of the trigger `triggerIcon` sits at. */
  triggerIconPosition?: IconPosition;
  /** The drawer's heading, wired up by Base UI's own Drawer.Title. */
  title: string;
  /** The body text, wired up by Base UI's own Drawer.Description. */
  description?: ReactNode;
  /** The body, below the description. Style it yourself. */
  children?: ReactNode;
  /**
   * A full-width button at the end that closes the drawer. None renders without
   * it.
   */
  closeLabel?: string;
  /** The edge it slides in from, and the direction a swipe closes it. */
  side?: Side;
  /**
   * `edge` sits against the side it slides from; `flyout` floats 12px clear of
   * every edge.
   */
  variant?: Variant;
  /** A grab bar on the edge facing the page, for a `bottom` or `top` drawer. */
  handle?: boolean;
  /**
   * An X in the corner. A swipe, a click outside and Esc close it either way.
   */
  showClose?: boolean;
  /**
   * Padding and text size of the trigger and the close button, on the same
   * scale as Button.
   */
  size?: Size;
  /**
   * Corner radius on the edge that faces the page, and on the buttons. Inherits
   * the nearest `Shape`.
   */
  shape?: Shape;
  /**
   * The slide in and out and the backdrop's fade. A swipe follows the finger
   * either way.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

/**
 * A panel that slides in from any edge and closes by swipe, with a title,
 * description and body.
 */
export default function DrawerBase({
  trigger,
  render,
  triggerIcon,
  triggerIconPosition = "leading",
  title,
  description,
  children,
  closeLabel,
  side = "bottom",
  variant = "edge",
  handle = true,
  showClose = false,
  size = "md",
  shape: shapeProp,
  animated = true,
  className,
  focus = true,
  container,
  open: controlledOpen,
  onOpenChange,
  snapPoints,
  defaultSnapPoint,
  snapPoint,
  onSnapPointChange,
  modal = true,
  swipeToOpen = false,
}: DrawerProps) {
  const shape = useShape(shapeProp);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const vertical = side === "bottom" || side === "top";

  const flyout = variant === "flyout";
  // the flyout's margin is the popup's padding, so a swipe still travels its full size
  const popupClasses = [
    flyout ? "d:f p:3 os:none" : `${SURFACE} os:none`,
    modal === true ? "" : "pe:auto",
    PLACEMENTS[side],
    flyout ? "" : EDGE_SHAPES[side][shape],
    TRAVEL[side].swipe,
    // with a drawer open inside it, it steps back: smaller, its edge showing above the front one
    vertical ? `nested:s:95 ${side === "bottom" ? "tor:t" : "tor:b"}` : "",
    animated
      ? `${TRAVEL[side].offstage} ${vertical ? "tp:a" : "tp:t"} tdu:300 ttf:out-quart closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const grip = vertical && handle && (
    <div
      aria-hidden
      className={`fs:0 w:12 h:1 mx:auto bg:line ${shape === "none" ? "" : "br:9999"}`}
    />
  );

  return (
    <Drawer.Root
      swipeDirection={SWIPE[side]}
      open={open}
      onOpenChange={setOpen}
      snapPoints={snapPoints}
      defaultSnapPoint={defaultSnapPoint ?? snapPoints?.[0]}
      snapPoint={snapPoint}
      onSnapPointChange={onSnapPointChange && ((next) => onSnapPointChange(next))}
      modal={modal}
    >
      {swipeToOpen && (
        <Drawer.SwipeArea className={SWIPE_AREAS[side]}>
          {/* the strip's own grab bar, so a reader knows where to swipe */}
          <span
            aria-hidden
            className={`fs:0 bg:line pe:none ${vertical ? "w:10 h:1" : "w:1 h:10"} ${shape === "none" ? "" : "br:9999"}`}
          />
        </Drawer.SwipeArea>
      )}
      {render ? (
        <Drawer.Trigger render={asTrigger(render, outline, className)} />
      ) : isValidElement<{ className?: string }>(trigger) ? (
        <Drawer.Trigger
          render={cloneElement(trigger, {
            className: merge(trigger.props.className, className),
          })}
        />
      ) : (
        trigger !== undefined && (
          <Drawer.Trigger
            render={
              <ButtonBase
                variant="secondary"
                size={size}
                shape={shape}
                focus={focus}
                icon={triggerIcon}
                iconPosition={triggerIconPosition}
                className={className}
              />
            }
          >
            {trigger}
          </Drawer.Trigger>
        )
      )}

      <Drawer.Portal container={container}>
        {modal === true && (
        <Drawer.Backdrop
          className={`p:f i:0 min-h:dvh bg:shadow/30 ${
            animated
              ? "tp:o tdu:300 ttf:out-quart opening:o:0 closing:o:0 closing:tdu:200 closing:ttf:eo swiping:tp:none @prm:tp:none"
              : ""
          }`}
        />
        )}
        {/* a drawer that leaves the page usable lets clicks through everywhere but itself */}
        <Drawer.Viewport className={merge(VIEWPORTS[side], modal === true ? "" : "pe:none")}>
          <Drawer.Popup
            className={popupClasses}
            // the snap offset and the nested lift ride on translate, so they add to the swipe's transform
            style={vertical ? { translate: `0 ${LIFT[side]}` } : undefined}
          >
            <Surface flyout={flyout} className={merge(SURFACE, "f:1 min-w:0 min-h:0 o:h", RADIUS.popup[shape])}>
            {side === "bottom" && <div className="pt:3">{grip}</div>}

            {showClose && (
              <Drawer.Close
                render={
                  <Button
                    className={merge(
                      outline,
                      "d:f p:a r:4 t:4 ai:c jc:c w:7 h:7 p:0 bw:1 bg:raised bs-o:key bc:rim c:label h:bg:well",
                      RADIUS.item[shape],
                    )}
                  />
                }
                aria-label="Close"
              >
                <IconX aria-hidden className="w:4 h:4" />
              </Drawer.Close>
            )}

            <Scroll className="f:1">
            <Drawer.Content className="d:f fd:c g:3 p:6">
              <Drawer.Title className="m:0 tw:b c:label fs:md fw:500">
                {title}
              </Drawer.Title>

              {description && (
                <Drawer.Description className="m:0 tw:p c:hint fs:sm lh:4">
                  {description}
                </Drawer.Description>
              )}

              {children}

              {closeLabel && (
                <Drawer.Close
                  render={
                    <ButtonBase
                      variant="secondary"
                      size={size}
                      shape={shape}
                      focus={focus}
                      className="w:100% mt:2"
                    />
                  }
                >
                  {closeLabel}
                </Drawer.Close>
              )}
            </Drawer.Content>
            </Scroll>

            {side === "top" && <div className="pb:3">{grip}</div>}
            </Surface>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// the card inside a flyout's padding; an edge drawer is its own card
function Surface({ flyout, className, children }: { flyout: boolean; className: string; children: ReactNode }) {
  return flyout ? <div className={className}>{children}</div> : children;
}

export interface DrawerIndentProps {
  /** The app, which steps back while any Drawer inside it is open. */
  children: ReactNode;
  /** Corner radius of the page while it is stepped back. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * Extra classes on the page. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/** Wraps the app so the page steps back over black while any Drawer inside it is open. */
export function DrawerIndent({ children, shape: shapeProp, className }: DrawerIndentProps) {
  const shape = useShape(shapeProp);
  return (
    <Drawer.Provider>
      <Drawer.IndentBackground className="p:f i:0 bg:black" />
      <Drawer.Indent
        className={merge(
          "p:r min-h:dvh bg:raised tor:t tp:a tdu:300 ttf:out-quart @prm:tp:none indented:s:95 indented:tty:4 indented:o:h",
          RADIUS.indent[shape],
          className,
        )}
      >
        {children}
      </Drawer.Indent>
    </Drawer.Provider>
  );
}
