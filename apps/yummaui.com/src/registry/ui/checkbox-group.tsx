"use client";

import { CheckboxGroup } from "@base-ui/react/checkbox-group";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  useId,
  useState,
} from "react";
import { merge } from "yummacss/merge";
import Checkbox from "./checkbox";

type Shape = "rounded" | "square" | "squircle";

// the well around the boxes, concentric with their rows inside it
const WELL_SHAPES: Record<Shape, string> = {
  rounded: "br:lg",
  square: "",
  squircle: "br:xl cs:s",
};

export interface CheckboxGroupProps {
  /** Merged with the group's own classes, so a utility you pass wins. */
  className?: string;
  /** The checkboxes. */
  children: ReactNode;
  /** Names the group for screen readers and is shown above it. */
  label?: ReactNode;
  /**
   * Renders a checkbox above the group that checks and clears all of them, and
   * is indeterminate while only some are checked. Needs `allValues`, and
   * indents the group under it.
   */
  parentLabel?: ReactNode;
  /**
   * Every value in the group. Without it the parent cannot tell all-checked
   * from some-checked.
   */
  allValues?: string[];
  /** The checked values, controlled. Pair with `onValueChange`. */
  value?: string[];
  /** The checked values on first render, uncontrolled. */
  defaultValue?: string[];
  /** Called with the checked values whenever they change. */
  onValueChange?: (value: string[]) => void;
  /** Ignores interaction on every checkbox in the group. */
  disabled?: boolean;
  /** Form field name for the parent checkbox. */
  name?: string;
  /**
   * Names what is counted under the parent, as in "2 of 3 folders". Needs
   * `parentLabel` and `allValues`.
   */
  countLabel?: string;
  /** Every checkbox's shape, and the well around them. One a box sets wins. */
  shape?: Shape;
}

/**
 * A labelled group of checkboxes, optionally led by a parent checkbox that
 * checks and clears every one and sits indeterminate in between.
 */
export default function CheckboxGroupBase({
  className,
  children,
  label,
  parentLabel,
  allValues,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  countLabel,
  shape = "square",
}: CheckboxGroupProps) {
  const labelId = useId();
  const [internal, setInternal] = useState(defaultValue ?? []);
  const current = value ?? internal;

  const change = (next: string[]) => {
    setInternal(next);
    onValueChange?.(next);
  };

  const count =
    countLabel && allValues
      ? `${current.length} of ${allValues.length} ${countLabel}`
      : undefined;

  return (
    <CheckboxGroup
      aria-labelledby={label ? labelId : undefined}
      aria-label={
        !label && typeof parentLabel === "string" ? parentLabel : undefined
      }
      value={current}
      onValueChange={change}
      allValues={allValues}
      disabled={disabled}
      className={merge("d:f fd:c g:2 w:100 max-w:100% c:label", className)}
    >
      {label && (
        <div className="c:label fs:sm fw:500 us:none" id={labelId}>
          {label}
        </div>
      )}
      {parentLabel && (
        <Checkbox
          name={name}
          parent
          label={parentLabel}
          description={count}
          shape={shape}
        />
      )}
      <div className={merge("d:f fd:c g:1 p:1 bg:well", WELL_SHAPES[shape])}>
        {Children.map(children, (child) =>
          isValidElement<{ shape?: Shape }>(child)
            ? cloneElement(child, { shape: child.props.shape ?? shape })
            : child,
        )}
      </div>
    </CheckboxGroup>
  );
}
