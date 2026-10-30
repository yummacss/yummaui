"use client";

import { IconClockFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Button from "./button";
import Progress from "./progress";

// a percent every 400ms, so a full bar takes 40 seconds
const STEP_MS = 400;

export default function ProgressUpload() {
  const [value, setValue] = useState(60);
  const [paused, setPaused] = useState(false);
  const done = value >= 100;

  useEffect(() => {
    if (paused || done) return;
    const timer = setInterval(
      () => setValue((current) => Math.min(100, current + 1)),
      STEP_MS,
    );
    return () => clearInterval(timer);
  }, [paused, done]);

  const seconds = Math.ceil(((100 - value) * STEP_MS) / 1000);

  return (
    <div className="d:g g:3 w:100% max-w:64">
      <Progress
        value={value}
        label={done ? "Uploaded 5 of 5 files" : "Uploading 3 of 5 files"}
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
              setValue(0);
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
