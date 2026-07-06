"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { profile } from "@/lib/content";

/** Minecraft-style loading overlay: dark background, chunky green bar. */
export default function LoadingScreen() {
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);
  const done = progress >= 100;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#181310] transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p className="font-pixel text-xl tracking-[0.2em] text-amber-100">
        {profile.name}
      </p>
      <p className="font-pixel-body text-lg text-amber-200/60">Building world…</p>
      <div className="h-5 w-72 border-2 border-[#5c3f24] bg-[#0d0a07] p-0.5">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>
      <p className="font-pixel-body text-sm text-amber-200/40">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
