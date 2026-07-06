"use client";

import { useRef, type ReactNode } from "react";
import { Html, useScroll } from "@react-three/drei";
import { useSiteStore } from "@/lib/store";

interface WallPanelProps {
  position: [number, number, number];
  rotationY?: number;
  /** Board size in world units. */
  width?: number;
  height?: number;
  /** Content width in CSS px; scale maps it onto the board width. */
  contentWidth?: number;
  /** Section index that owns this panel — fades in when camera is near. */
  section: number;
  /** Hide the wooden backing board (for free-floating HTML). */
  noBoard?: boolean;
  children: ReactNode;
}

/**
 * A wooden sign board on a wall with HTML content projected onto it.
 * Content is pointer-events-none so wheel events reach the scroll rig;
 * interactive children must re-enable with `pointer-events-auto`.
 */
export default function WallPanel({
  position,
  rotationY = 0,
  width = 3.4,
  height = 3,
  contentWidth = 440,
  section,
  noBoard = false,
  children,
}: WallPanelProps) {
  const current = useSiteStore((s) => s.currentSection);
  const active = Math.abs(current - section) <= 1;
  // Html "transform" scale: distanceFactor/400 world units per px
  const distanceFactor = (width / contentWidth) * 400;
  // Without an explicit portal, Html mounts into ScrollControls' scrolling
  // element and gets dragged off-screen as the user scrolls. Portal into the
  // sticky `fixed` layer instead so panels stay glued to their 3D anchor.
  const scroll = useScroll();
  const portal = useRef(scroll.fixed);
  portal.current = scroll.fixed;

  return (
    <group position={position} rotation-y={rotationY}>
      {!noBoard && (
        <>
          {/* Outer plank frame + lighter inner face, iron studs in the corners */}
          <mesh>
            <boxGeometry args={[width + 0.34, height + 0.34, 0.08]} />
            <meshStandardMaterial color="#3c2916" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[width + 0.16, height + 0.16, 0.08]} />
            <meshStandardMaterial color="#4a331f" roughness={0.85} />
          </mesh>
          {([-1, 1] as const).map((sx) =>
            ([-1, 1] as const).map((sy) => (
              <mesh
                key={`${sx}${sy}`}
                position={[
                  sx * (width / 2 + 0.09),
                  sy * (height / 2 + 0.09),
                  0.055,
                ]}
              >
                <boxGeometry args={[0.09, 0.09, 0.03]} />
                <meshStandardMaterial
                  color="#8f8f8f"
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
            ))
          )}
        </>
      )}
      <Html
        transform
        portal={portal}
        // Depth-occluded by scene geometry (walls hide panels in other rooms).
        // Blending mode raises the canvas above the DOM, so keep the z range
        // tiny — UI overlays (NavDots etc.) live at z-20+.
        occlude="blending"
        zIndexRange={[10, 0]}
        position={[0, 0, 0.09]}
        distanceFactor={distanceFactor}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`select-none transition-opacity duration-700 ${
            active ? "opacity-100" : "opacity-0"
          }`}
          style={{ width: contentWidth, pointerEvents: "none" }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}
