"use client";

import { Form as BaseForm } from "@base-ui/react/form";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { shake } from "./style";

type Errors = Record<string, string | string[]>;

export interface FormProps {
  /** Fields, fieldsets and buttons. */
  children?: ReactNode;
  /**
   * Called with every named field's value once the browser's own checks pass.
   * Return errors by field name to show them under those fields.
   */
  onSubmit?: (
    values: Record<string, unknown>,
  ) => Errors | void | Promise<Errors | void>;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A form that checks its fields on submit and shows each error under the field
 * it belongs to.
 */
export default function Form({ children, onSubmit, className }: FormProps) {
  const [errors, setErrors] = useState<Errors>({});
  const form = useRef<HTMLFormElement>(null);
  // every field that comes back invalid shakes, after the browser's checks and after onSubmit's
  const shakeInvalid = () =>
    requestAnimationFrame(() =>
      shake(form.current?.querySelectorAll("[data-invalid] [data-shake]")),
    );
  useEffect(() => {
    if (Object.keys(errors).length > 0) shakeInvalid();
  }, [errors]);

  return (
    <BaseForm
      ref={form}
      onSubmitCapture={shakeInvalid}
      errors={errors}
      onFormSubmit={async (values) => setErrors((await onSubmit?.(values)) ?? {})}
      className={merge("d:f fd:c g:8", className)}
    >
      {children}
    </BaseForm>
  );
}
