"use client";

import {
  IconAdjustmentsHorizontal,
  IconArrowUp,
  IconCheck,
  IconFileText,
  IconMicrophone,
  IconPlayerStop,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import Button from "./button";
import Popover from "./popover";
import { FOCUS_WITHIN, INPUT_TEXT, RADIUS, type Shape, useShape } from "./style";
import Switch from "./switch";
import Toggle from "./toggle";
import ToggleGroup from "./toggle-group";

export interface PromptTool {
  /** Names the tool in what `onSubmit` receives. */
  id: string;
  /** The switch's label, and the chip's while it is on. */
  label: string;
  /** A line under the label in the Tools menu. */
  description?: string;
  /** A glyph on the chip. */
  icon?: ReactNode;
}

export interface PromptMode {
  /** Names the mode in what `onSubmit` receives. */
  value: string;
  /** The mode's name. */
  label: string;
  /** A glyph before the name. */
  icon?: ReactNode;
}

export interface PromptSubmission {
  /** What was typed. */
  text: string;
  /** The files attached. */
  files: File[];
  /** The ids of the tools switched on. */
  tools: string[];
  /** The picked mode, when there are modes. */
  mode?: string;
}

export interface PromptInputProps {
  /** Called with the message, its files, tools and mode on Send or Enter. */
  onSubmit?: (submission: PromptSubmission) => void;
  /** An answer is arriving: Send turns into Stop. */
  streaming?: boolean;
  /** Called from Stop while `streaming`. */
  onStop?: () => void;
  /**
   * Switches in the Tools menu, such as web search; each one on shows as a
   * chip.
   */
  tools?: PromptTool[];
  /**
   * A Plan or Build choice in the Tools menu; a mode other than the first shows
   * as a chip.
   */
  modes?: PromptMode[];
  /** Drawn before the mic, such as a Model Picker. */
  children?: ReactNode;
  /** Shows the mic, which records and hands back the audio. */
  dictation?: boolean;
  /** Called with the recording when it is done, to turn into text. */
  onRecording?: (audio: Blob) => void;
  /** The empty field's hint. */
  placeholder?: string;
  /** Starting text. */
  defaultValue?: string;
  /**
   * Where the popup is rendered. Defaults to `document.body`; pass an element
   * to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /**
   * Corner radius of the field and its buttons. Inherits the nearest `Shape`.
   */
  shape?: Shape;
  /** Turns the whole input off. */
  disabled?: boolean;
  /**
   * The focus outline. `true` draws it, `false` removes it, and a string of
   * Yumma CSS utilities restyles it on every focusable part of the component,
   * which is more than `className` reaches. Removing it outright and putting
   * nothing back fails WCAG 2.4.7.
   */
  focus?: boolean | string;
  /**
   * Extra classes. `merge` folds them in last, so one here replaces the
   * component's own class for the same utility.
   */
  className?: string;
}

const WAVE_BARS = 48;

/**
 * Where a message is written: a field that grows, attached files, a Tools menu,
 * a mic that records, and Send that turns into Stop.
 */
export default function PromptInput({
  onSubmit,
  streaming = false,
  onStop,
  tools = [],
  modes = [],
  children,
  dictation = true,
  onRecording,
  placeholder = "Ask anything",
  defaultValue = "",
  container,
  shape: shapeProp,
  disabled = false,
  className,
  focus = true,
}: PromptInputProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS_WITHIN, focus === true ? "" : focus) : "";
  const [text, setText] = useState(defaultValue);
  const [files, setFiles] = useState<File[]>([]);
  const [on, setOn] = useState<string[]>([]);
  const [mode, setMode] = useState(modes[0]?.value);
  const [recording, setRecording] = useState<{ started: number; levels: number[] } | null>(null);
  const [now, setNow] = useState(0);
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const stopRecording = useRef<((keep: boolean) => void) | null>(null);

  // the field grows with its text, up to a limit
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text, recording]);

  useEffect(() => () => stopRecording.current?.(false), []);

  const submit = () => {
    if (!text.trim() || streaming || disabled) return;
    onSubmit?.({ text: text.trim(), files, tools: on, mode });
    setText("");
    setFiles([]);
  };

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const audio = new AudioContext();
      const analyser = audio.createAnalyser();
      analyser.fftSize = 256;
      audio.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let keep = false;
      let frame = 0;
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
        void audio.close();
        setRecording(null);
        if (keep) onRecording?.(new Blob(chunks, { type: recorder.mimeType }));
      };
      stopRecording.current = (save) => {
        keep = save;
        if (recorder.state !== "inactive") recorder.stop();
      };
      recorder.start();
      const started = Date.now();
      const levels: number[] = [];
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const value of data) peak = Math.max(peak, Math.abs(value - 128));
        levels.push(peak / 128);
        if (levels.length > WAVE_BARS) levels.shift();
        setRecording({ started, levels: [...levels] });
        setNow(Date.now());
        frame = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setRecording(null);
    }
  };

  const seconds = recording ? Math.floor((now - recording.started) / 1000) : 0;
  const chips = [
    ...tools.filter((tool) => on.includes(tool.id)).map((tool) => ({ key: tool.id, label: tool.label, icon: tool.icon, off: () => setOn(on.filter((id) => id !== tool.id)) })),
    ...modes
      .filter((entry, index) => index > 0 && entry.value === mode)
      .map((entry) => ({ key: entry.value, label: entry.label, icon: entry.icon, off: () => setMode(modes[0]?.value) })),
  ];

  return (
    <div
      className={merge(
        "d:f fd:c g:2 w:100% p:2 bw:1 bc:rim bg:field bs-o:sunk c:label",
        outline,
        RADIUS.box[shape],
        disabled ? "o:60" : "",
        className,
      )}
    >
      {files.length > 0 && (
        <div className="d:f fw:w g:2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className={merge("d:if ai:c g:2 h:9 pl:2 pr:1 bw:1 bc:rim bg:raised bs-o:key fs:xs", RADIUS.control[shape])}
            >
              <IconFileText aria-hidden className="w:4 h:4 c:hint" />
              <span className="max-w:40 o:h to:e ws:nw">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Remove ${file.name}`}
                icon={<IconX className="w:3 h:3" />}
                onClick={() => setFiles(files.filter((_, at) => at !== index))}
                focus={focus}
              />
            </span>
          ))}
        </div>
      )}
      {recording ? (
        <div className="d:f ai:c g:3 h:10 pl:2" role="status" aria-label="Recording">
          <span className="w:2 h:2 br:9999 bg:red an:pulse adu:1000 aic:i @prm:an:none" />
          <span className="ff:m fs:xs c:hint fvn:tn">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>
          <span aria-hidden className="d:f ai:c jc:fe g:px f:1 h:7 o:h">
            {Array.from({ length: WAVE_BARS }, (_, index) => {
              const level = recording.levels[recording.levels.length - WAVE_BARS + index] ?? 0;
              return (
                <span
                  key={index}
                  className="fs:0 w:1 br:9999 bg:label"
                  style={{ height: `${Math.max(8, Math.min(100, level * 260))}%` }}
                />
              );
            })}
          </span>
          <Button variant="secondary" iconOnly size="sm" aria-label="Cancel recording" icon={<IconX className="w:4 h:4" />} onClick={() => stopRecording.current?.(false)} shape={shape} focus={focus} />
          <Button variant="primary" iconOnly size="sm" aria-label="Done" icon={<IconCheck className="w:4 h:4" />} onClick={() => stopRecording.current?.(true)} shape={shape} focus={focus} />
        </div>
      ) : (
        <textarea
          ref={field}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          className={merge("w:100% px:2 py:1 bw:0 bg:transparent c:label lh:4 os:none ow:0 r:none", INPUT_TEXT)}
        />
      )}
      {!recording && (
        <div className="d:f fw:w ai:c g:2">
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              setFiles([...files, ...Array.from(event.target.files ?? [])]);
              event.target.value = "";
            }}
          />
          <Button variant="secondary" size="sm" iconOnly aria-label="Attach a file" icon={<IconPlus className="w:4 h:4" />} onClick={() => picker.current?.click()} shape={shape} disabled={disabled} focus={focus} />
          {(tools.length > 0 || modes.length > 1) && (
            <Popover
              arrow={false}
              side="top"
              title="Tools"
              container={container}
              triggerLabel="Tools"
              shape={shape}
              focus={focus}
              trigger={<IconAdjustmentsHorizontal className="w:4 h:4" />}
            >
              <div className="d:f fd:c g:3 min-w:56">
                {tools.map((tool) => (
                  <Switch
                    key={tool.id}
                    label={tool.label}
                    description={tool.description}
                    checked={on.includes(tool.id)}
                    onCheckedChange={(checked) => setOn(checked ? [...on, tool.id] : on.filter((id) => id !== tool.id))}
                    size="sm"
                    shape={shape}
                    focus={focus}
                  />
                ))}
                {modes.length > 1 && (
                  <ToggleGroup
                    value={mode ? [mode] : []}
                    onValueChange={(next) => next[0] && setMode(next[0])}
                    shape={shape}
                  >
                    {modes.map((entry) => (
                      <Toggle key={entry.value} value={entry.value} label={entry.label} icon={entry.icon} size="sm" focus={focus} />
                    ))}
                  </ToggleGroup>
                )}
              </div>
            </Popover>
          )}
          {chips.map((chip) => (
            <span
              key={chip.key}
              className={merge("d:if ai:c g:1 h:8 pl:2 pr:1 bw:1 bc:rim bg:well c:label fs:xs fw:500", RADIUS.control[shape])}
            >
              {chip.icon && <span className="d:f o:70">{chip.icon}</span>}
              {chip.label}
              <Button variant="ghost" size="sm" iconOnly aria-label={`Turn off ${chip.label}`} icon={<IconX className="w:3 h:3" />} onClick={chip.off} focus={focus} />
            </span>
          ))}
          <span className="f:1" />
          {children}
          {dictation && (
            <Button variant="secondary" size="sm" iconOnly aria-label="Dictate" icon={<IconMicrophone className="w:4 h:4" />} onClick={() => void record()} shape={shape} disabled={disabled || streaming} focus={focus} />
          )}
          {streaming ? (
            <Button variant="primary" size="sm" iconOnly aria-label="Stop" icon={<IconPlayerStop className="w:4 h:4" />} onClick={onStop} shape={shape} focus={focus} />
          ) : (
            <Button variant="primary" size="sm" iconOnly aria-label="Send" icon={<IconArrowUp className="w:4 h:4" />} onClick={submit} disabled={disabled || !text.trim()} shape={shape} focus={focus} />
          )}
        </div>
      )}
    </div>
  );
}
