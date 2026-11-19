"use client";

import { Button } from "@base-ui/react/button";
import { Select } from "@base-ui/react/select";
import { IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  type ChangeEvent,
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type ChevronProps,
  type DateRange,
  DayPicker,
  type DayButtonProps,
  type DayProps,
  type DropdownProps,
  type Matcher,
} from "react-day-picker";
import { merge } from "yummacss/merge";
import { FOCUS, Fit, RADIUS, Scroll, type Shape, useIndicator, useShape } from "./style";

type Mode = "single" | "range";
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** What a calendar holds: one day, or the two ends of a range. */
export type CalendarValue<M extends Mode = "single"> = M extends "range" ? DateRange : Date;

export type { DateRange };

interface LookValue {
  mode: Mode;
  shape: Shape;
  outline: string;
  weekStartsOn: Weekday;
  animated: boolean;
  sliding: boolean;
  container?: HTMLElement | null;
  shown: string;
  turn: number;
  indicator: ReturnType<typeof useIndicator<HTMLDivElement>> | null;
}

const Look = createContext<LookValue>({
  mode: "single",
  shape: "rounded",
  outline: "",
  weekStartsOn: 0,
  animated: true,
  sliding: true,
  shown: "",
  turn: 0,
  indicator: null,
});

const sameDay = (a?: Date, b?: Date) => !!a && !!b && a.toDateString() === b.toDateString();
const short = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

// a new month slides in from the side the reader moved toward
const enter = (turn: number) =>
  turn > 0
    ? "tp:ot tdu:250 ttf:out-quart @st:o:0 @st:ttx:10 @prm:tp:none"
    : turn < 0
      ? "tp:ot tdu:250 ttf:out-quart @st:o:0 @st:ttx:-10 @prm:tp:none"
      : "";

// the key under the picked day lives beside the table, which cannot hold it
function Grid(props: ComponentProps<"table">) {
  const { mode, shape, animated, sliding, shown, turn, indicator } = useContext(Look);
  return (
    <Fit animated={animated} className="w:100%">
      <div ref={indicator?.ref} className="p:r">
        {/* a new month mounts a new key, so it never slides in from the corner */}
        <div key={shown} className={animated ? enter(turn) : ""}>
          {mode === "single" && sliding && indicator && (
            <span
              aria-hidden
              style={indicator.style}
              className={merge(
                "p:a l:0 t:0 zi:0 bg:fill bs-o:key-fill",
                RADIUS.control[shape],
                animated && indicator.ready && "tp:a tdu:250 ttf:out-quart @prm:tp:none",
              )}
            />
          )}
          <table {...props} />
        </div>
      </div>
    </Fit>
  );
}

