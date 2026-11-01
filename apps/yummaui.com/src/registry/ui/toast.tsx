"use client";

import { Button } from "@base-ui/react/button";
import { Toast } from "@base-ui/react/toast";
import { IconX } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import ButtonBase from "./button";
import { FOCUS, RADIUS, useShape, type Shape } from "./style";

type TriggerTone = "neutral" | "danger";

// a collapsed toast peeks out under the one in front and shrinks with depth
const STACK = {
  "--gap": "0.75rem",
  "--peek": "0.75rem",
  "--scale": "calc(max(0, 1 - (var(--toast-index) * 0.1)))",
  "--shrink": "calc(1 - var(--scale))",
  "--height": "var(--toast-frontmost-height, var(--toast-height))",
  "--offset-y":
    "calc(var(--toast-offset-y) * -1 + (var(--toast-index) * var(--gap) * -1) + var(--toast-swipe-movement-y))",
  zIndex: "calc(1000 - var(--toast-index))",
} as CSSProperties;

const COLLAPSED =
  "translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) - (var(--toast-index) * var(--peek)) - (var(--shrink) * var(--height)))) scale(var(--scale))";
const EXPANDED =
  "translateX(var(--toast-swipe-movement-x)) translateY(var(--offset-y))";

// where a toast goes as it leaves: off the edge it was swiped toward, else down
const LEAVING: Record<string, string> = {
  up: "translateY(calc(var(--toast-swipe-movement-y) - 150%))",
  down: "translateY(calc(var(--toast-swipe-movement-y) + 150%))",
  left: "translateX(calc(var(--toast-swipe-movement-x) - 150%)) translateY(var(--offset-y))",
  right:
    "translateX(calc(var(--toast-swipe-movement-x) + 150%)) translateY(var(--offset-y))",
};

function place(state: Toast.Root.State): CSSProperties {
  let transform = state.expanded ? EXPANDED : COLLAPSED;
  if (state.transitionStatus === "starting") transform = "translateY(150%)";
  if (state.transitionStatus === "ending") {
    transform = LEAVING[state.swipeDirection ?? ""] ?? "translateY(150%)";
  }
  return {
    ...STACK,
    height: state.expanded ? "var(--toast-height)" : "var(--height)",
    transform,
  };
}

export interface ToastProps {
  /** The button that raises a toast. Each press adds one to the stack. */
  trigger: ReactNode;
  /** The toast's first line. */
  title: string;
  /** A line under the title. */
  description?: string;
  /** A button in the toast, `Undo` usually. Leave it out for none. */
  actionLabel?: string;
  /** Called when the action is pressed. The toast closes either way. */
  onAction?: () => void;
  /** Milliseconds before a toast closes by itself. `0` keeps it open. */
  timeout?: number;
  /** How many toasts stay visible; older ones wait until there is room. */
  limit?: number;
  /**
   * The trigger's color: `danger` when the action it reports destroys
   * something.
   */
  triggerTone?: TriggerTone;
  /**
   * Corner radius of the toast and its buttons. `squircle` uses `corner-shape`,
   * which degrades to a rounded square where that is unsupported. Inherits the
   * nearest `Shape`.
   */
  shape?: Shape;
  /**
   * Toasts slide in, stack and swipe away. Turn it off for an instant change,
   * or when the user has asked for reduced motion.
   */
  animated?: boolean;
  /** Extra classes for the trigger. */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Where the toasts are portalled. Leave it empty for the document body; set
   * it inside a frame or a container that owns its own stacking context.
   */
  container?: HTMLElement | null;
}

/**
 * A trigger that raises a toast, with a title, an optional description and
 * action, stacked at the bottom of the screen and swiped away.
 */
