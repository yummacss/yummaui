"use client";

import { IconCheck } from "@tabler/icons-react";
import { merge } from "yummacss/merge";

export interface ProgressStep {
  /** The step's name. */
  title: string;
  /** When it happened or is due, as people read it. */
  time?: string;
  /** The same moment, machine-readable, for the `<time>` element. */
  dateTime?: string;
}

export interface ProgressStates {
  /** Under a finished step. */
  done?: string;
  /** Under the step in progress. */
  current?: string;
  /** Under a step still to come. */
  next?: string;
}

export interface ProgressTimelineProps {
  /** The steps, first to last. */
  steps: ProgressStep[];
  /** The index of the step in progress. Every step before it is done. */
  currentStep: number;
  /**
   * What each state is called under its step, so color is never the only sign
   * of one.
   */
  states?: ProgressStates;
  /** Names the list for screen readers. */
  label?: string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * Steps down a line as an ordered list: done ones checked, the current one
 * ringed and marked for screen readers, the rest hollow.
 */
export default function ProgressTimeline({
  steps,
  currentStep,
  states,
  label = "Progress",
  className,
}: ProgressTimelineProps) {
  const names = { done: "Done", current: "In progress", next: "Next", ...states };

  return (
    <ol aria-label={label} className={merge("d:f fd:c m:0 p:0 lst:none c:label fs:sm", className)}>
      {steps.map((step, index) => {
        const state = index < currentStep ? "done" : index === currentStep ? "current" : "next";
        const last = index === steps.length - 1;
        return (
          <li
            key={step.title}
            aria-current={state === "current" ? "step" : undefined}
            className="d:f g:3"
          >
            <div className="d:f fd:c ai:c fs:0">
              <span
                aria-hidden
                className={merge(
                  "d:f ai:c jc:c w:5 h:5 br:9999",
                  state === "done" && "bg:fill c:on-fill",
                  state === "current" && "bg:raised bw:5 bc:fill",
                  state === "next" && "bg:raised bw:1 bc:rim",
                )}
              >
                {state === "done" && <IconCheck className="w:3 h:3" stroke={3} />}
              </span>
              {!last && (
                <span
                  aria-hidden
                  className={`f:1 w:px my:1 ${state === "done" ? "bg:fill" : "bg:line"}`}
                />
              )}
            </div>
            <div className={`f:1 min-w:0 d:f ai:fs jc:sb g:3 ${last ? "" : "pb:6"}`}>
              <div className="d:f fd:c g:1">
                <span
                  className={
                    state === "current" ? "fw:600" : state === "done" ? "fw:500" : "c:hint"
                  }
                >
                  {step.title}
                </span>
                <span className="fs:xs c:hint">{names[state]}</span>
              </div>
              {step.time && (
                <time dateTime={step.dateTime} className="fs:xs c:hint fvn:tn ws:nw">
                  {step.time}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
