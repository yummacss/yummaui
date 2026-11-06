"use client";

import { Button } from "@base-ui/react/button";
import { IconBackspace } from "@tabler/icons-react";
import { type KeyboardEvent, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

type Variant = "pin" | "amount";

const KEY =
  "d:f ai:c jc:c h:14 bw:1 bc:rim bg:raised bs-o:key c:label fs:xxl fw:500 fvn:tn us:none c:p tp:ct tdu:150 ttf:io a:s:96 a:bg:well @prm:tp:none @prm:a:s:100";
const QUIET =
  "d:f ai:c jc:c h:14 bg:transparent c:hint h:c:label us:none c:p tp:ct tdu:150 ttf:io a:s:96 @prm:tp:none @prm:a:s:100";

export interface KeypadProps {
  /** A PIN of a fixed length, shown as dots, or an amount with its currency. */
  variant?: Variant;
  /** The typed digits, controlled. Pair with `onValueChange`. */
  value?: string;
  /** The typed digits on first render, uncontrolled. */
  defaultValue?: string;
  /** Called with the digits whenever they change. */
  onValueChange?: (value: string) => void;
  /** How many digits a PIN takes. */
  length?: number;
  /** Called once a PIN reaches `length`. */
  onComplete?: (value: string) => void;
  /** The currency an amount is in, as an ISO code. */
  currency?: string;
  /** Formats the amount's grouping, decimal mark and currency sign. */
  locale?: string;
  /** The line over the display, and the keypad's accessible name. */
  label?: string;
  /** Corner radius of the keys. Inherits the nearest `Shape`. */
  shape?: Shape;
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
 * Digits as raised keys, for a PIN shown as dots or an amount in its currency.
 * Every key is a button in the Tab order, and the keyboard types digits while
 * any key has focus.
 */
export default function Keypad({
  variant = "pin",
  value: controlled,
  defaultValue = "",
  onValueChange,
  length = 4,
  onComplete,
  currency = "USD",
  locale = "en-US",
  label = variant === "pin" ? "Enter your PIN" : "Amount",
  shape: shapeProp,
  focus = true,
  className,
}: KeypadProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const pin = variant === "pin";

  const set = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
    if (pin && next.length === length) onComplete?.(next);
  };

  const type = (key: string) => {
    if (key === "back") return set(value.slice(0, -1));
    if (pin) return value.length < length && set(value + key);
    const [whole, cents] = value.split(".");
    if (key === ".") return cents === undefined && set((whole || "0") + ".");
    if (cents !== undefined && cents.length >= 2) return;
    if (whole === "0" && cents === undefined) return set(key);
    if (whole.length >= 9 && cents === undefined) return;
    set(value + key);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (/^[0-9]$/.test(event.key)) type(event.key);
    else if (event.key === "Backspace") type("back");
    else if (!pin && (event.key === "." || event.key === ",")) type(".");
    else return;
    event.preventDefault();
  };

  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);
  const sign = parts.find((part) => part.type === "currency")?.value ?? "";
  const mark = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const signFirst = parts.findIndex((part) => part.type === "currency") === 0;
  const [whole = "", cents] = value.split(".");
  const grouped = new Intl.NumberFormat(locale).format(Number(whole || "0"));
  const typedCents = cents ?? "";
  const ghost = (cents === undefined ? mark : "") + "00".slice(typedCents.length);
  const spoken = pin
    ? `${value.length} of ${length} digits entered`
    : new Intl.NumberFormat(locale, { style: "currency", currency }).format(
        Number(value || "0"),
      );

  const keys = [
    ..."123456789".split(""),
    pin ? "" : ".",
    "0",
    "back",
  ];

  return (
    // typed digits bubble up from whichever key has focus
    <div
      role="group"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={merge("d:f fd:c ai:c g:5 w:64 c:label", className)}
    >
      <div className="d:f fd:c ai:c jc:c g:2 h:16">
        <span className="fs:xs c:hint">{label}</span>
        {pin ? (
          <div className="d:f g:3">
            {Array.from({ length }, (_, index) => (
              <span
                key={index}
                className={`w:3 h:3 br:9999 ${index < value.length ? "bg:fill" : "bw:1 bc:hint"}`}
              />
            ))}
          </div>
        ) : (
          <span className="fs:4xl fw:600 ls:2 lh:1 fvn:tn ws:nw">
            {signFirst && sign}
            {grouped}
            {cents !== undefined && mark}
            {typedCents}
            <span className="c:hint">{ghost}</span>
            {!signFirst && ` ${sign}`}
          </span>
        )}
        <span aria-live="polite" className="p:a w:px h:px o:h">
          {spoken}
        </span>
      </div>
      <div className="d:g gtc:3 g:2 w:100%">
        {keys.map((key, index) =>
          key === "" ? (
            <span key={index} />
          ) : (
            <Button
              key={key}
              aria-label={key === "back" ? "Delete" : key === "." ? "Decimal point" : key}
              onClick={() => type(key)}
              className={merge(outline, key === "back" ? QUIET : KEY, RADIUS.control[shape])}
            >
              {key === "back" ? (
                <IconBackspace aria-hidden className="w:6 h:6" />
              ) : key === "." ? (
                mark
              ) : (
                key
              )}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