export default function ToastBase({
  trigger,
  title,
  description,
  actionLabel,
  onAction,
  timeout = 5000,
  limit = 3,
  triggerTone = "neutral",
  shape: shapeProp,
  animated = true,
  className,
  focus = true,
  container,
}: ToastProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";

  return (
    <Toast.Provider timeout={timeout} limit={limit}>
      <Trigger
        variant={triggerTone === "danger" ? "danger" : "secondary"}
        shape={shape}
        focus={focus}
        className={className}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      >
        {trigger}
      </Trigger>
      <Toast.Portal container={container}>
        <Toast.Viewport className="p:f r:4 b:4 l:4 zi:50 os:none @sm:l:auto @sm:w:90">
          <Stack shape={shape} animated={animated} outline={outline} />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function Trigger({
  variant,
  shape,
  focus,
  className,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: Pick<
  ToastProps,
  "title" | "description" | "actionLabel" | "onAction" | "focus" | "className"
> & {
  variant: "secondary" | "danger";
  shape: Shape;
  children: ReactNode;
}) {
  const manager = Toast.useToastManager();
  const raised = useRef<{ id: string; attempt: number } | null>(null);
  const raise = () => {
    // pressed again while its toast shows, the toast shakes rather than stacking
    const open = raised.current;
    if (open && manager.toasts.some((toast) => toast.id === open.id)) {
      open.attempt += 1;
      manager.update(open.id, { data: { attempt: open.attempt } });
      return;
    }
    // the action runs, then its toast goes: an undone change needs no message
    const id = manager.add({
      data: { attempt: 0 },
      title,
      description,
      actionProps: actionLabel
        ? {
            children: actionLabel,
            onClick: () => {
              onAction?.();
              manager.close(id);
            },
          }
        : undefined,
    });
    raised.current = { id, attempt: 0 };
  };
  return (
    <ButtonBase
      variant={variant}
      shape={shape}
      focus={focus}
      className={className}
      onClick={raise}
    >
      {children}
    </ButtonBase>
  );
}

function Stack({
  shape,
  animated,
  outline,
}: {
  shape: Shape;
  animated: boolean;
  outline: string;
}) {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => (
    <Item
      key={toast.id}
      toast={toast}
      shape={shape}
      animated={animated}
      outline={outline}
    />
  ));
}

function Item({
  toast,
  shape,
  animated,
  outline,
}: {
  toast: ReturnType<typeof Toast.useToastManager>["toasts"][number];
  shape: Shape;
  animated: boolean;
  outline: string;
}) {
  const attempt = (toast.data as { attempt?: number } | undefined)?.attempt ?? 0;
  const [shaking, setShaking] = useState(false);

  // each new attempt shakes the whole toast, restarting a shake already running
  useEffect(() => {
    if (!attempt || !animated) return;
    setShaking(false);
    const frame = requestAnimationFrame(() => setShaking(true));
    return () => cancelAnimationFrame(frame);
  }, [attempt, animated]);

  return (
    <Toast.Root
      toast={toast}
      swipeDirection={["down", "right"]}
      style={place}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setShaking(false);
      }}
      className={(state) =>
        merge(
          outline,
          "p:a r:0 b:0 w:100% bg:raised bc:line bw:1 bs-o:pop us:none",
          RADIUS.popup[shape],
          animated ? "tp:a tdu:500 ttf:out-quart @prm:tp:none" : "",
          shaking ? "an:shake adu:500 atf:io @prm:an:none" : "",
          state.transitionStatus === "ending" || state.limited ? "o:0" : "",
        )
      }
    >
      {/* bridges the gap between toasts, so the stack stays open as the pointer crosses it */}
      <span aria-hidden className="p:a t:100% l:0 w:100% h:4" />
      <Toast.Content
        className={(state) =>
          [
            "d:f ai:c g:3 py:3 pl:4 pr:3 o:h",
            animated ? "tp:o tdu:250 ttf:out-quart @prm:tp:none" : "",
            state.behind && !state.expanded ? "o:0" : "",
          ]
            .filter(Boolean)
            .join(" ")
        }
      >
        <div className="d:f fd:c g:1 f:1 min-w:0">
          <Toast.Title className="m:0 tw:b c:label fs:sm fw:500" />
          <Toast.Description className="m:0 tw:p c:hint fs:sm" />
        </div>
        <Toast.Action
          render={
            <ButtonBase
              variant="secondary"
              size="sm"
              shape={shape}
              focus={outline !== ""}
              className="fs:0"
            />
          }
        />
        <Toast.Close
          aria-label="Dismiss"
          render={
            <Button
              className={merge(
                outline,
                "d:f fs:0 ai:c jc:c w:7 h:7 p:0 c:hint bw:0 bg:transparent c:p h:bg:well h:c:hint",
                RADIUS.item[shape],
              )}
            />
          }
        >
          <IconX aria-hidden className="w:4 h:4" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  );
}
