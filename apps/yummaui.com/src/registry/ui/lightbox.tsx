"use client";

import { Dialog } from "@base-ui/react/dialog";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { merge } from "yummacss/merge";
import { FOCUS, RADIUS, type Shape, useShape } from "./style";

export interface LightboxImage {
  /** The picture's address. */
  src: string;
  /** What the picture shows, for screen readers and the viewer's title. */
  alt: string;
}

export interface LightboxProps {
  /** The pictures, as a grid of thumbnails that each open the viewer. */
  images: LightboxImage[];
  /** Thumbnails per row. */
  columns?: number;
  /**
   * Where the viewer is rendered. Defaults to `document.body`; pass an element
   * to portal somewhere else, such as inside a frame.
   */
  container?: HTMLElement | null;
  /**
   * Corner radius of the thumbnails and the picture. Inherits the nearest
   * `Shape`.
   */
  shape?: Shape;
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

const MAX_ZOOM = 4;

/**
 * Thumbnails that open a full-screen viewer: swipe or the arrow keys move
 * between pictures, and a double click, a pinch or the wheel zooms.
 */
export default function Lightbox({
  images,
  columns = 4,
  container,
  shape: shapeProp,
  className,
  focus = true,
}: LightboxProps) {
  const shape = useShape(shapeProp);
  const outline = focus ? merge(FOCUS, focus === true ? "" : focus) : "";
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ points: { x: number; y: number }[]; zoom: number; pan: { x: number; y: number } } | null>(null);

  const show = (next: number) => {
    setIndex((next + images.length) % images.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const current = images[index];
  const round = merge(outline, "d:f ai:c jc:c w:10 h:10 bw:1 bc:white/20 bg:white/10 c:white br:9999 c:p h:bg:white/20");

  const begin = () => {
    start.current = { points: [...pointers.current.values()], zoom, pan };
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div
        className={merge("d:g g:2 w:100%", className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {images.map((image, at) => (
          <Dialog.Trigger
            key={image.src}
            onClick={() => show(at)}
            aria-label={`Open ${image.alt}`}
            className={merge(outline, "d:b p:0 bw:0 o:h c:zi", RADIUS.block[shape])}
            style={{ aspectRatio: "1" }}
          >
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="d:b w:100% h:100% of:c tp:t tdu:200 h:s:105 @prm:tp:none"
            />
          </Dialog.Trigger>
        ))}
      </div>
      <Dialog.Portal container={container}>
        <Dialog.Backdrop className="p:f i:0 bg:black/90 tp:o tdu:200 opening:o:0 closing:o:0 @prm:tp:none" />
        <Dialog.Popup
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") show(index + 1);
            if (event.key === "ArrowLeft") show(index - 1);
          }}
          className="p:f i:0 d:f fd:c c:white os:none tp:o tdu:200 opening:o:0 closing:o:0 @prm:tp:none"
        >
          <div className="d:f ai:c jc:sb g:3 p:4">
            <Dialog.Title className="m:0 fs:sm fw:500">
              {current?.alt}
              <span className="ml:2 c:white/60 fvn:tn">
                {index + 1} of {images.length}
              </span>
            </Dialog.Title>
            <Dialog.Close aria-label="Close" className={round}>
              <IconX aria-hidden className="w:5 h:5" />
            </Dialog.Close>
          </div>
          <div
            className="p:r f:1 min-h:0 d:f ai:c jc:c o:h ta:none"
            onDoubleClick={() => {
              setZoom((now) => (now > 1 ? 1 : 2.5));
              setPan({ x: 0, y: 0 });
            }}
            onWheel={(event) => {
              setZoom((now) => {
                const next = Math.min(MAX_ZOOM, Math.max(1, now * (event.deltaY < 0 ? 1.12 : 0.89)));
                if (next === 1) setPan({ x: 0, y: 0 });
                return next;
              });
            }}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest("button")) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
              begin();
            }}
            onPointerMove={(event) => {
              if (!pointers.current.has(event.pointerId) || !start.current) return;
              pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
              const now = [...pointers.current.values()];
              const then = start.current.points;
              if (now.length > 1 && then.length > 1) {
                const gap = (p: { x: number; y: number }[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
                setZoom(Math.min(MAX_ZOOM, Math.max(1, start.current.zoom * (gap(now) / gap(then)))));
              } else if (zoom > 1) {
                setPan({
                  x: start.current.pan.x + now[0].x - then[0].x,
                  y: start.current.pan.y + now[0].y - then[0].y,
                });
              }
            }}
            onPointerUp={(event) => {
              const from = start.current?.points[0];
              pointers.current.delete(event.pointerId);
              // an unzoomed swipe moves between pictures
              if (zoom === 1 && from && pointers.current.size === 0) {
                const moved = event.clientX - from.x;
                if (Math.abs(moved) > 60) show(index + (moved < 0 ? 1 : -1));
              }
              if (pointers.current.size) begin();
              else start.current = null;
            }}
          >
            {current && (
              <img
                src={current.src}
                alt={current.alt}
                draggable={false}
                className={merge(
                  "us:none",
                  RADIUS.block[shape],
                  zoom > 1 ? "c:g" : "c:zi tp:t tdu:200 @prm:tp:none",
                )}
                style={{ maxWidth: "92%", maxHeight: "92%", transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              />
            )}
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Previous picture" onClick={() => show(index - 1)} className={merge(round, "p:a l:4")}>
                  <IconChevronLeft aria-hidden className="w:5 h:5" />
                </button>
                <button type="button" aria-label="Next picture" onClick={() => show(index + 1)} className={merge(round, "p:a r:4")}>
                  <IconChevronRight aria-hidden className="w:5 h:5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="d:f jc:c g:2 p:4 ox:auto">
              {images.map((image, at) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={image.alt}
                  aria-current={at === index}
                  onClick={() => show(at)}
                  className={merge(
                    outline,
                    "fs:0 w:11 h:11 p:0 bw:0 o:h c:p",
                    RADIUS.chip[shape],
                    at === index ? "os:s ow:2 oc:white oo:1" : "o:50 h:o:80",
                  )}
                >
                  <img src={image.src} alt="" className="d:b w:100% h:100% of:c" />
                </button>
              ))}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
