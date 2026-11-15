"use client";

import { Button } from "@base-ui/react/button";
import { Popover } from "@base-ui/react/popover";
import { IconCalendar, IconX } from "@tabler/icons-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";
import type { Matcher } from "react-day-picker";
import { merge } from "yummacss/merge";
import Calendar, { type CalendarValue, type DateRange } from "./calendar";
import { FOCUS, RADIUS, type Shape, SIZE, type Size, useShape } from "./style";

type Mode = "single" | "range";
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const day = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export interface DatePickerProps<M extends Mode = "single"> {
  /** The name above the field, wired to it as its label. */
  label?: string;
  /** A hint under the field. */
  description?: string;
  /** What the field says before anything is picked. */
  placeholder?: string;
  /** Picks one day, or a range from its first day to its last. */
  mode?: M;
  /** The picked day or range on first render, uncontrolled. */
  defaultValue?: CalendarValue<M>;
  /** The picked day or range, controlled. Pair with `onValueChange`. */
  value?: CalendarValue<M>;
  /**
   * Called with the new day or range whenever it changes, and the day that was
   * clicked.
   */
  onValueChange?: (value: CalendarValue<M> | undefined, day?: Date) => void;
  /**
   * Days that cannot be picked: a date, a list of them, a range, or a function
   * of the date.
   */
  disabledDays?: Matcher | Matcher[];
  /** The first day of the week, from 0 for Sunday to 6 for Saturday. */
  weekStartsOn?: Weekday;
  /**
   * The earliest month to show, and the first year in the list. 100 years back
   * by default.
   */
  startMonth?: Date;
  /**
   * The latest month to show, and the last year in the list. 10 years ahead by
   * default.
   */
  endMonth?: Date;
  /** An X in the field that empties it, shown once something is picked. */
  clearable?: boolean;
  /**
   * Submits the value with a form under this name: `2026-11-18`, or a range as
   * `2026-11-09/2026-11-13`.
   */
  name?: string;
  /**
   * Where the popup is rendered. Defaults to `document.body`; pass an element
   * to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /** The field's height, width and text. */
  size?: Size;
  /**
   * Corner radius of the field, the popup and its day keys. Inherits the
   * nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks opening and dims the whole control, label included. */
  disabled?: boolean;
  /**
   * The popup's scale-in, the month sliding in and a day's press. Turn it off
   * for all three; reduced motion does the same.
   */
  animated?: boolean;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A field that opens a Calendar in a popover: picking a day, or a range's last
 * day, closes it and writes the date into the field.
 */
export default function DatePicker<M extends Mode = "single">({
  label,
  description,
  placeholder,
  mode: modeProp,
  defaultValue,
  value: controlled,
  onValueChange,
  disabledDays,
  weekStartsOn = 0,
  startMonth,
  endMonth,
  clearable = true,
  name,
  container,
  size = "md",
  shape: shapeProp,
  disabled = false,
  animated = true,
  focus = true,
  className,
}: DatePickerProps<M>) {
  const mode: Mode = modeProp ?? "single";
  const id = useId();
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState(defaultValue);
  const value = controlled ?? own;
  const popup = useRef<HTMLDivElement>(null);

  const single = mode === "single" ? (value as Date | undefined) : undefined;
  const range = mode === "range" ? (value as DateRange | undefined) : undefined;
  const picked = Boolean(single ?? range?.from);

  // clicks since the popup opened: a range's first starts it afresh, its second closes it
  const clicks = useRef(0);
  const pick = (picked: CalendarValue<M> | undefined, day?: Date) => {
    let next = picked;
    if (mode === "range" && day && clicks.current === 0) next = { from: day, to: undefined } as CalendarValue<M>;
    if (day) clicks.current += 1;
    if (controlled === undefined) setOwn(next);
    onValueChange?.(next, day);
    if (day && (mode === "single" || clicks.current > 1)) setOpen(false);
  };
  const toggle = (next: boolean) => {
    clicks.current = 0;
    setOpen(next);
  };

  const text = single
    ? single.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : range?.from
      ? range.to
        ? `${day(range.from)} – ${day(range.to)}, ${range.to.getFullYear()}`
        : `${day(range.from)} – …`
      : (placeholder ?? (mode === "range" ? "Pick a range" : "Pick a day"));

  const submitted = single ? iso(single) : range?.from ? `${iso(range.from)}/${iso(range.to ?? range.from)}` : "";

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" || open) return;
    event.preventDefault();
    toggle(true);
  };

  return (
    <div className={merge("d:f fd:c g:2 min-w:0", disabled && "o:60 c:na", className)}>
      {label && (
        <label id={`${id}-label`} htmlFor={id} className="c:label fs:sm fw:500 us:none">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={toggle}>
        <div className={merge("p:r max-w:100%", SIZE.width[size])}>
          <Popover.Trigger
            id={id}
            disabled={disabled}
            onKeyDown={onKeyDown}
            className={merge(
              outline,
              "d:f ai:c g:2 w:100% pl:3 bw:1 bg:field bs-o:key ta:l us:none",
              open ? "bc:focus" : "bc:rim",
              disabled ? "c:na" : "c:p",
              clearable && picked ? "pr:10" : "pr:3",
              SIZE.height[size],
              SIZE.text[size],
              RADIUS.control[shape],
            )}
          >
            <IconCalendar aria-hidden className="w:4 h:4 fs:0 c:hint" />
            <span className={merge("f:1 min-w:0 o:h to:e ws:nw fvn:tn", picked ? "c:label" : "c:hint")}>{text}</span>
          </Popover.Trigger>
          {clearable && picked && !disabled && (
            <Button
              aria-label="Clear"
              onClick={() => pick(undefined)}
              className={merge(
                outline,
                "p:a r:1 t:0 b:0 my:auto d:f ai:c jc:c w:7 h:7 bw:1 bc:transparent bg:transparent c:hint c:p h:bg:well h:c:label",
                RADIUS.controlInset[shape],
              )}
            >
              <IconX aria-hidden className="w:4 h:4" />
            </Button>
          )}
        </div>
        <Popover.Portal container={container}>
          <Popover.Positioner side="bottom" align="start" sideOffset={8} className="zi:10">
            <Popover.Popup
              ref={popup}
              aria-labelledby={label ? `${id}-label` : undefined}
              // the arrow keys start on the picked day, or today, not on the month buttons
              initialFocus={() => popup.current?.querySelector<HTMLElement>('td button[tabindex="0"]') ?? true}
              className={merge(
                "os:none bs-o:pop",
                RADIUS.popup[shape],
                animated &&
                  "tor:var(--transform-origin) tp:ot tdu:200 ttf:out-quart opening:o:0 opening:s:97 closing:o:0 closing:s:97 closing:tdu:100 closing:ttf:eo @prm:tp:none",
              )}
            >
              <Calendar<M>
                mode={mode as M}
                value={value}
                onValueChange={pick}
                disabledDays={disabledDays}
                weekStartsOn={weekStartsOn}
                startMonth={startMonth}
                endMonth={endMonth}
                // the popup closes on the pick, before a key could slide there
                sliding={false}
                container={container}
                shape={shape}
                animated={animated}
                focus={focus}
                className="bc:line"
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {description && <p className="m:0 c:hint fs:xs">{description}</p>}
      {name && <input type="hidden" name={name} value={submitted} />}
    </div>
  );
}
