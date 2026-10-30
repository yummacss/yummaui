"use client";

import { IconClockFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Button from "./button";
import Progress from "./progress";

// an upload moves in bursts and stalls between them, so each step is a chunk
// and a wait, not a steady tick
const STEPS = [
  { to: 6, after: 600 },
  { to: 19, after: 900 },
  { to: 35, after: 800 },
  { to: 51, after: 2200 },
  { to: 58, after: 700 },
  { to: 74, after: 1100 },
  { to: 88, after: 1600 },
  { to: 96, after: 900 },
  { to: 100, after: 1300 },
];

export default function ProgressUpload() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const value = step === 0 ? 0 : STEPS[step - 1].to;
  const done = step === STEPS.length;

  useEffect(() => {
    if (paused || done) return;
    const timer = setTimeout(() => setStep(step + 1), STEPS[step].after);
    return () => clearTimeout(timer);
  }, [paused, done, step]);

  const seconds = Math.ceil(
    STEPS.slice(step).reduce((total, next) => total + next.after, 0) / 1000,
  );

  return (
    <div className="d:g g:3 w:100% max-w:64">
      <Progress
        value={value}
        label={done ? "Uploaded 5 of 5 files" : "Uploading 5 files"}
      />
      <div className="d:f ai:c jc:sb">
        <span className="d:f ai:c g:1 fs:sm c:hint fvn:tn">
          <IconClockFilled className="w:4 h:4" />
          {done ? "Done" : paused ? "Paused" : `About ${seconds} seconds left`}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (done) {
              setStep(0);
              setPaused(false);
            } else setPaused(!paused);
          }}
        >
          {done ? "Start again" : paused ? "Resume" : "Pause"}
        </Button>
      </div>
    </div>
  );
}
