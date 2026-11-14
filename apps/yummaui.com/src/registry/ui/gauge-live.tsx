"use client";

import { useEffect, useState } from "react";
import Gauge from "./gauge";

export default function GaugeLive() {
  const [used, setUsed] = useState(72);

  // photos keep syncing in, then a cleanup frees the space again
  useEffect(() => {
    const timer = setInterval(
      () => setUsed((now) => (now >= 90 ? 72 : now + 1 + Math.round(Math.random() * 3))),
      2400,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <Gauge
      value={used}
      max={100}
      label="Storage"
      unit="GB"
      description={`${used} of 100 GB used`}
      warning={85}
      size="lg"
    />
  );
}
