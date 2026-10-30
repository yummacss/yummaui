import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { merge } from "yummacss/merge";
import Separator from "./separator";

type Shape = "rounded" | "square" | "squircle" | "pill";
type IconSide = "leading" | "trailing";

const SHAPES: Record<Shape, string> = {
  rounded: "br:md",
  square: "br:0",
  squircle: "br:xxl cs:s",
  pill: "p:1 br:9999",
};

const BASE = "d:f ai:c o:h w:fc";

// a pill insets its buttons inside a border of its own
const PILL = "bg:raised bc:rim bw:1";

// joined buttons overlap by their border, so two edges draw one line; a filled
// button's shared edge takes the rim's color, or the line would vanish into it.
// they keep still when pressed, so the group moves as one control
function joined(index: number, separated: boolean): string {
  const shared = index > 0 ? `ml:-px ${separated ? "blc:rim" : ""}` : "";
  return `br:0 a:s:100 ${shared}`;
}

export interface ButtonGroupProps {
  /** Merged with the group's own classes, so a utility you pass wins. */
  className?: string;
  /** The buttons, spaced and rounded as one control. */
  children: ReactNode;
  /**
   * Corner radius of the group. `pill` also insets the buttons, so a pill
   * `Button` inside sits clear of the border.
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
  shape = "rounded",
  separated = true,
  stretch = false,
  icon = true,
  iconPosition,
  iconOnly,
}: ButtonGroupProps) {
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
        SHAPES[shape],
        shape === "pill" && PILL,
        stretch && "w:100%",
        className,
      )}
    >
      {items.map((child, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: position is the identity here
        <div key={index} className={stretch ? "d:f fg:1" : "d:f"}>
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
