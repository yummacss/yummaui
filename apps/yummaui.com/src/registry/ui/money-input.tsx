"use client";

import { NumberField } from "@base-ui/react/number-field";
import { Select } from "@base-ui/react/select";
import {
  IconCheck,
  IconChevronDown,
  IconCurrencyDollar,
  IconCurrencyDollarAustralian,
  IconCurrencyDollarCanadian,
  IconCurrencyEuro,
  IconCurrencyFrank,
  IconCurrencyKroneSwedish,
  IconCurrencyPeso,
  IconCurrencyPound,
  IconCurrencyReal,
  IconCurrencyRupee,
  IconCurrencyYen,
  IconCurrencyYuan,
} from "@tabler/icons-react";
import AU from "country-flag-icons/react/3x2/AU";
import BR from "country-flag-icons/react/3x2/BR";
import CA from "country-flag-icons/react/3x2/CA";
import CH from "country-flag-icons/react/3x2/CH";
import CN from "country-flag-icons/react/3x2/CN";
import EU from "country-flag-icons/react/3x2/EU";
import GB from "country-flag-icons/react/3x2/GB";
import IN from "country-flag-icons/react/3x2/IN";
import JP from "country-flag-icons/react/3x2/JP";
import MX from "country-flag-icons/react/3x2/MX";
import SE from "country-flag-icons/react/3x2/SE";
import US from "country-flag-icons/react/3x2/US";
import { type ComponentType, useId, useState } from "react";
import { merge } from "yummacss/merge";
import {
  FOCUS,
  INPUT_TEXT,
  RADIUS,
  type Shape,
  type Size,
  SIZE,
  useShape,
} from "./style";

type Glyph = ComponentType<{ className?: string }>;

// each known currency's flag and sign; any other code shows its text sign alone
const KNOWN: Record<string, { flag: Glyph; sign: Glyph }> = {
  AUD: { flag: AU, sign: IconCurrencyDollarAustralian },
  BRL: { flag: BR, sign: IconCurrencyReal },
  CAD: { flag: CA, sign: IconCurrencyDollarCanadian },
  CHF: { flag: CH, sign: IconCurrencyFrank },
  CNY: { flag: CN, sign: IconCurrencyYuan },
  EUR: { flag: EU, sign: IconCurrencyEuro },
  GBP: { flag: GB, sign: IconCurrencyPound },
  INR: { flag: IN, sign: IconCurrencyRupee },
  JPY: { flag: JP, sign: IconCurrencyYen },
  MXN: { flag: MX, sign: IconCurrencyPeso },
  SEK: { flag: SE, sign: IconCurrencyKroneSwedish },
  USD: { flag: US, sign: IconCurrencyDollar },
};

// the box draws the outline only while the amount has focus, not the picker
const TYPING = "os:s ow:3 oo:0 oc:focus/40 bc:focus";

function Flag({ code }: { code: string }) {
  const Mark = KNOWN[code]?.flag;
  if (!Mark) return null;
  return (
    <span aria-hidden className="d:f w:6 h:4 fs:0 o:h br:xs bw:1 bc:rim">
      <Mark className="w:100% h:100%" />
    </span>
  );
}

function Sign({ code, locale }: { code: string; locale: string }) {
  const Icon = KNOWN[code]?.sign;
  if (Icon) return <Icon aria-hidden className="w:4 h:4 fs:0 ml:3 c:hint" />;
  const text = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value;
  return (
    <span aria-hidden className="ml:3 c:hint">
      {text ?? code}
    </span>
  );
}

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
  /**
   * The ISO codes the picker offers, each with its flag where one is known.
   * One code hides the picker.
   */
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
 * An amount with its currency, picked by flag and code at the start of the
 * field and grouped for the locale when the field is left.
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
  const [typing, setTyping] = useState(false);

  const digits =
    new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2;
  const names = new Intl.DisplayNames([locale], { type: "currency" });

  const pick = (next: string | null) => {
    if (!next) return;
    setInternalCurrency(next);
    onCurrencyChange?.(next);
  };

  const outline =
    focus && typing
      ? merge(TYPING, focus === true ? "" : focus.replace(/\bfv:/g, ""))
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

      <div
        className={merge(
          "d:f ai:c bg:field bs-o:key bw:1",
          error ? "bc:red-5" : "bc:rim",
          INPUT_TEXT,
          SIZE.height[size],
          SIZE.width[size],
          RADIUS.control[shape],
          outline,
          className,
        )}
      >
        {pickable && (
          <Select.Root value={currency} onValueChange={pick} disabled={disabled}>
            <Select.Trigger
              aria-label={`Currency, ${names.of(currency) ?? currency}`}
              className={merge(
                itemOutline,
                "d:f ai:c g:2 h:100% pl:3 pr:2 bw:0 brw:1 bc:rim bg:transparent c:label fw:500 fs:sm us:none c:p h:bg:well",
              )}
            >
              <Flag code={currency} />
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
                        <Flag code={code} />
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
        {!pickable && (
          <span className="d:f ai:c g:2 h:100% pl:3 pr:2 brw:1 bc:rim fw:500 fs:sm">
            <Flag code={currency} />
            {currency}
          </span>
        )}
        <Sign code={currency} locale={locale} />
        <NumberField.Group className="d:f f:1 min-w:0 h:100%">
          <NumberField.Input
            aria-invalid={error ? true : undefined}
            aria-label={label ? undefined : `Amount in ${names.of(currency) ?? currency}`}
            placeholder={(0).toFixed(digits)}
            onFocus={() => setTyping(true)}
            onBlur={() => setTyping(false)}
            className={`f:1 min-w:0 h:100% pl:2 pr:3 bw:0 bg:transparent c:label os:none fvn:tn ${INPUT_TEXT}`}
          />
        </NumberField.Group>
      </div>

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
