"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import Select, { type SelectGroup } from "./select";
import { type Shape, useShape } from "./style";

export interface Model {
  /** Unique; what `onValueChange` receives. */
  id: string;
  /** The model's name. */
  name: string;
  /** A short line on what it is good at. */
  description?: string;
  /** The provider's mark, as a picture's address or any node. Yumma UI ships none. */
  logo?: ReactNode;
  /** The provider, which groups the list. */
  provider?: string;
}

export interface ModelPickerProps {
  /** The models to pick from, grouped by `provider`. */
  models: Model[];
  /** The model picked at the start. */
  defaultValue?: string;
  /** Controlled pick. Pass it with `onValueChange`. */
  value?: string;
  /** Called with the picked model's id. */
  onValueChange?: (id: string) => void;
  /** Trigger and list size together. */
  size?: "sm" | "md" | "lg";
  /**
   * Where the popup is rendered. Defaults to `document.body`; pass an element
   * to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /**
   * Corner radius of the trigger and the list. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks picking and dims the trigger. */
  disabled?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

const mark = (logo: ReactNode) =>
  typeof logo === "string" ? <img src={logo} alt="" className="d:b w:4 h:4 of:sd" /> : logo;

/**
 * The model a chat answers with, picked from a list grouped by provider, each
 * with its mark and a line on what it is good at.
 */
export default function ModelPicker({
  models,
  defaultValue,
  value,
  onValueChange,
  size = "sm",
  container,
  shape: shapeProp,
  disabled = false,
  className,
}: ModelPickerProps) {
  const shape = useShape(shapeProp);
  const [own, setOwn] = useState(defaultValue ?? models[0]?.id);
  const current = models.find((model) => model.id === (value ?? own));
  const groups: SelectGroup[] = [];
  for (const model of models) {
    const name = model.provider ?? "";
    let group = groups.find((entry) => entry.group === name);
    if (!group) {
      group = { group: name, items: [] };
      groups.push(group);
    }
    group.items.push({
      value: model.id,
      label: model.name,
      description: model.description,
      icon: model.logo ? mark(model.logo) : undefined,
    });
  }

  return (
    <Select
      options={groups}
      ariaLabel="Model"
      container={container}
      value={value ?? own}
      onValueChange={(id) => {
        if (!id) return;
        setOwn(id);
        onValueChange?.(id);
      }}
      icon={current?.logo ? mark(current.logo) : undefined}
      size={size}
      shape={shape}
      disabled={disabled}
      className={merge("w:fc", className)}
    />
  );
}
