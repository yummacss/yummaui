import { merge } from "yummacss/merge";

type Shape = "rounded" | "square" | "squircle" | "pill";

const SHAPES: Record<Shape, string> = {
  rounded: "br:sm",
  square: "",
  squircle: "br:lg cs:s",
  pill: "br:9999",
};

export interface KbdProps {
  /** The keys to press together, each drawn as its own keycap. */
  keys: string[];
  /** Corner radius of each keycap. */
  shape?: Shape;
  /**
   * Extra classes on each keycap. `merge` folds them in last, so one here
   * replaces the component's own class for the same utility.
   */
  className?: string;
}

/** A keyboard shortcut as raised keycaps, for hints in running text. */
export default function Kbd({ keys, shape = "square", className }: KbdProps) {
  return (
    <span className="d:if ai:c g:1 va:m">
      {keys.map((key) => (
        <kbd
          key={key}
          className={merge(
            "d:if ai:c jc:c min-w:6 h:6 px:1 bg:raised c:label btw:1 blw:1 brw:1 bbw:2 bc:rim fs:xs fw:500 lh:1 ff:d",
            SHAPES[shape],
            className,
          )}
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
