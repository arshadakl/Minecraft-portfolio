"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * In-world wooden sign with pixel-style text baked onto a low-res canvas
 * (NearestFilter chunks any font into pixels) — like Minecraft signs.
 * Pure geometry + texture: no DOM, so it never jitters with the camera.
 */
export default function WoodSign({
  text,
  position,
  rotationY = 0,
  width = 3,
  height = 0.75,
}: {
  /** Single line or multiple lines. */
  text: string | string[];
  position: [number, number, number];
  rotationY?: number;
  width?: number;
  height?: number;
}) {
  const lines = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const texture = useMemo(() => {
    const w = 160;
    const h = Math.round((w * height) / width);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Plank background with subtle stripes + darker border
    ctx.fillStyle = "#a5814c";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#8a6a3e";
    const stripe = Math.max(6, Math.floor(h / 4));
    for (let y = stripe; y < h; y += stripe) ctx.fillRect(0, y, w, 1);
    ctx.strokeStyle = "#5c3f24";
    ctx.lineWidth = 4;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    ctx.fillStyle = "#2b1d10";
    const lineH = h / (lines.length + 0.4);
    const fontPx = Math.floor(lineH * 0.62);
    ctx.font = `bold ${fontPx}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, lineH * (i + 0.7), w - 12);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [lines, width, height]);

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color="#6b4b2a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}
