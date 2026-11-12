"use client";

import { IconSend } from "@tabler/icons-react";
import { useState } from "react";
import Button from "./button";
import Field from "./field";
import Form from "./form";

export default function FieldInvite() {
  const [success, setSuccess] = useState<string>();

  return (
    <Form
      className="d:f fd:r ai:fs g:2 w:80 max-w:100%"
      onSubmit={({ email }) => {
        const address = typeof email === "string" ? email.trim() : "";
        setSuccess(undefined);
        // the browser accepts an address with no ending, so the form checks it
        if (!/\.[a-z]{2,}$/i.test(address))
          return { email: "Add the ending after the dot, such as .com or .dev." };
        setSuccess(`Invite sent to ${address}.`);
      }}
    >
      <div className="f:1 min-w:0">
        <Field
          name="email"
          type="email"
          label="Email"
          defaultValue="grace@hopper"
          description="We send the invite here."
          success={success}
          onChange={() => setSuccess(undefined)}
          className="w:100%"
          required
        />
      </div>
      {/* one label line and the field's gap, so the key lines up with the input */}
      <div className="fs:sm pt:calc(1lh)">
        <Button type="submit" icon={<IconSend className="w:4 h:4" />} iconOnly className="mt:2">
          Send invite
        </Button>
      </div>
    </Form>
  );
}
