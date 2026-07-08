"use client";

import { useEffect, useMemo, useState } from "react";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

/**
 * Comic speech bubble drawn to a canvas, shown on a billboarded plane so it
 * is depth-tested (walls hide it) and faces the camera. Shared by the coder
 * (Workstation) and the couple under the oak (Figures).
 */
export default function SpeechBubble({
  text,
  position = [0, 2.3, 0.1],
  height = 0.6,
}: {
  text: string;
  position?: [number, number, number];
  height?: number;
}) {
  // Rebuild the texture once the pixel webfont is loaded so the canvas draws
  // with it rather than a fallback.
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && setFontReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // fontReady is an intentional dep: rebuild so the canvas redraws with the
  // pixel webfont once it has loaded (the font is read inside, at call time).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tex = useMemo(() => makeBubbleTexture(text), [text, fontReady]);
  // Free the GPU texture when it's replaced (text change / font load) or on unmount.
  useEffect(() => () => tex.dispose(), [tex]);
  const img = tex.image as HTMLCanvasElement;
  const w = height * (img.width / img.height);

  return (
    <Billboard position={position}>
      <mesh renderOrder={10}>
        <planeGeometry args={[w, height]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeBubbleTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  // Use the site's pixel body font (VT323) exposed via CSS variable.
  const pixelFamily =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-pixel-body")
      .trim() || "monospace";
  // Generous glyph size — the texture gets minified at viewing distance,
  // so extra resolution here is what keeps the text readable, not blurry.
  const fontSize = 64;
  const font = `${fontSize}px ${pixelFamily}, monospace`;

  // Measure first, then size the canvas (setting width/height resets ctx).
  ctx.font = font;
  const textW = Math.ceil(ctx.measureText(text).width);
  const padX = 34;
  const padY = 18;
  const border = 7;
  const tailH = 30;
  const bodyW = textW + padX * 2;
  const bodyH = fontSize + padY * 2;

  canvas.width = bodyW + border * 2;
  canvas.height = bodyH + tailH + border * 2;

  // Tail first (a downward triangle), then the body over its base so the
  // seam border disappears.
  const cx = canvas.width / 2;
  const baseY = border + bodyH;
  ctx.beginPath();
  ctx.moveTo(cx - 20, baseY - 6);
  ctx.lineTo(cx, baseY + tailH);
  ctx.lineTo(cx + 20, baseY - 6);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = border;
  ctx.lineJoin = "round";
  ctx.fill();
  ctx.stroke();

  roundRect(ctx, border, border, bodyW, bodyH, 22);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111111";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, border + bodyH / 2);

  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; // stays sharp at glancing camera angles
  return t;
}
