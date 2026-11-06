"use client";

import { ToggleGroup } from "@base-ui/react/toggle-group";
import { type ReactNode, useId } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, Sliding, useIndicator, useShape, type Shape } from "./style";

type Orientation = "horizontal" | "vertical";

const BASE = "p:r d:f w:fc bg:well bs-o:sunk";

export interface ToggleGroupProps {
  /** A caption above the group, wired to it as its accessible name. */
  label?: string;
  /** Merged with the group's own classes, so a utility you pass wins. */
  className?: string;
  /** The toggles. */
  children: ReactNode;
  /**
   * Corner radius of the container. The toggles inside carry their own `shape`.
   * Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Stacks the toggles and switches the arrow keys that move focus. */
  orientation?: Orientation;
  /**
   * More than one toggle can be pressed at a time. Off by default, matching
   * Base UI, so a group is single-choice unless you say otherwise.
   */
  multiple?: boolean;
  /** Ignores interaction on every toggle in the group. */
  disabled?: boolean;
  /** The pressed toggles, controlled. Pair with `onValueChange`. */
  value?: readonly string[];
  /** The pressed toggles on first render, uncontrolled. */
  defaultValue?: readonly string[];
  /** Called with the pressed values whenever they change. */
  onValueChange?: (value: string[]) => void;
  /**
   * The raised key sliding to the pressed toggle. Turn it off for an instant
   * jump; reduced motion does the same. Not with `multiple`, where each pressed
   * toggle draws its own key.
   */
  animated?: boolean;
}

/**
 * A set of toggles sharing one container, in four shapes and both orientations,
 * pressing one or several at a time.
 */
export default function ToggleGroupBase({
  label,
  className,
  children,
  shape: shapeProp,
  orientation = "horizontal",
  multiple = false,
  disabled = false,
  value,
  defaultValue,
  onValueChange,
  animated = true,
}: ToggleGroupProps) {
  const shape = useShape(shapeProp);
  const labelId = useId();
  const sliding = !multiple;
  const indicator = useIndicator<HTMLDivElement>(sliding);
  const group = (
    <ToggleGroup
      ref={indicator.ref}
      aria-labelledby={label ? labelId : undefined}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      multiple={multiple}
      disabled={disabled}
      orientation={orientation}
      className={merge(
        BASE,
        RADIUS.bar[shape],
        orientation === "vertical" && "fd:c",
        className,
      )}
    >
      {sliding && (
        <span
          aria-hidden
          style={indicator.style}
          className={merge(
            "p:a l:0 t:0 zi:0 bg:raised bs-o:key bw:1 bc:rim",
            RADIUS.bar[shape],
            animated && indicator.ready && "tp:a tdu:300 ttf:out-quart @prm:tp:none",
          )}
        />
      )}
      <Sliding value={sliding}>{children}</Sliding>
    </ToggleGroup>
  );

  if (!label) return group;

  return (
    <div className="d:f fd:c ai:c g:2">
      <span id={labelId} className="c:label fs:sm fw:500 us:none">
        {label}
      </span>
      {group}
    </div>
  );
}
