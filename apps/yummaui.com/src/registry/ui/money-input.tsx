"use client";

import { NumberField } from "@base-ui/react/number-field";
import { Select } from "@base-ui/react/select";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useId, useState } from "react";
import { merge } from "yummacss/merge";
import {
  FOCUS,
  FOCUS_WITHIN,
  INPUT_TEXT,
  RADIUS,
  type Shape,
  type Size,
  SIZE,
  useShape,
} from "./style";

export interface MoneyInputProps {
  /** Text above the field, wired to it as its accessible name. */
  label?: string;
  /** A line under the field. */
  description?: string;
  /** Marks the field invalid and shows this under it in place of `description`. */
  error?: string;
  /** The amount, controlled. Pair with `onValueChange`. */
  value?: number | null;
  /** The amount on first render, uncontrolled. */
  defaultValue?: number | null;
  /** Called with the amount, or `null` when the field is cleared. */
  onValueChange?: (value: number | null) => void;
  /** The currency, as an ISO code, controlled. Pair with `onCurrencyChange`. */
  currency?: string;
  /** The currency on first render, uncontrolled. */
  defaultCurrency?: string;
  /** Called with the ISO code when another currency is picked. */
  onCurrencyChange?: (currency: string) => void;
  /** The ISO codes the picker offers. One code hides the picker. */
  currencies?: string[];
  /** Formats the grouping, the decimal mark and the currency names. */
  locale?: string;
  /** Marks the field required and adds an asterisk to the label. */
  required?: boolean;
  /** Blocks the field and the picker and dims both. */
  disabled?: boolean;
  /** Height & width of the field. */
  size?: Size;
  /** Corner radius of the field and its popup. Inherits the nearest `Shape`. */
  shape?: Shape;
  /**
   * The picker list rendering inside this element instead of the page, for a
   * frame or a container that owns its own stacking context.
   */
  container?: HTMLElement | null;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it. Removing it outright and putting nothing
   * back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes on the field. `merge` folds them in last, so one here
   * replaces the component's own class for the same utility.
   */
  className?: string;
}

/**
 * An amount with its currency, picked from a list at the start of the field
 * and grouped for the locale when the field is left.
 */
export default function MoneyInput({
  label,
  description,
  error,
  value,
  defaultValue = null,
  onValueChange,
  currency: controlledCurrency,
  defaultCurrency = "USD",
  onCurrencyChange,
  currencies = ["USD", "EUR", "GBP", "JPY"],
  locale = "en-US",
  required = false,
  disabled = false,
  size = "md",
  shape: shapeProp,
  container,
  focus = true,
  className,
}: MoneyInputProps) {
  const shape = useShape(shapeProp);
  const id = useId();
  const [internalCurrency, setInternalCurrency] = useState(defaultCurrency);
  const currency = controlledCurrency ?? internalCurrency;
  const pickable = currencies.length > 1;

  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  });
  const sign =
    money.formatToParts(0).find((part) => part.type === "currency")?.value ??
    currency;
  const digits = money.resolvedOptions().maximumFractionDigits ?? 2;
  const names = new Intl.DisplayNames([locale], { type: "currency" });

  const pick = (next: string | null) => {
    if (!next) return;
    setInternalCurrency(next);
    onCurrencyChange?.(next);
  };

  const outline = focus
    ? merge(FOCUS_WITHIN, focus === true ? "" : focus.replace(/\bfv:/g, "fw:"))
    : "";
  const itemOutline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";

  return (
    <NumberField.Root
      id={id}
      value={value}
      defaultValue={defaultValue ?? undefined}
      onValueChange={onValueChange}
      format={{ minimumFractionDigits: digits, maximumFractionDigits: digits }}
      locale={locale}
      min={0}
      required={required}
      disabled={disabled}
      className={`d:f fd:c g:2 c:label fs:sm ${disabled ? "o:60 c:na" : ""}`}
    >
      {label && (
        <label htmlFor={id} className="fw:500">
          {label}
          {required && <span className="c:red-5"> *</span>}
        </label>
      )}

      <NumberField.Group
        className={merge(
          outline,
          "d:f ai:c o:h bg:field bs-o:key bw:1",
          error ? "bc:red-5" : "bc:rim",
          INPUT_TEXT,
          SIZE.height[size],
          SIZE.width[size],
          RADIUS.control[shape],
          className,
        )}
      >
        {pickable && (
          <Select.Root value={currency} onValueChange={pick} disabled={disabled}>
            <Select.Trigger
              aria-label={`Currency, ${names.of(currency) ?? currency}`}
              className={merge(
                itemOutline,
                "d:f ai:c g:1 h:100% pl:3 pr:2 bw:0 brw:1 bc:rim bg:transparent c:label fw:500 fs:sm us:none c:p h:bg:well",
              )}
            >
              <Select.Value>{currency}</Select.Value>
              <Select.Icon className="d:f c:hint">
                <IconChevronDown className="w:4 h:4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal container={container}>
              <Select.Positioner sideOffset={8} align="start" alignItemWithTrigger={false} className="zi:50">
                <Select.Popup
                  className={`d:f fd:c o:h py:1 w:56 bg:raised bc:line bs-o:pop bw:1 tor:var(--transform-origin) tp:ot tdu:200 ttf:out-quart opening:o:0 opening:s:95 closing:o:0 closing:s:95 closing:tdu:100 closing:ttf:eo @prm:tp:none ${RADIUS.popup[shape]}`}
                >
                  <Select.List>
                    {currencies.map((code) => (
                      <Select.Item
                        key={code}
                        value={code}
                        className={(state) =>
                          `d:f ai:c g:2 h:8 px:2 mx:1 ${RADIUS.item[shape]} fs:sm us:none c:p c:label ${state.highlighted ? "bg:well" : "bg:transparent"}`
                        }
                      >
                        <span className="d:f ai:c w:4 h:4 fs:0">
                          <Select.ItemIndicator className="d:f ai:c">
                            <IconCheck className="w:4 h:4" />
                          </Select.ItemIndicator>
                        </span>
                        <Select.ItemText className="fw:500">{code}</Select.ItemText>
                        <span className="c:hint to:e o:h ws:nw">{names.of(code)}</span>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        )}
        <span aria-hidden className="pl:3 c:hint">
          {sign}
        </span>
        <NumberField.Input
          aria-invalid={error ? true : undefined}
          placeholder={(0).toFixed(digits)}
          className={`f:1 min-w:0 h:100% pl:1 pr:3 bw:0 bg:transparent c:label os:none fvn:tn ${INPUT_TEXT}`}
        />
      </NumberField.Group>

      {error ? (
        <p role="alert" className="m:0 fs:xs c:red-7">
          {error}
        </p>
      ) : (
        description && <p className="m:0 fs:xs c:hint">{description}</p>
      )}
    </NumberField.Root>
  );
}
