"use client";

import ActivityHeatmap, { type ActivityDay } from "./activity-heatmap";

const END = Date.parse("2026-11-05");

// a steady, seeded year: busier midweek, quiet at weekends
let seed = 7;
const random = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const data: ActivityDay[] = Array.from({ length: 371 }, (_, index) => {
  const time = END - index * 86_400_000;
  const weekend = [0, 6].includes(new Date(time).getUTCDay());
  const wave = 0.5 + 0.5 * Math.sin((index / 371) * Math.PI * 3);
  const count = Math.round(random() * (weekend ? 3 : 10) * (0.4 + wave));
  return { date: new Date(time).toISOString().slice(0, 10), count };
});

export default function ActivityHeatmapDeploys() {
  return (
    <ActivityHeatmap
      data={data}
      end="2026-11-05"
      label="Deploys"
      unit="deploys"
      size="sm"
      weeks={46}
    />
  );
}
