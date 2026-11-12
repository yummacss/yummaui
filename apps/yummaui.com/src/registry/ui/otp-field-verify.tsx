"use client";

import { useState } from "react";
import OTPField from "./otp-field";

const CODE = "204816";

export default function OTPFieldVerify() {
  const [tries, setTries] = useState(3);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  return (
    <OTPField
      label="Verification code"
      description="Sent to your phone. Here, the code is 204816."
      error={error}
      success={success}
      onValueChange={(code) => {
        // typing again takes the old error away, so the next wrong code shakes anew
        if (code.length > 0 && code.length < CODE.length) setError(undefined);
        if (code.length < CODE.length) return;
        if (code === CODE) {
          setError(undefined);
          setSuccess("Verified");
          return;
        }
        const left = Math.max(tries - 1, 0);
        setTries(left);
        setError(
          left > 0
            ? `That code did not work. ${left} ${left === 1 ? "try" : "tries"} left.`
            : "That code did not work. Request a new one.",
        );
      }}
    />
  );
}
