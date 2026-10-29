"use client";

import { Form } from "@base-ui/react/form";
import { type FormEvent, useState } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";
import Field from "./field";
import Select from "./select";
import Switch from "./switch";

export interface SettingsValues {
  name: string;
  email: string;
  language: string;
  weekStart: string;
  comments: boolean;
  shared: boolean;
  summary: boolean;
}

const DEFAULTS: SettingsValues = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  language: "en",
  weekStart: "monday",
  comments: true,
  shared: true,
  summary: false,
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const WEEK_STARTS = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
  { value: "saturday", label: "Saturday" },
];

const SECTION = "d:g g:6 py:8 btw:1 bc:line @md:gtc:3 @md:g:10";
const SECTION_HEAD = "d:f fd:c g:1";
const SECTION_BODY = "d:f fd:c g:5 @md:gc-s:2";

export interface SettingsPageProps {
  /** The page heading. */
  title?: string;
  /** A line under the heading. */
  description?: string;
  /** What the form starts with, and what Discard goes back to. */
  defaultValues?: Partial<SettingsValues>;
  /**
   * Called with every value when Save is pressed. The save bar shows a spinner
   * until the promise settles, then goes away.
   */
  onSave?: (values: SettingsValues) => void | Promise<void>;
  /**
   * Where the selects' menus are portalled. Leave unset to portal into
   * `document.body`; pass an element to keep them inside a scrolling frame.
   */
  container?: HTMLElement | null;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

/**
 * An account settings page in three sections, profile, notifications and
 * preferences, with a save bar that appears once anything changes.
 */
export default function SettingsPage({
  title = "Settings",
  description = "Your profile and how Files keeps in touch.",
  defaultValues,
  onSave,
  container,
  className,
}: SettingsPageProps) {
  const [saved, setSaved] = useState<SettingsValues>({
    ...DEFAULTS,
    ...defaultValues,
  });
  const [values, setValues] = useState(saved);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SettingsValues>(
    key: K,
    value: SettingsValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const dirty = (Object.keys(values) as (keyof SettingsValues)[]).some(
    (key) => values[key] !== saved[key],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave?.(values);
      setSaved(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      onSubmit={submit}
      className={merge("d:f fd:c w:100% max-w:240 mx:auto c:label", className)}
    >
      <header className="d:f fd:c g:1 pb:8">
        <h1 className="m:0 fs:xxl fw:600">{title}</h1>
        {description && <p className="m:0 fs:sm c:hint">{description}</p>}
      </header>

      <section className={SECTION}>
        <div className={SECTION_HEAD}>
          <h2 className="m:0 fs:md fw:600">Profile</h2>
          <p className="m:0 fs:sm c:hint">
            How you appear on files you share.
          </p>
        </div>
        <div className={SECTION_BODY}>
          <Field
            label="Name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => set("name", event.currentTarget.value)}
            className="w:100%"
          />
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set("email", event.currentTarget.value)}
            description="Where share invites and receipts are sent."
            className="w:100%"
          />
        </div>
      </section>

      <section className={SECTION}>
        <div className={SECTION_HEAD}>
          <h2 className="m:0 fs:md fw:600">Notifications</h2>
          <p className="m:0 fs:sm c:hint">Emails, never more than one a day.</p>
        </div>
        <div className={SECTION_BODY}>
          <Switch
            label="Comments on my files"
            description="When someone replies to a file you own."
            checked={values.comments}
            onCheckedChange={(checked) => set("comments", checked)}
          />
          <Switch
            label="Shared with me"
            description="When a file or folder is shared with you."
            checked={values.shared}
            onCheckedChange={(checked) => set("shared", checked)}
          />
          <Switch
            label="Weekly storage summary"
            description="What filled up, every Monday."
            checked={values.summary}
            onCheckedChange={(checked) => set("summary", checked)}
          />
        </div>
      </section>

      <section className={SECTION}>
        <div className={SECTION_HEAD}>
          <h2 className="m:0 fs:md fw:600">Preferences</h2>
          <p className="m:0 fs:sm c:hint">Language and calendar.</p>
        </div>
        <div className={SECTION_BODY}>
          <Select
            label="Language"
            options={LANGUAGES}
            value={values.language}
            onValueChange={(value) => value && set("language", value)}
            container={container}
            className="w:100%"
          />
          <Select
            label="Start the week on"
            options={WEEK_STARTS}
            value={values.weekStart}
            onValueChange={(value) => value && set("weekStart", value)}
            container={container}
            className="w:100%"
          />
        </div>
      </section>

      {dirty && (
        <div
          role="status"
          className="p:st b:4 d:f fw:w ai:c jc:sb g:3 mt:4 px:4 py:3 bg:raised bw:1 bc:rim br:xxl cs:s bs-o:xl"
        >
          <span className="fs:sm fw:500">You have unsaved changes</span>
          <div className="d:f g:2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setValues(saved)}
            >
              Discard
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