// the month and the year, each a list to jump to rather than many steps of the arrows
function Dropdown({ options = [], value, onChange, disabled, "aria-label": ariaLabel }: DropdownProps) {
  const { shape, outline, animated, container } = useContext(Look);
  const current = Number(value);
  return (
    <Select.Root
      value={current}
      disabled={disabled}
      onValueChange={(next) =>
        onChange?.({ target: { value: String(next) } } as unknown as ChangeEvent<HTMLSelectElement>)
      }
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={(state) =>
          merge(
            outline,
            "d:f ai:c g:1 h:7 pl:2 pr:1 bw:1 bc:transparent fs:sm fw:600 fvn:tn c:label c:p us:none h:bg:well",
            state.open ? "bg:well" : "bg:transparent",
            RADIUS.controlInset[shape],
          )
        }
      >
        <Select.Value>{() => options.find((option) => option.value === current)?.label}</Select.Value>
        <Select.Icon className="d:f c:hint">
          <IconChevronDown aria-hidden className="w:4 h:4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal container={container}>
        <Select.Positioner sideOffset={4} alignItemWithTrigger={false} className="zi:20 ow:0">
          <Select.Popup
            className={merge(
              "d:f fd:c o:h max-h:min(var(--available-height),14rem) min-w:32 py:1 bg:raised bc:line bs-o:pop bw:1 os:none",
              RADIUS.popup[shape],
              animated &&
                "tor:var(--transform-origin) tp:ot tdu:200 ttf:out-quart opening:o:0 wc:s opening:s:97 closing:o:0 closing:s:97 closing:tdu:100 closing:ttf:eo @prm:tp:none",
            )}
          >
            <Scroll className="f:1" viewport="ob:c">
              <Select.List className="p:r">
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={(state) =>
                      merge(
                        "d:f ai:c g:2 h:8 px:2 mx:1 bw:1 bc:transparent fs:sm fvn:tn us:none c:label",
                        state.highlighted ? "bg:well" : "bg:transparent",
                        option.disabled ? "o:60 c:na" : "c:p",
                        RADIUS.item[shape],
                      )
                    }
                  >
                    <span className="d:f w:4 h:4 fs:0">
                      <Select.ItemIndicator className="d:f">
                        <IconCheck aria-hidden className="w:4 h:4" />
                      </Select.ItemIndicator>
                    </span>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Scroll>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function Chevron({ orientation }: ChevronProps) {
  const Icon = orientation === "left" ? IconChevronLeft : IconChevronRight;
  return <Icon aria-hidden className="w:4 h:4" />;
}

function NavButton({ className: _className, ...props }: ComponentProps<"button">) {
  const { shape, outline } = useContext(Look);
  return (
    <Button
      {...props}
      className={merge(
        outline,
        "d:f ai:c jc:c w:7 h:7 bw:1 bc:transparent bg:transparent c:label h:bg:raised h:bs-o:key",
        props["aria-disabled"] ? "o:60 c:na" : "c:p",
        RADIUS.controlInset[shape],
      )}
    />
  );
}

// a range sinks the days between its ends into one well; each end sits on half of it
function Day({ day, modifiers, className: _className, children, ...props }: DayProps) {
  const { mode, shape, weekStartsOn, sliding } = useContext(Look);
  const column = (day.date.getDay() - weekStartsOn + 7) % 7;
  const { range_start: start, range_middle: middle, range_end: end } = modifiers;
  const band =
    mode !== "range" || (start && end)
      ? ""
      : middle
        ? merge("l:0 r:0", column === 0 && RADIUS.controlStart[shape], column === 6 && RADIUS.controlEnd[shape])
        : start && column < 6
          ? "l:50% r:0"
          : end && column > 0
            ? "l:0 r:50%"
            : "";
  return (
    <td
      {...props}
      data-pressed={mode === "single" && sliding && modifiers.selected ? "" : undefined}
      className="p:r p:0"
    >
      {band && <span aria-hidden style={{ top: 1, bottom: 1 }} className={merge("p:a bg:well bs-o:sunk", band)} />}
      {children}
    </td>
  );
}

function DayButton({ day: _day, modifiers, className: _className, children, ...props }: DayButtonProps) {
  const { mode, shape, outline, animated, sliding } = useContext(Look);
  const ref = useRef<HTMLButtonElement>(null);
  // the grid moves focus by marking a day, so the day has to take it
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // a day fills itself where no key slides under it
  const end = (mode === "range" && (modifiers.range_start || modifiers.range_end)) || (mode === "single" && !sliding && modifiers.selected);
  const picked = mode === "single" && modifiers.selected;
  // each state names its own colors, so no class here overrides another
  const look = modifiers.disabled
    ? "bc:transparent bg:transparent c:hint o:60 c:na tdl:lt"
    : end
      ? "bc:fill bg:fill c:on-fill fw:600 bs-o:key-fill c:p"
      : picked
        ? "bc:transparent bg:transparent c:on-fill fw:600 c:p"
        : modifiers.range_middle
          ? "bc:transparent bg:transparent c:label c:p"
          : `bc:transparent bg:transparent h:bg:well c:p ${modifiers.outside ? "c:hint" : "c:label"}`;

  return (
    <Button
      {...props}
      ref={ref}
      className={merge(
        outline,
        `p:r zi:10 d:f ai:c jc:c w:100% h:9 bw:1 fs:sm fvn:tn us:none ${RADIUS.control[shape]} ${look}`,
        animated && !modifiers.disabled && "tp:t tdu:150 ttf:out-quart a:s:98 @prm:tp:none @prm:a:s:100",
      )}
    >
      {children}
      {modifiers.today && (
        <span aria-hidden className="p:a b:1 l:0 r:0 d:f jc:c">
          <span className="w:1 h:1 br:9999 bg:current" />
        </span>
      )}
    </Button>
  );
}

export interface CalendarProps<M extends Mode = "single"> {
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
  /**
   * The picked day's key slides from pick to pick. Off, the picked day fills in
   * place, as suits a popup that closes on the pick.
   */
  sliding?: boolean;
  /**
   * Where the month and year lists are rendered. Defaults to `document.body`;
   * pass an element to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /**
   * The line under the grid: the picked day and a Today key, or the range and
   * its nights.
   */
  footer?: boolean;
  /**
   * Corner radius of the panel and its day keys. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Blocks picking and dims every day. */
  disabled?: boolean;
  /**
   * The picked day's key sliding to the next pick. Turn it off for one that
   * jumps; reduced motion does the same.
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
 * A month of day keys to pick one day or a range: the picked day is one dark
 * key that slides to the next pick, and a range sinks the days between.
 */
export default function Calendar<M extends Mode = "single">({
  mode: modeProp,
  defaultValue,
  value: controlled,
  onValueChange,
  disabledDays,
  disabled = false,
  weekStartsOn = 0,
  startMonth,
  endMonth,
  sliding = true,
  container,
  footer = true,
  shape: shapeProp,
  animated = true,
  focus = true,
  className,
}: CalendarProps<M>) {
  const mode: Mode = modeProp ?? "single";
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [own, setOwn] = useState(defaultValue);
  const value = controlled ?? own;
  const pick = (next: CalendarValue<M> | undefined, day?: Date) => {
    if (controlled === undefined) setOwn(next);
    onValueChange?.(next, day);
  };

  const single = mode === "single" ? (value as Date | undefined) : undefined;
  const range = mode === "range" ? (value as DateRange | undefined) : undefined;
  const [month, setShown] = useState(() => single ?? range?.from ?? new Date());
  const [turn, setTurn] = useState(0);
  const setMonth = (next: Date) => {
    const months = (date: Date) => date.getFullYear() * 12 + date.getMonth();
    setTurn(Math.sign(months(next) - months(month)));
    setShown(next);
  };
  const indicator = useIndicator<HTMLDivElement>(mode === "single" && sliding);

  const today = new Date();
  const nights = range?.from && range.to ? Math.round((range.to.getTime() - range.from.getTime()) / 864e5) : 0;

  const line =
    mode === "single" ? (
      <>
        <span className="as:c">
          {single ? (
            <>
              Picked{" "}
              <b className="c:label fw:500">
                {single.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </b>
            </>
          ) : (
            "Pick a day"
          )}
        </span>
        <Button
          disabled={disabled}
          onClick={() => {
            pick(today as CalendarValue<M>, today);
            setMonth(today);
          }}
          className={merge(
            outline,
            "d:f ai:c h:7 px:3 bw:1 bc:rim bg:raised bs-o:key fs:xs fw:500 c:label h:bg:well",
            disabled ? "o:60 c:na" : "c:p",
            RADIUS.control[shape],
          )}
        >
          Today
        </Button>
      </>
    ) : range?.from && range.to && !sameDay(range.from, range.to) ? (
      <>
        <b className="c:label fw:500">
          {short(range.from)} – {short(range.to)}
        </b>
        <span>
          {nights} {nights === 1 ? "night" : "nights"}
        </span>
      </>
    ) : (
      <span>{range?.from ? "Pick the last day" : "Pick the first day"}</span>
    );

  const common = {
    month,
    onMonthChange: setMonth,
    disabled: disabled || disabledDays,
    weekStartsOn,
    showOutsideDays: true,
    navLayout: "after" as const,
    captionLayout: "dropdown" as const,
    startMonth: startMonth ?? new Date(today.getFullYear() - 100, 0, 1),
    endMonth: endMonth ?? new Date(today.getFullYear() + 10, 11, 31),
    footer: footer ? line : undefined,
    components: { Chevron, Dropdown, Day, DayButton, MonthGrid: Grid, PreviousMonthButton: NavButton, NextMonthButton: NavButton },
    styles: { month_grid: { borderCollapse: "collapse" as const } },
    classNames: {
      root: merge("d:f fd:c g:3 w:76 max-w:100% p:3 bg:raised bw:1 bc:rim c:label", RADIUS.popup[shape], className),
      months: "d:f fd:c",
      month: "d:f fw:w ai:c jc:sb rg:2",
      month_caption: "d:f ai:c h:9",
      dropdowns: "d:f ai:c g:px",
      nav: merge("d:f ai:s g:px p:1 bw:1 bc:line bg:well bs-o:sunk", RADIUS.control[shape]),
      month_grid: "w:100% tl:f",
      weekday: "pb:2 fs:xs fw:500 c:hint ta:c",
      footer: "d:f ai:s jc:sb g:2 pt:3 btw:1 bc:line fs:sm c:hint fvn:tn",
    },
  };

  return (
    <Look
      value={{ mode, shape, outline, weekStartsOn, animated, sliding, container, indicator, turn, shown: `${month.getFullYear()}-${month.getMonth()}` }}
    >
      {mode === "range" ? (
        <DayPicker
          {...common}
          mode="range"
          selected={range}
          onSelect={(next, day) => pick(next as CalendarValue<M> | undefined, day)}
        />
      ) : (
        <DayPicker
          {...common}
          mode="single"
          selected={single}
          onSelect={(next, day) => pick(next as CalendarValue<M> | undefined, day)}
        />
      )}
    </Look>
  );
}
