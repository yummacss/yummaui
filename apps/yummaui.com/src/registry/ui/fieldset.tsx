"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import type { ReactNode } from "react";
import { merge } from "yummacss/merge";

export interface FieldsetProps {
  /** The group's name, beside its fields. */
  legend: string;
  /** A line under the legend. */
  description?: string;
  /** The fields in the group. */
  children?: ReactNode;
  /** Blocks every field in the group & dims it. */
  disabled?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A group of fields with its legend and description to the left, stacking above
 * them on a phone.
 */
export default function Fieldset({
  legend,
  description,
  children,
  disabled,
  className,
}: FieldsetProps) {
  return (
    <BaseFieldset.Root
      disabled={disabled}
      className={merge(
        "d:g gtc:1 g:4 @md:gtc:3 @md:g:8 m:0 p:0 bw:0 c:label",
        disabled ? "o:60" : "",
        className,
      )}
    >
      <div className="d:f fd:c g:1">
        <BaseFieldset.Legend className="p:0 fw:600">{legend}</BaseFieldset.Legend>
        {description && <span className="c:hint fs:sm">{description}</span>}
      </div>
      <div className="d:f fd:c g:4 @md:gc-s:2">{children}</div>
    </BaseFieldset.Root>
  );
}
