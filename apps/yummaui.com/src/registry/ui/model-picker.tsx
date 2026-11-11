"use client";

import { Select } from "@base-ui/react/select";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, SIZE, type Size, useShape } from "./style";

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
  /** On phones the trigger shows only the mark. */
  compact?: boolean;
  /** Trigger and list size together. */
  size?: Size;
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
   * Fades and scales the list in and out. Turn it off for a static list, or
   * when the user has asked for reduced motion.
   */
  animated?: boolean;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

const LIST_WIDTH: Record<Size, string> = { sm: "w:72", md: "w:80", lg: "w:96" };

// every mark sits on the same raised key, so marks drawn at different sizes still line up
function Tile({ logo, shape, small }: { logo: ReactNode; shape: Shape; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={merge(
        "d:f ai:c jc:c fs:0 bw:1 bc:rim bg:raised",
        small ? "w:6 h:6" : "w:8 h:8 bs-o:key",
        shape === "pill" ? "br:9999" : RADIUS.item[shape],
      )}
    >
      {typeof logo === "string" ? (
        <img src={logo} alt="" className={merge("d:b of:sd", small ? "w:4 h:4" : "w:5 h:5")} />
      ) : (
        logo
      )}
    </span>
  );
}

/**
 * The model a chat answers with, picked from a list grouped by provider, each
 * on its mark with a line on what it is good at.
 */
export default function ModelPicker({
  models,
  defaultValue,
  value,
  onValueChange,
  compact = false,
  size = "sm",
  container,
  shape: shapeProp,
  disabled = false,
  animated = true,
  className,
  focus = true,
}: ModelPickerProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [own, setOwn] = useState(defaultValue ?? models[0]?.id);
  const current = models.find((model) => model.id === (value ?? own));
  const groups: { provider: string; models: Model[] }[] = [];
  for (const model of models) {
    const provider = model.provider ?? "";
    let group = groups.find((entry) => entry.provider === provider);
    if (!group) {
      group = { provider, models: [] };
      groups.push(group);
    }
    group.models.push(model);
  }

  return (
    <Select.Root
      items={models.map((model) => ({ value: model.id, label: model.name }))}
      value={value ?? own}
      onValueChange={(id) => {
        if (!id) return;
        setOwn(id);
        onValueChange?.(id);
      }}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label="Model"
        className={(state) => merge(
          outline,
          "d:f ai:c g:2 max-w:100% min-w:0 pl:1 pr:2 bw:1 bc:rim bs-o:key c:label us:none",
          state.open ? "bg:well" : "bg:raised",
          disabled ? "o:60 c:na" : "c:p",
          SIZE.height[size],
          size === "lg" ? "fs:md" : "fs:sm",
          RADIUS.control[shape],
          className,
        )}
      >
        {current?.logo && <Tile logo={current.logo} shape={shape} small />}
        <span className={merge("min-w:0 o:h to:e ws:nw", compact && current?.logo ? "d:none @sm:d:b" : "")}>
          {current?.name}
        </span>
        <Select.Icon className="d:f fs:0 c:hint">
          <IconChevronDown className="w:4 h:4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal container={container}>
        <Select.Positioner sideOffset={8} alignItemWithTrigger={false} className="zi:10 us:none">
          <Select.Popup
            className={merge(
              "d:f fd:c o:h max-h:min(var(--available-height),24rem) p:1 bw:1 bc:line bg:raised bs-o:pop",
              LIST_WIDTH[size],
              RADIUS.popup[shape],
              animated
                ? "tor:var(--transform-origin) tp:ot tdu:200 ttf:out-quart opening:o:0 opening:s:95 closing:o:0 closing:s:95 closing:tdu:100 closing:ttf:eo @prm:tp:none"
                : "",
            )}
          >
            <Select.List className="min-h:0 o:auto">
              {groups.map((group) => (
                <Select.Group key={group.provider}>
                  {group.provider && (
                    <Select.GroupLabel className="px:2 pt:2 pb:1 fs:xs c:hint">{group.provider}</Select.GroupLabel>
                  )}
                  {group.models.map((model) => (
                    <Select.Item
                      key={model.id}
                      value={model.id}
                      className={(state) => merge(
                        "d:f ai:c g:3 py:1 px:2 fs:sm c:label c:p ow:0",
                        state.highlighted ? "bg:well" : "",
                        shape === "pill" ? RADIUS.popup.rounded : RADIUS.item[shape],
                      )}
                    >
                      {model.logo && <Tile logo={model.logo} shape={shape} />}
                      <span className="d:f fd:c f:1 min-w:0">
                        <Select.ItemText className="o:h to:e ws:nw">{model.name}</Select.ItemText>
                        {model.description && (
                          <span className="o:h to:e ws:nw fs:xs c:hint">{model.description}</span>
                        )}
                      </span>
                      <Select.ItemIndicator className="d:f fs:0">
                        <IconCheck className="w:4 h:4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
