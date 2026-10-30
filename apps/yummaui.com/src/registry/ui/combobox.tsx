"use client";

import { Avatar } from "@base-ui/react/avatar";
import { Combobox } from "@base-ui/react/combobox";
import { IconCheck, IconSelector, IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { merge } from "yummacss/merge";

type Size = "sm" | "md" | "lg";
type Shape = "rounded" | "square" | "squircle" | "pill";
// a popup, a row or a card cannot be a pill; under pill it takes rounded corners
type Card = Exclude<Shape, "pill">;
const cardOf = (shape: Shape): Card => (shape === "pill" ? "rounded" : shape);

export interface ComboboxItem {
  label: string;
  description?: string;
  avatar?: string;
}

export interface ComboboxGroup {
  group: string;
  items: ComboboxItem[];
}

const FOCUS = "ow:0 oc:focus/40 fv:os:s fv:ow:3 fv:oo:0 fv:bc:focus";
// the chips field outlines itself while its input has focus
const FIELD_FOCUS = "ow:0 oc:focus/40 fw:os:s fw:ow:3 fw:oo:0 fw:bc:focus";

const INPUT =
  "pl:4 pr:16 bg:field bc:rim c:label bw:1 fs:sm";

const SIZES: Record<Size, string> = {
  sm: "h:8 w:56",
  md: "h:9 w:64",
  lg: "h:11 w:72",
};

const CHIPS_SIZES: Record<Size, string> = {
  sm: "min-h:8 w:56 fs:sm",
  md: "min-h:9 w:64 fs:sm",
  lg: "min-h:11 w:72 fs:md",
};

const ITEM_SHAPES: Record<Card, string> = {
  rounded: "br:sm",
  square: "",
  squircle: "br:lg cs:s",
};

const POPUP_SIZES: Record<Size, string> = {
  sm: "w:56",
  md: "w:64",
  lg: "w:72",
};

const ACTION_HEIGHTS: Record<Size, string> = {
  sm: "h:8",
  md: "h:9",
  lg: "h:11",
};

// a chip sits inside the field, so it rounds one step less
const CHIP_SHAPES: Record<Shape, string> = {
  rounded: "br:xs",
  square: "",
  squircle: "br:md cs:s",
  pill: "br:9999",
};

const SHAPES: Record<Shape, string> = {
  rounded: "br:md",
  square: "br:0",
  squircle: "br:xxl cs:s",
  pill: "br:9999",
};

const POPUP_SHAPES: Record<Card, string> = {
  rounded: "br:lg",
  square: "br:0",
  squircle: "br:xxl cs:s",
};

const ACTION =
  "d:f b:0 ai:c jc:c w:6 h:6 p:0 bg:transparent c:hint c:p h:c:label";

export interface ComboboxProps {
  /**
   * Where the popup is rendered. Defaults to `document.body`, which is right
   * almost always; pass an element to portal somewhere else, such as inside a
   * frame or a container that owns its own stacking context.
   */
  container?: HTMLElement | null;
  /**
   * What to choose from. Same shape as Autocomplete's: `label` is matched and
   * shown, `description` and `avatar` are optional.
   */
  items: ComboboxItem[] | ComboboxGroup[];
  /** Field label above the input. */
  label?: ReactNode;
  /**
   * A line under the input, for what the field expects rather than a
   * restatement of the label.
   */
  description?: string;
  /** Placeholder text. */
  placeholder?: string;
  /**
   * Height and width of the input. The popup and the trigger column follow it.
   */
  size?: Size;
  /**
   * Corner radius, applied to the input and the popup together. `squircle` uses
   * `corner-shape`.
   */
  shape?: Shape;
  /**
   * Allows more than one selection. Choices become removable chips under the
   * input.
   */
  multiple?: boolean;
  /**
   * The selection on first render: one item's label, or an array of labels with
   * `multiple`.
   */
  defaultValue?: string | string[];
  /**
   * Adds a button that empties the selection. It appears with the first
   * selection rather than with the prop, because an X on an empty field has
   * nothing to do. Works alongside `multiple`, where it clears every chip.
   */
  clearable?: boolean;
  /** Blocks interaction and dims the field. */
  disabled?: boolean;
  /**
   * Replaces the results with a loading row, for an async source. The fetching
   * itself is yours; this is only the state.
   */
  loading?: boolean;
  /**
   * Fades the popup in and out. Turn it off for a static popup, or when the
   * user has asked for reduced motion.
   */
  animated?: boolean;
  /** Shown when nothing matches. */
  emptyMessage?: string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
  /**
   * The focus outline. `true` draws it, `false` removes it along with the
   * danger, error and success tints that ride with it, and a string of Yumma
   * CSS utilities restyles it on every focusable part of the component, which
   * is more than `className` reaches. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
}

function isGroupEntry(
  entry: ComboboxItem | ComboboxGroup,
): entry is ComboboxGroup {
  return "items" in entry;
}

function renderItem(item: ComboboxItem, shape: Shape) {
  return (
    <Combobox.Item
      key={item.label}
      value={item.label}
      className={(state) =>
        `d:f ai:c g:2 py:2 px:3 mx:1 bw:1 bc:transparent ${ITEM_SHAPES[cardOf(shape)]} fs:sm fw:500 us:none c:p ${
          state.highlighted
            ? "bg:check c:white bc:transparent"
            : "bg:transparent"
        }`
      }
    >
      {item.avatar && (
        <Avatar.Root className="d:if o:h ai:c jc:c w:6 h:6 bc:raised br:9999 bw:1 us:none">
          <Avatar.Image
            src={item.avatar}
            alt=""
            className="of:c w:100% h:100%"
          />
          <Avatar.Fallback className="d:f ai:c jc:c w:100% h:100% c:hint fs:xs">
            {item.label[0]}
          </Avatar.Fallback>
        </Avatar.Root>
      )}
      <span className="fg:1 min-w:0 o:h to:e ws:nw">{item.label}</span>
      {item.description && (
        <span className="fs:0 fw:400 o:80">{item.description}</span>
      )}
      <Combobox.ItemIndicator className="d:f ml:auto">
        <IconCheck className="w:3 h:3" />
      </Combobox.ItemIndicator>
    </Combobox.Item>
  );
}

/**
 * A filtering input that commits to a selection, in three sizes and three
 * shapes, single or multiple with removable chips.
 */
export default function ComboboxBase({
  items,
  label,
  description,
  size = "md",
  shape = "rounded",
  multiple = false,
  defaultValue,
  clearable = true,
  disabled = false,
  loading = false,
  animated = true,
  placeholder,
  emptyMessage,
  className,
  focus = true,
  container,
}: ComboboxProps) {
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const id = useId();

  const fieldOutline = focus
    ? merge(FIELD_FOCUS, focus === true ? "" : focus)
    : "";

  const chipsClasses = merge(
    fieldOutline,
    "d:f fw:w ai:c g:1 py:1 pl:1 pr:16 bg:field bc:rim c:label bw:1",
    CHIPS_SIZES[size],
    SHAPES[shape],
    className,
  );

  const inputClasses = merge(
    outline,
    INPUT,
    SIZES[size],
    SHAPES[shape],
    className,
  );

  const popup = (
    <Combobox.Popup
      className={`o:h bg:raised bc:line bs-o:xl c:label bw:1 ${POPUP_SIZES[size]} ${POPUP_SHAPES[cardOf(shape)]} ${animated ? "tor:var(--transform-origin) tp:a tdu:200 ttf:out-quart opening:o:0 opening:s:95 closing:o:0 closing:s:95 closing:tdu:100 closing:ttf:eo @prm:tp:none" : ""}`}
    >
      {loading ? (
        <div
          className="d:f py:3 px:4 ai:c g:2 c:hint fs:sm us:none"
          role="status"
        >
          <span
            aria-hidden
            className={`d:b w:4 h:4 bc:rim btc:hint bw:2 br:9999 ${
              animated ? "an:spin adu:700 atf:l aic:i" : ""
            }`}
          />
          Loading
        </div>
      ) : (
        <>
          <Combobox.List className="oy:auto py:1 max-h:72 ow:0">
            {(entry: ComboboxItem | ComboboxGroup) =>
              isGroupEntry(entry) ? (
                <Combobox.Group key={entry.group}>
                  <Combobox.GroupLabel className="px:3 pt:2 pb:1 fs:xs fw:500 c:hint us:none">
                    {entry.group}
                  </Combobox.GroupLabel>
                  {entry.items.map((entry) => renderItem(entry, shape))}
                </Combobox.Group>
              ) : (
                renderItem(entry, shape)
              )
            }
          </Combobox.List>
          {emptyMessage && (
          <Combobox.Empty className="c:hint fs:sm">
            <div className="py:4 px:4">{emptyMessage}</div>
          </Combobox.Empty>
          )}
        </>
      )}
    </Combobox.Popup>
  );

  return (
    <Combobox.Root
      items={items as ComboboxItem[]}
      open={open}
      onOpenChange={setOpen}
      multiple={multiple}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <div
        className={`d:f p:r fd:c g:2 c:label fs:sm ${disabled ? "o:60 c:na" : ""}`}
      >
        {label && (
          <label htmlFor={id} className="c:label fs:sm fw:500 us:none">
            {label}
          </label>
        )}

        <div className="p:r">
          {multiple ? (
            <Combobox.Chips className={chipsClasses}>
              <Combobox.Value>
                {(selected: string[] | string | null) => (
                  <>
                    <ChipList
                      chips={toChips(selected)}
                      className={merge(CHIP, CHIP_SHAPES[shape])}
                      animated={animated}
                    />
                  </>
                )}
              </Combobox.Value>
              <Combobox.Input
                id={id}
                placeholder={placeholder}
                className="fg:1 w:24 min-w:24 pl:1 bg:transparent c:label bw:0 os:none"
              />
            </Combobox.Chips>
          ) : (
            <Combobox.Input
              id={id}
              placeholder={placeholder}
              className={inputClasses}
            />
          )}
          <div
            className={`d:f p:a r:2 b:0 ai:c jc:c c:hint ${ACTION_HEIGHTS[size]}`}
          >
            {clearable && (
              <Combobox.Clear
                className={merge(outline, ACTION)}
                aria-label="Clear selection"
              >
                <IconX className="w:4 h:4" />
              </Combobox.Clear>
            )}
            <Combobox.Trigger
              className={merge(outline, ACTION)}
              aria-label="Open popup"
            >
              <IconSelector className="w:4 h:4" />
            </Combobox.Trigger>
          </div>
        </div>

        {description && <p className="m:0 c:hint fs:xs">{description}</p>}
      </div>
      <Combobox.Portal container={container} keepMounted>
        <Combobox.Positioner className="ow:0" sideOffset={8}>
          {popup}
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

const CHIP =
  "d:f ai:c g:1 px:2 py:0 h:6 bg:raised bc:rim c:label bw:1 fs:xs fw:500";
const CHIP_REMOVE =
  "d:f b:0 ai:c jc:c w:6 h:6 my:-px ml:-1 mr:-2 p:0 bg:transparent c:hint c:p h:c:label";

// a removed chip stays a moment as a copy that fades out, since Base UI unmounts it at once
function ChipList({
  chips,
  className,
  animated,
}: {
  chips: string[];
  className: string;
  animated: boolean;
}) {
  const [previous, setPrevious] = useState(chips);
  const [leaving, setLeaving] = useState<{ chip: string; at: number }[]>([]);
  if (previous.join("\n") !== chips.join("\n")) {
    const gone = previous
      .map((chip, at) => ({ chip, at }))
      .filter(({ chip }) => !chips.includes(chip));
    setPrevious(chips);
    if (animated)
      setLeaving((list) => [
        ...list.filter(({ chip }) => !chips.includes(chip)),
        ...gone,
      ]);
  }

  useEffect(() => {
    if (!leaving.length) return;
    const timer = setTimeout(() => setLeaving([]), 150);
    return () => clearTimeout(timer);
  }, [leaving]);

  const rows = chips.map((chip) => ({ chip, gone: false }));
  for (const { chip, at } of [...leaving].sort((a, b) => a.at - b.at))
    rows.splice(Math.min(at, rows.length), 0, { chip, gone: true });

  return rows.map(({ chip, gone }) =>
    gone ? (
      <span
        key={`${chip}-leaving`}
        aria-hidden
        className={merge(
          className,
          "o:0 s:90 pe:none an:leave adu:150 atf:eo @prm:an:none",
        )}
      >
        {chip}
        <span className={CHIP_REMOVE}>
          <IconX className="w:3 h:3" />
        </span>
      </span>
    ) : (
      <Combobox.Chip
        key={chip}
        className={merge(
          className,
          // a new chip fades in
          animated && "tp:o tdu:150 ttf:eo @st:o:0 @prm:tp:none",
        )}
      >
        {chip}
        <Combobox.ChipRemove className={CHIP_REMOVE} aria-label={`Remove ${chip}`}>
          <IconX className="w:3 h:3" />
        </Combobox.ChipRemove>
      </Combobox.Chip>
    ),
  );
}

function toChips(selected: string[] | string | null): string[] {
  if (Array.isArray(selected)) return selected;
  return selected ? [selected] : [];
}
