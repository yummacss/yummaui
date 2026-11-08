"use client";

import Button from "./button";
import Card from "./card";

export default function CardRevenue() {
  return (
    <Card
      title="Monthly revenue"
      description="Across every plan, after refunds."
     
      className="w:88 max-w:100%"
      actions={
        <>
          <Button variant="secondary" size="sm">
            Export
          </Button>
          <Button size="sm">
            View report
          </Button>
        </>
      }
    >
      <div className="d:f ai:b g:2">
        <span className="fs:3xl fw:600 fvn:tn">$48,210</span>
        <span className="c:green-6 fs:sm fw:500">+12.4%</span>
      </div>
    </Card>
  );
}
