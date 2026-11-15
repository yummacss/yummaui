import type { ReactNode } from "react";
import { merge } from "yummacss/merge";

type Layout = "beside" | "stacked";

export interface DataListItem {
  /** What the value is, such as "Size". */
  label: ReactNode;
  /** The value itself: text, a badge, a status. */
  value: ReactNode;
}

export interface DataListProps {
  /** The pairs, top to bottom: each a `label` and a `value`. */
  items: DataListItem[];
  /**
   * `beside` puts each label in a column on the left; `stacked` puts it above
   * its value, for long values or a narrow column.
   */
  layout?: Layout;
  /** A line between rows. */
  divided?: boolean;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

const ROW: Record<Layout, string> = {
  beside: "d:f ai:b g:3",
  stacked: "d:f fd:c g:1",
};

// beside, every label takes the same width, so the values line up in a column
const LABEL: Record<Layout, string> = {
  beside: "w:30 fs:0",
  stacked: "",
};

/** Labels and their values down a list, such as a file's details. */
export default function DataList({ items, layout = "beside", divided = true, className }: DataListProps) {
  return (
    <dl className={merge("d:g m:0 min-w:0", className)}>
      {items.map((item, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: the list is rendered as given
          key={index}
          className={merge(ROW[layout], "py:3", divided && index > 0 && "btw:1 bc:line")}
        >
          <dt className={merge("fs:sm c:hint", LABEL[layout])}>{item.label}</dt>
          <dd className="f:1 m:0 min-w:0 fs:sm c:label fvn:tn ow:bw">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
