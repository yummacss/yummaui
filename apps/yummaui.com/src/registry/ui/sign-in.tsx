"use client";

import { Form } from "@base-ui/react/form";
import { IconKey } from "@tabler/icons-react";
import { type FormEvent, useState } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";
import Field from "./field";

type Shape = "rounded" | "square" | "squircle";

const CARD_SHAPES: Record<Shape, string> = {
  rounded: "br:xl",
  square: "br:0",
  squircle: "br:3xl cs:s",
};

const LINK =
  "c:label fw:500 tuo:2 td:u h:c:hint fv:os:s fv:ow:2 fv:oc:focus/40 br:sm";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignInValues {
  email: string;
  password: string;
}

export interface SignInProps {
  /** The heading. */
  title?: string;
  /** A line under the heading. */
  description?: string;
  /**
   * Called with the email and password once both are filled in and the email
   * reads as one. Return or resolve a message to show it under the password and
   * shake the form.
   */
  onSignIn?: (
    values: SignInValues,
  ) => string | undefined | Promise<string | undefined>;
  /**
   * The label of a second way in under the form. No button renders without it.
   */
  passkeyLabel?: string;
  /** Called when the passkey button is pressed. */
  onPasskey?: () => void;
  /** Where "Forgot password?" leads. No link renders without it. */
  forgotHref?: string;
  /** Where "Create an account" leads. No line renders without it. */
  signUpHref?: string;
  /** Corner radius of the card. Its fields and buttons keep their own. */
  shape?: Shape;
  /**
   * The form shakes when it is sent with a mistake. Turn it off for a form that
   * stays still; it is off anyway when the user has asked for reduced motion.
   */
  animated?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * A sign-in card: email, password with a show toggle, an optional passkey and
 * the links around them. A mistake shakes the form instead of only printing a
 * message.
 */
export default function SignIn({
  title = "Sign in",
  description,
  onSignIn,
  passkeyLabel,
  onPasskey,
  forgotHref,
  signUpHref,
  shape = "square",
  animated = true,
  className,
}: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);

  const fail = (next: { email?: string; password?: string }) => {
    setErrors(next);
    setAttempt((count) => count + 1);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!EMAIL.test(email.trim()))
      next.email = "Enter an email address, like name@example.com.";
    if (!password) next.password = "Enter your password.";
    if (next.email || next.password) return fail(next);

    setErrors({});
    setPending(true);
    try {
      const message = await onSignIn?.({ email: email.trim(), password });
      if (message) fail({ password: message });
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className={merge(
        "d:f fd:c g:6 w:100% max-w:96 p:8 bg:raised bw:1 bc:rim c:label",
        CARD_SHAPES[shape],
        className,
      )}
    >
      <div className="d:f fd:c g:1">
        <h2 className="m:0 tw:b fs:xl fw:500">{title}</h2>
        {description && <p className="m:0 tw:p fs:sm c:hint">{description}</p>}
      </div>

      <Form onSubmit={submit} noValidate className="d:f fd:c g:5">
        <div
          key={attempt}
          className={`d:f fd:c g:4 ${
            animated && attempt > 0
              ? "an:shake adu:400 atf:io @prm:an:none"
              : ""
          }`}
        >
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            error={errors.email}
            className="w:100%"
          />
          <div className="d:f fd:c g:2">
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              revealable
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              error={errors.password}
              className="w:100%"
            />
            {forgotHref && (
              <a href={forgotHref} className={`as:fe fs:sm ${LINK}`}>
                Forgot password?
              </a>
            )}
          </div>
        </div>

        <Button type="submit" loading={pending} className="w:100%">
          Sign in
        </Button>
      </Form>

      {passkeyLabel && (
        <>
          <div className="d:f ai:c g:3 c:hint fs:xs">
            <span className="f:1 h:0 btw:1 bc:line" />
            or
            <span className="f:1 h:0 btw:1 bc:line" />
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={<IconKey className="w:4 h:4" />}
            onClick={onPasskey}
            className="w:100%"
          >
            {passkeyLabel}
          </Button>
        </>
      )}

      {signUpHref && (
        <p className="m:0 fs:sm c:hint ta:c">
          New here?{" "}
          <a href={signUpHref} className={LINK}>
            Create an account
          </a>
        </p>
      )}
    </div>
  );
}
