"use client";

import { useEffect, useState } from "react";
import Stat from "./stat";

const format = new Intl.NumberFormat("en-US");

export default function StatLive() {
  const [photos, setPhotos] = useState([2840, 2911, 2967, 3012, 3088, 3140, 3196, 3248]);

  // a backup in progress: a few photos land every couple of seconds
  useEffect(() => {
    const timer = setInterval(
      () => setPhotos((now) => [...now.slice(1), now[now.length - 1] + 3 + Math.round(Math.random() * 37)]),
      2200,
    );
    return () => clearInterval(timer);
  }, []);

  const latest = photos[photos.length - 1];
  const growth = ((latest - photos[0]) / photos[0]) * 100;

  return (
    <Stat
      label="Photos backed up"
      value={format.format(latest)}
      change={`${growth.toFixed(1)}%`}
      direction="up"
      tone="positive"
      trend={photos}
      className="w:64"
    />
  );
}
