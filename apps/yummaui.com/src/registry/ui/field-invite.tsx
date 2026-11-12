"use client";

import { useState } from "react";
import Button from "./button";
import Field from "./field";
import Form from "./form";

export default function FieldInvite() {
  const [success, setSuccess] = useState<string>();

  return (
    <Form
      className="g:3 w:80 max-w:100%"
      onSubmit={({ email }) => {
        const address = typeof email === "string" ? email.trim() : "";
        setSuccess(undefined);
        // the browser accepts an address with no ending, so the form checks it
        if (!/\.[a-z]{2,}$/i.test(address))
          return { email: "Add the ending after the dot, such as .com or .dev." };
        setSuccess(`Invite sent to ${address}.`);
      }}
    >
      <Field
        name="email"
        type="email"
        label="Email"
        defaultValue="grace@hopper"
        description="We send the invite here."
        success={success}
        onChange={() => setSuccess(undefined)}
        required
      />
      <Button type="submit">Send invite</Button>
    </Form>
  );
}
