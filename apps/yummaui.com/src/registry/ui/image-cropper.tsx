"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { merge } from "yummacss/merge";
import Slider from "./slider";
import { RADIUS, type Shape, useShape } from "./style";

export interface ImageCropperProps {
  /** The picture to crop. */
  src: string;
  /**
   * Called with the cropped picture as a PNG, after each pan or zoom settles.
   */
  onChange?: (png: string) => void;
  /** A round crop for avatars, or a square one. */
  crop?: "circle" | "square";
  /** The cropped picture's width and height in pixels. */
  size?: number;
  /** How far the slider zooms in. */
  maxZoom?: number;
  /** Corner radius of the frame. Inherits the nearest `Shape`. */
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

async function cropped(src: string, area: Area, size: number): Promise<string> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.getContext("2d")?.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

/**
 * A picture panned and zoomed inside a round or square frame, for an avatar or
 * a cover; it reports the crop as a PNG.
 */
export default function ImageCropper({
  src,
  onChange,
  crop: kind = "circle",
  size = 256,
  maxZoom = 3,
  shape: shapeProp,
  className,
  focus = true,
}: ImageCropperProps) {
  const shape = useShape(shapeProp);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [area, setArea] = useState<Area | null>(null);
  const report = useRef(onChange);
  report.current = onChange;

  useEffect(() => {
    if (!area || !report.current) return;
    let live = true;
    void cropped(src, area, size).then((png) => live && report.current?.(png));
    return () => {
      live = false;
    };
  }, [src, area, size]);

  return (
    <div className={merge("d:f fd:c g:3 w:100% c:label", className)}>
      <div className={merge("p:r w:100% o:h bg:well", RADIUS.popup[shape])} style={{ aspectRatio: "1" }}>
        <Cropper
          image={src}
          crop={position}
          zoom={zoom}
          maxZoom={maxZoom}
          aspect={1}
          objectFit="cover"
          cropShape={kind === "circle" ? "round" : "rect"}
          showGrid={false}
          onCropChange={setPosition}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setArea(pixels)}
          style={{ cropAreaStyle: { border: "2px solid white", color: "rgb(0 0 0 / .5)" } }}
        />
      </div>
      <Slider
        label="Zoom"
        min={1}
        max={maxZoom}
        step={0.01}
        value={zoom}
        onValueChange={(value) => setZoom(Array.isArray(value) ? value[0] : value)}
        formatValue={(value) => `${Math.round((Array.isArray(value) ? value[0] : value) * 100)}%`}
        shape={shape}
        focus={focus}
      />
    </div>
  );
}
