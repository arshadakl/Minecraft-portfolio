"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getBlockDefs, type BlockDef, type GeoKind } from "@/lib/voxel/blocks";
import { buildScene, LANTERN_LIGHTS, type BlockGroup } from "@/lib/voxel/house";

/** Entire voxel scene: one InstancedMesh per block type. */
export default function VoxelWorld() {
  const groups = useMemo(() => buildScene(), []);
  const defs = useMemo(() => getBlockDefs(), []);

  return (
    <group>
      {groups.map((g) => (
        <BlockGroupMesh key={g.type} group={g} def={defs[g.type]} />
      ))}
      {/* Real lights on the porch + path lanterns (interiors have their own) */}
      {LANTERN_LIGHTS.map(([x, y, z]) => (
        <pointLight
          key={`${x},${y},${z}`}
          position={[x + 0.5, y + 0.6, z + 0.5]}
          color="#ffbe6e"
          intensity={10}
          distance={9}
          decay={1.7}
        />
      ))}
    </group>
  );
}

// Shared geometries per kind
const geoCache = new Map<GeoKind, THREE.BufferGeometry>();
function getGeometry(kind: GeoKind): THREE.BufferGeometry {
  let geo = geoCache.get(kind);
  if (geo) return geo;
  switch (kind) {
    case "cube":
      geo = new THREE.BoxGeometry(1, 1, 1);
      break;
    case "slab":
      geo = new THREE.BoxGeometry(1, 0.5, 1);
      break;
    case "small":
      geo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
      break;
    case "cross": {
      const a = new THREE.PlaneGeometry(1, 1);
      a.rotateY(Math.PI / 4);
      const b = new THREE.PlaneGeometry(1, 1);
      b.rotateY(-Math.PI / 4);
      geo = mergeGeometries([a, b]);
      break;
    }
    case "fence": {
      // Central post + top and lower rails in both directions, so pickets
      // connect visually along any run (Minecraft-style plus railing).
      const post = new THREE.BoxGeometry(0.26, 1, 0.26);
      const railTopX = new THREE.BoxGeometry(1, 0.16, 0.16).translate(0, 0.3, 0);
      const railTopZ = new THREE.BoxGeometry(0.16, 0.16, 1).translate(0, 0.3, 0);
      const railLowX = new THREE.BoxGeometry(1, 0.14, 0.14).translate(0, -0.08, 0);
      const railLowZ = new THREE.BoxGeometry(0.14, 0.14, 1).translate(0, -0.08, 0);
      geo = mergeGeometries([post, railTopX, railTopZ, railLowX, railLowZ]);
      break;
    }
  }
  geoCache.set(kind, geo);
  return geo;
}

/** Vertical centering offset within the cell for each geometry kind. */
function yOffset(kind: GeoKind): number {
  switch (kind) {
    case "cube":
    case "cross":
    case "fence":
      return 0.5;
    case "slab":
      return 0.25;
    case "small":
      return 0.275;
  }
}

const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function BlockGroupMesh({ group, def }: { group: BlockGroup; def: BlockDef }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = group.positions.length / 3;
  const geometry = getGeometry(def.kind);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    // Deterministic jitter per group so vegetation doesn't look stamped
    let seed = group.type * 7919 + 17;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const oy = yOffset(def.kind);
    for (let i = 0; i < count; i++) {
      tempPos.set(
        group.positions[i * 3] + 0.5,
        group.positions[i * 3 + 1] + oy,
        group.positions[i * 3 + 2] + 0.5
      );
      if (def.jitter) {
        tempQuat.setFromAxisAngle(Y_AXIS, rand() * Math.PI);
        const s = 0.8 + rand() * 0.35;
        tempScale.set(s, s, s);
        tempPos.x += (rand() - 0.5) * 0.3;
        tempPos.z += (rand() - 0.5) * 0.3;
        tempPos.y -= (1 - s) * 0.5; // keep feet on the ground
      } else {
        tempQuat.identity();
        tempScale.set(1, 1, 1);
      }
      tempMatrix.compose(tempPos, tempQuat, tempScale);
      mesh.setMatrixAt(i, tempMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [group, count, def]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, def.material as THREE.Material, count]}
      castShadow={def.castShadow}
      receiveShadow={def.kind !== "cross"}
    />
  );
}
