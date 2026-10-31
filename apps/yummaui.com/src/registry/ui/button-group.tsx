"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { merge } from "yummacss/merge";
import Separator from "./separator";
import { RADIUS, useShape, type Shape } from "./style";

type IconSide = "leading" | "trailing";

const BASE = "d:f ai:c o:h w:fc";

// a pill insets its buttons inside a border of its own
const PILL = "bg:raised bs-o:key bc:rim bw:1";

// a filled button's shared edge takes the rim's color, or the line would vanish
// into it; they keep still when pressed, so the group moves as one control
function joined(index: number, separated: boolean): string {
  return `br:0 a:s:100 ${index > 0 && separated ? "blc:rim" : ""}`;
}

export interface ButtonGroupProps {
  /** Merged with the group's own classes, so a utility you pass wins. */
  className?: string;
  /** The buttons, spaced and rounded as one control. */
  children: ReactNode;
  /**
   * Corner radius of the group. `pill` also insets the buttons, so a pill
   * `Button` inside sits clear of the border. Inherits the nearest `Shape`.
   */
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
    const className = merge(
      INSET,
      shape === "pill" ? "" : joined(index, separated),
      child.props.className,
    );
    if (!child.props.icon) return cloneElement(child, { className });
    if (!icon)
      return cloneElement(child, {
        className,
        icon: undefined,
        iconOnly: false,
      });
    return cloneElement(child, {
      className,
      iconPosition: child.props.iconPosition ?? iconPosition,
      iconOnly: child.props.iconOnly ?? iconOnly,
    });
  });

  return (
    <div
      className={merge(
        BASE,
        RADIUS.control[shape],
        shape === "pill" && PILL,
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
            index > 0 && shape !== "pill" && "ml:-px",
          )}
        >
          {index > 0 && separated && shape === "pill" && (
            <Separator
              orientation="vertical"
              className={shape === "pill" ? "mx:1 my:1" : undefined}
            />
          )}
          {child}
        </div>
      ))}
    </div>
  );
}
