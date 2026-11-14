"use client";

import { useEffect, useState } from "react";
import UsageMeter from "./usage-meter";

export default function UsageMeterLive() {
  const [used, setUsed] = useState(38);

  // the week fills up a little at a time, then starts over
  useEffect(() => {
    const timer = setInterval(
      () => setUsed((now) => (now >= 74 ? 38 : now + 3 + Math.round(Math.random() * 4))),
      2200,
    );
    return () => clearInterval(timer);
  }, []);

  return <UsageMeter value={used} resets="Resets Monday at 9:00" />;
}
