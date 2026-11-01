"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { merge } from "yummacss/merge";
import { RADIUS, useShape, type Shape } from "./style";

type IconSide = "leading" | "trailing";

const BASE = "d:f ai:c w:fc";

// the buttons are square and only the group's two outer ends are rounded, so no
// radius class fights another; a filled button's shared edge takes
// the rim's color, or the line would vanish into it; they keep still when pressed,
// so the group moves as one control
function joined(
  index: number,
  count: number,
  shape: Shape,
  separated: boolean,
): string {
  const ends =
    count === 1
      ? RADIUS.control[shape]
      : index === 0
        ? RADIUS.controlStart[shape]
        : index === count - 1
          ? RADIUS.controlEnd[shape]
          : "";
  return `${ends} a:s:100 ${index > 0 && separated ? "blc:rim" : ""}`;
}

export interface ButtonGroupProps {
  /** Merged with the group's own classes, so a utility you pass wins. */
  className?: string;
  /** The buttons, spaced and rounded as one control. */
  children: ReactNode;
  /** Corner radius of the group. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * Draws a rule between each pair of buttons. Turn it off when the buttons
   * already carry their own edges.
   */
  separated?: boolean;
  /** Buttons share the full width instead of sizing to their labels. */
  stretch?: boolean;
  /**
   * Draws each button's icon. `false` drops them, so every button shows its
   * label alone.
   */
  icon?: boolean;
  /**
   * Which end the icon sits at, on every button that has one. Unset, each
   * button keeps its own.
   */
  iconPosition?: IconSide;
  /**
   * Draws each button's icon alone, keeping its label as the accessible name. A
   * button without an icon keeps its label.
   */
  iconOnly?: boolean;
}

type IconProps = {
  className?: string;
  shape?: Shape;
  icon?: ReactNode;
  iconPosition?: IconSide;
  iconOnly?: boolean;
};

// the group clips its buttons, so a grouped button draws its focus outline inside
const INSET = "fv:oo:-3";

/**
 * A row of related buttons sharing one border, in four shapes, with optional
 * rules between them.
 */
export default function ButtonGroup({
  className,
  children,
  shape: shapeProp,
  separated = true,
  stretch = false,
  icon = true,
  iconPosition,
  iconOnly,
}: ButtonGroupProps) {
  const shape = useShape(shapeProp);
  // a button with an icon takes the group's icon props; one it sets itself wins
  const all = Children.toArray(children);
  const items = all.map((child, index) => {
    if (!isValidElement<IconProps>(child)) return child;
    const joint = joined(index, all.length, shape, separated);
    // a menu's own trigger is the part that sits in the row
    const { trigger } = child.props as { trigger?: unknown };
    if (isValidElement<IconProps>(trigger))
      return cloneElement(child, {
        trigger: cloneElement(trigger, {
          className: merge(INSET, joint, trigger.props.className),
          shape: "square",
        }),
      } as Partial<IconProps>);
    const className = merge(INSET, joint, child.props.className);
    if (!child.props.icon) return cloneElement(child, { className, shape: "square" });
    if (!icon)
      return cloneElement(child, {
        className,
        shape: "square",
        icon: undefined,
        iconOnly: false,
      });
    return cloneElement(child, {
      className,
      shape: "square",
      iconPosition: child.props.iconPosition ?? iconPosition,
      iconOnly: child.props.iconOnly ?? iconOnly,
    });
  });

  return (
    <div
      className={merge(
        BASE,
        RADIUS.control[shape],
        stretch && "w:100%",
        className,
      )}
    >
      {items.map((child, index) => (
        // the wrapper, not the button, overlaps the border, so the group still fits the last edge
        // biome-ignore lint/suspicious/noArrayIndexKey: position is the identity here
        <div
          key={index}
          className={merge(
            "d:f",
            stretch && "fg:1",
            index > 0 && "ml:-px",
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
