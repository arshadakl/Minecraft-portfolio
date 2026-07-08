"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import SpeechBubble from "./SpeechBubble";
import { useSiteStore } from "@/lib/store";

/**
 * Living touches: a dog that circles the lawn but breaks off to visit the
 * farmer for dinner or the couple for a play session, a farmer working the
 * crops, and a couple sitting under the left oak, chatting.
 */
export default function Figures() {
  return (
    <group>
      <Farmstead />
      <Couple />
    </group>
  );
}

/**
 * Two seated people facing each other under the oak nearest the house
 * (tree at -10,13), taking turns "talking" — the gesturing arm and head
 * bob alternate between them via an out-of-phase animation. Click them
 * and they get defensive about it; when it rains one of them raises an
 * umbrella over both.
 */
const COUPLE_LINES = [
  "We're just friends.. 👀",
  "This is a code review. Outdoors.",
  "She's explaining git rebase. Again.",
  "Definitely not a date.",
];
const COUPLE_RAIN_LINES = [
  "It's just rain. We're FINE. ☔",
  "One umbrella. Purely practical.",
  "Sharing umbrellas is what friends do.",
];

/**
 * Pet ↔ couple contact — Farmstead's frame loop is the sole authority that
 * moves the dog (it also owns the farmer/dinner schedule, so one place
 * decides who the dog visits and dinner always wins a conflict). Couple
 * only reports whether it's currently seated (a play visit would look
 * wrong mid-stroll) and reads `atCouple` back to strike a petting pose.
 * One dog/couple ever exists, so a module singleton is simpler than
 * plumbing refs across three separate components — same pattern as the
 * `audio` singleton in lib/audio.ts.
 */
const COUPLE_PLAY_SPOT = new THREE.Vector3(-10, 0, 15.1);
const petContact = { atCouple: false, coupleSeated: true };

/* Couple life: long chats seated under the oak (the default), then a
   stand at the pond's edge watching the water, then a full lap around
   the pond together, and back to the seats. Pond spans world x -16..-10,
   z 16..22; the stroll loop hugs the outside of its stone rim, and the
   oak trunk (x -10..-9, z 13..14) sits just north of the seat-to-pond
   walking lines, so every straight segment below is obstacle-free. */
const SEAT_A = new THREE.Vector3(-11, 0, 14);
const SEAT_B = new THREE.Vector3(-9, 0, 14);
const GAZE_A = new THREE.Vector3(-14, 0, 14.9);
const GAZE_B = new THREE.Vector3(-12.3, 0, 14.9);
const COUPLE_SPEED = 1.05;
const STROLL_GAP = 1.1; // partner follows this far behind on the loop

const LOOP = [
  new THREE.Vector3(-9.0, 0, 14.8), // SE corner of the pond rim
  new THREE.Vector3(-17.9, 0, 14.8), // SW
  new THREE.Vector3(-17.9, 0, 23.3), // NW
  new THREE.Vector3(-9.0, 0, 23.3), // NE
];
const LOOP_LEN = LOOP.reduce(
  (sum, p, i) => sum + p.distanceTo(LOOP[(i + 1) % LOOP.length]),
  0
);
/** Loop distance closest to the gaze spots — where a stroll starts. */
const STROLL_ENTRY = LOOP[0].distanceTo(GAZE_A.clone().setZ(14.8));

/** Point on the closed rectangle loop at arclength d (wraps). */
function loopPoint(d: number, out: THREE.Vector3): THREE.Vector3 {
  let rest = ((d % LOOP_LEN) + LOOP_LEN) % LOOP_LEN;
  for (let i = 0; i < LOOP.length; i++) {
    const a = LOOP[i];
    const b = LOOP[(i + 1) % LOOP.length];
    const len = a.distanceTo(b);
    if (rest <= len) return out.lerpVectors(a, b, rest / len);
    rest -= len;
  }
  return out.copy(LOOP[0]);
}

interface CoupleSim {
  mode: "sit" | "walk" | "gaze" | "stroll";
  next: "sit" | "gaze" | "stroll";
  until: number;
  aFrom: THREE.Vector3;
  aTo: THREE.Vector3;
  bFrom: THREE.Vector3;
  bTo: THREE.Vector3;
  walkStart: number;
  walkDur: number;
  strollStart: number;
}

function Couple() {
  const raining = useSiteStore((s) => s.raining);
  const [talking, setTalking] = useState(false);
  const [lineIdx, setLineIdx] = useState(-1);
  const talkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seated = useRef<THREE.Group>(null);
  const aStand = useRef<THREE.Group>(null);
  const bStand = useRef<THREE.Group>(null);
  const pair = useRef<THREE.Group>(null); // umbrella + bubble anchor (midpoint)
  const bubbleLift = useRef<THREE.Group>(null);

  const sim = useRef<CoupleSim>({
    mode: "sit",
    next: "gaze",
    until: 22,
    aFrom: SEAT_A.clone(),
    aTo: SEAT_A.clone(),
    bFrom: SEAT_B.clone(),
    bTo: SEAT_B.clone(),
    walkStart: 0,
    walkDur: 1,
    strollStart: 0,
  });

  const onAsk = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setLineIdx((i) => i + 1);
    setTalking(true);
    if (talkTimer.current) clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(() => setTalking(false), 2800);
  };

  useEffect(
    () => () => {
      if (talkTimer.current) clearTimeout(talkTimer.current);
      document.body.style.cursor = "auto";
    },
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = sim.current;
    const a = aStand.current;
    const b = bStand.current;
    if (!a || !b) return;
    const kSoft = 1 - Math.pow(0.02, delta);

    // ---- transitions ----
    if (s.mode === "sit" && t > s.until) {
      s.aFrom.copy(SEAT_A);
      s.aTo.copy(GAZE_A);
      s.bFrom.copy(SEAT_B);
      s.bTo.copy(GAZE_B);
      s.next = "gaze";
      s.walkStart = t;
      s.walkDur = Math.max(0.5, s.aFrom.distanceTo(s.aTo) / COUPLE_SPEED);
      s.mode = "walk";
    } else if (s.mode === "walk" && t >= s.walkStart + s.walkDur) {
      s.mode = s.next === "stroll" ? "stroll" : s.next;
      if (s.mode === "gaze") s.until = t + 11 + Math.random() * 6;
      if (s.mode === "sit") s.until = t + 26 + Math.random() * 14; // the long one
      if (s.mode === "stroll") s.strollStart = t;
    } else if (s.mode === "gaze" && t > s.until) {
      s.mode = "stroll";
      s.strollStart = t;
    } else if (
      s.mode === "stroll" &&
      (t - s.strollStart) * COUPLE_SPEED >= LOOP_LEN // one full lap
    ) {
      s.aFrom.copy(a.position).setY(0);
      s.aTo.copy(SEAT_A);
      s.bFrom.copy(b.position).setY(0);
      s.bTo.copy(SEAT_B);
      s.next = "sit";
      s.walkStart = t;
      s.walkDur = Math.max(0.5, s.aFrom.distanceTo(s.aTo) / COUPLE_SPEED);
      s.mode = "walk";
    }

    const sitting = s.mode === "sit";
    if (seated.current) seated.current.visible = sitting;
    a.visible = !sitting;
    b.visible = !sitting;
    petContact.coupleSeated = sitting;

    // ---- standing rigs per mode ----
    const bob = (phase: number) => Math.abs(Math.sin(t * 7 + phase)) * 0.045;
    if (s.mode === "walk") {
      const p = Math.min(1, (t - s.walkStart) / s.walkDur);
      a.position.lerpVectors(s.aFrom, s.aTo, p).setY(bob(0));
      b.position.lerpVectors(s.bFrom, s.bTo, p).setY(bob(1.4));
      a.rotation.y = dampAngle(
        a.rotation.y,
        Math.atan2(s.aTo.x - s.aFrom.x, s.aTo.z - s.aFrom.z),
        kSoft
      );
      b.rotation.y = dampAngle(
        b.rotation.y,
        Math.atan2(s.bTo.x - s.bFrom.x, s.bTo.z - s.bFrom.z),
        kSoft
      );
    } else if (s.mode === "gaze") {
      a.position.set(GAZE_A.x, 0, GAZE_A.z);
      b.position.set(GAZE_B.x, 0, GAZE_B.z);
      // Face the water (+z), with a slow lean-sway toward each other
      a.rotation.y = dampAngle(a.rotation.y, Math.sin(t * 0.5) * 0.12, kSoft);
      b.rotation.y = dampAngle(b.rotation.y, -Math.sin(t * 0.5 + 1) * 0.12, kSoft);
    } else if (s.mode === "stroll") {
      const dist = STROLL_ENTRY + (t - s.strollStart) * COUPLE_SPEED;
      loopPoint(dist, a.position).setY(bob(0));
      loopPoint(dist - STROLL_GAP, b.position).setY(bob(1.4));
      const ahead = loopPoint(dist + 0.4, tmpA);
      const aheadB = loopPoint(dist - STROLL_GAP + 0.4, tmpB);
      a.rotation.y = dampAngle(
        a.rotation.y,
        Math.atan2(ahead.x - a.position.x, ahead.z - a.position.z),
        kSoft
      );
      b.rotation.y = dampAngle(
        b.rotation.y,
        Math.atan2(aheadB.x - b.position.x, aheadB.z - b.position.z),
        kSoft
      );
    }

    // ---- umbrella + speech bubble follow the pair ----
    if (pair.current) {
      if (sitting) {
        pair.current.position.set(-10, 0, 14);
      } else {
        pair.current.position
          .copy(a.position)
          .add(b.position)
          .multiplyScalar(0.5)
          .setY(0);
      }
    }
    if (bubbleLift.current)
      bubbleLift.current.position.y = sitting ? 1.95 : 2.35;
  });

  const lines = raining ? COUPLE_RAIN_LINES : COUPLE_LINES;

  return (
    <group
      onClick={onAsk}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <group ref={seated}>
        <SeatedPerson
          position={[-11, 0, 14]}
          faceSign={1}
          phase={0}
          robe="#8a4f6e"
          skin="#e0b088"
          hair="#4a3324"
        />
        <SeatedPerson
          position={[-9, 0, 14]}
          faceSign={-1}
          phase={Math.PI}
          robe="#3f5c7a"
          skin="#d8a877"
          hair="#2f2418"
        />
      </group>

      <StandingPerson root={aStand} robe="#8a4f6e" skin="#e0b088" hair="#4a3324" />
      <StandingPerson root={bStand} robe="#3f5c7a" skin="#d8a877" hair="#2f2418" />

      {/* Umbrella + bubble ride the pair's midpoint. When seated this sits
          under the oak — the bubble stays BELOW and in FRONT of the leaf
          canopy (x -12..-8, z 11..15 from y≈2 up) so foliage never clips. */}
      <group ref={pair} position={[-10, 0, 14]}>
        <Umbrella />
        <group ref={bubbleLift} position={[0, 1.95, 0]}>
          {talking && lineIdx >= 0 && (
            <SpeechBubble
              text={lines[lineIdx % lines.length]}
              position={[0, 0, 1.5]}
              height={0.8}
            />
          )}
        </group>
      </group>
    </group>
  );
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();

/** Standing pose for the couple's walks — faces local +z, meshes only. */
function StandingPerson({
  root,
  robe,
  skin,
  hair,
}: {
  root: RefObject<THREE.Group | null>;
  robe: string;
  skin: string;
  hair: string;
}) {
  return (
    <group ref={root} position={SEAT_A.toArray()} visible={false}>
      {([-0.13, 0.13] as const).map((lx) => (
        <mesh key={lx} position={[lx, 0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.2]} />
          <meshStandardMaterial color="#4c3a28" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.98, 0]} castShadow>
        <boxGeometry args={[0.5, 0.76, 0.3]} />
        <meshStandardMaterial color={robe} roughness={0.95} />
      </mesh>
      {/* Arms hanging at the sides */}
      {([-0.3, 0.3] as const).map((ax) => (
        <mesh key={ax} position={[ax, 0.98, 0]} castShadow>
          <boxGeometry args={[0.12, 0.55, 0.14]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
      ))}
      {/* Head — nose on +z so yaw math matches the farmer's */}
      <group position={[0, 1.58, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.22, -0.02]}>
          <boxGeometry args={[0.42, 0.1, 0.44]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.02, 0.22]}>
          <boxGeometry args={[0.1, 0.14, 0.1]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Blocky umbrella between the two — pops up (scale spring) while it rains,
 * held out from the west person's side so it covers both.
 */
function Umbrella() {
  const root = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = root.current;
    if (!g) return;
    const target = useSiteStore.getState().raining ? 1 : 0.001;
    const k = 1 - Math.pow(0.005, delta);
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * k);
  });

  const canvasColor = "#b5484d";
  // Positioned by the pair anchor in Couple — local origin is the midpoint.
  return (
    <group ref={root} scale={0.001}>
      {/* Pole, leaning slightly from the west person's hand */}
      <mesh position={[-0.3, 1.3, 0]} rotation-z={0.12} castShadow>
        <boxGeometry args={[0.06, 1.7, 0.06]} />
        <meshStandardMaterial color="#6e4f2a" roughness={0.85} />
      </mesh>
      {/* Stepped blocky canopy — Minecraft has no curves */}
      <group position={[-0.24, 2.16, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.14, 0.6]} />
          <meshStandardMaterial color={canvasColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[1.2, 0.12, 1.2]} />
          <meshStandardMaterial color={canvasColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.23, 0]} castShadow>
          <boxGeometry args={[1.8, 0.1, 1.8]} />
          <meshStandardMaterial color="#9c3a40" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function SeatedPerson({
  position,
  faceSign,
  phase,
  robe,
  skin,
  hair,
}: {
  position: [number, number, number];
  /** +1 faces +x, -1 faces -x — the two sit turned toward each other. */
  faceSign: 1 | -1;
  phase: number;
  robe: string;
  skin: string;
  hair: string;
}) {
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    // The pet's arrival (Farmstead's frame loop sets this) overrides the
    // chat gesture with a reach-down-and-pet pose on both seated people.
    const petting = petContact.atCouple;
    const talk = Math.max(0, Math.sin(t * 3 + phase)); // 0..1, the "speaking" beat
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 2.5 + phase) * 0.07;
      const targetX = petting ? 0.34 : Math.sin(t * 1.7 + phase) * 0.05;
      head.current.rotation.x = petting
        ? THREE.MathUtils.damp(head.current.rotation.x, targetX, 6, delta)
        : targetX;
    }
    if (torso.current) {
      const targetX = petting ? 0.2 : Math.sin(t * 1.3 + phase) * 0.04;
      torso.current.rotation.x = petting
        ? THREE.MathUtils.damp(torso.current.rotation.x, targetX, 6, delta)
        : targetX;
    }
    if (arm.current) {
      const targetX = petting ? 0.95 : -0.35 - talk * 0.7; // reach down vs. gesture up
      arm.current.rotation.x = THREE.MathUtils.damp(
        arm.current.rotation.x,
        targetX,
        petting ? 6 : 14,
        delta
      );
    }
  });

  return (
    <group position={position} rotation-y={(faceSign * Math.PI) / 2}>
      {/* Legs resting forward on the grass (local +z) */}
      {([-0.13, 0.13] as const).map((lx) => (
        <group key={lx}>
          <mesh position={[lx, 0.16, 0.28]} castShadow>
            <boxGeometry args={[0.19, 0.19, 0.6]} />
            <meshStandardMaterial color="#4c3a28" roughness={0.9} />
          </mesh>
          <mesh position={[lx, 0.09, 0.6]} castShadow>
            <boxGeometry args={[0.19, 0.14, 0.22]} />
            <meshStandardMaterial color="#3a2c1e" roughness={0.9} />
          </mesh>
        </group>
      ))}

      <group ref={torso} position={[0, 0.28, -0.05]}>
        {/* Torso, upright */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.5, 0.72, 0.3]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
        {/* Head */}
        <group ref={head} position={[0, 0.95, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.22, -0.02]}>
            <boxGeometry args={[0.42, 0.1, 0.44]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
          {/* Nose toward the partner */}
          <mesh position={[0, -0.02, 0.22]}>
            <boxGeometry args={[0.1, 0.14, 0.1]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
        </group>
        {/* Still arm resting on the knee */}
        <mesh position={[-0.28, 0.18, 0.12]} rotation-x={-0.5} castShadow>
          <boxGeometry args={[0.13, 0.5, 0.13]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
        {/* Gesturing arm */}
        <group ref={arm} position={[0.28, 0.42, 0.06]}>
          <mesh position={[0, -0.2, 0.08]} castShadow>
            <boxGeometry args={[0.13, 0.5, 0.13]} />
            <meshStandardMaterial color={robe} roughness={0.95} />
          </mesh>
          <mesh position={[0, -0.42, 0.14]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Farmstead: the farmer roams between work spots around the wheat bed,
   hoes for a while at each, and every so often walks over to the dog,
   puts a food bowl down, leans in for a kiss — Minecraft breeding-style
   hearts pop over the pup. One state machine drives both figures so the
   dog can break off its circle and run to dinner. */
/* ------------------------------------------------------------------ */

const BED_CENTER = new THREE.Vector3(6.5, 0, 14);
/**
 * Hoe spots on OPEN LAWN around the bed — obstacle map (world coords):
 * crop bed x 5..9 z 12..17, exterior stairs x 5..7 z 12..16, porch posts
 * z 11..12, hedge x 3..4 z 11..29. Straight lines A↔B (east of the bed)
 * and A↔C (south of it) stay clear; B↔C would cut across the bed, so the
 * walk graph below routes B's traffic through A.
 */
const WPS = [
  new THREE.Vector3(9.8, 0, 17.4), // A — south-east corner
  new THREE.Vector3(9.7, 0, 12.6), // B — north-east corner (A only)
  new THREE.Vector3(6.8, 0, 18.2), // C — south edge (A or the feed spot)
];
const FEED_FARMER = new THREE.Vector3(7.5, 0, 21.0);
const DOG_SPOT = new THREE.Vector3(7.5, 0, 22.5);
const BOWL_POS = new THREE.Vector3(7.6, 0, 21.9);
const DOG_CENTER = new THREE.Vector3(7.5, 0, 24);
const DOG_RADIUS = 2;
const WALK_SPEED = 1.3;
const FEED_DURATION = 6.5;
const PLAY_DURATION = 5;
const EAT_DURATION = 3.5; // eating leftover food, no farmer present

/**
 * Dog's route to/from the couple. house.ts puts a `stone()` garden edging
 * at x=3 and x=-4 for z 11..28 ONLY, at y=0 — ground itself is y=-1, so
 * this curb stands a full block proud of the lawn. It never crosses at
 * z=29+ (past its south end, near the garden's approach/camera start,
 * the "backside" of the initial view). Route goes around that open end:
 * circle → east lawn just past the wall's south tip (z=29) → straight
 * across to the west side there (zero wall contact) → north to the
 * couple, staying east of the pond (x>-11) the whole way.
 */
const DOG_ROUND_Z = 31; // clear of the edging's south end (z<=28) with visible gap
const DOG_ROUND_EAST = new THREE.Vector3(4, 0, DOG_ROUND_Z);
const DOG_ROUND_WEST = new THREE.Vector3(-9, 0, DOG_ROUND_Z);
const DOG_SPAWN = COUPLE_PLAY_SPOT.clone();
const DOG_WALK_SPEED = 2.0; // brisk trot — faster than the farmer's stride

interface DogLeg {
  from: THREE.Vector3;
  to: THREE.Vector3;
  dist: number;
}
interface DogTrip {
  active: boolean;
  legs: DogLeg[];
  legIndex: number;
  legStart: number;
}

/** Begin a constant-speed walk from `start` through `waypoints` in order. */
function startTrip(trip: DogTrip, start: THREE.Vector3, waypoints: THREE.Vector3[], now: number) {
  const pts = [start.clone(), ...waypoints];
  trip.legs = pts.slice(0, -1).map((p, i) => ({
    from: p,
    to: pts[i + 1],
    dist: p.distanceTo(pts[i + 1]),
  }));
  trip.legIndex = 0;
  trip.legStart = now;
  trip.active = true;
}

/** Advance a trip by one frame at constant `speed`; returns the interpolated
 *  position, current heading, and whether the whole path just completed. */
function stepTrip(
  trip: DogTrip,
  now: number,
  speed: number
): { pos: THREE.Vector3; heading: number; done: boolean } {
  const leg = trip.legs[trip.legIndex];
  if (!trip.active || !leg) {
    trip.active = false;
    const last = trip.legs[trip.legs.length - 1];
    return { pos: (last?.to ?? new THREE.Vector3()).clone(), heading: 0, done: true };
  }
  const dur = Math.max(0.15, leg.dist / speed);
  const p = Math.min(1, (now - trip.legStart) / dur);
  const pos = new THREE.Vector3().lerpVectors(leg.from, leg.to, p);
  // DogRig's head/nose is modeled on local +X (unlike the farmer/couple
  // rigs, which face +Z) — atan2(dx,dz) would face 90° off actual travel,
  // reading as a sideways/crab walk. atan2(-dz,dx) is the correct heading
  // for a +X-nosed rig (verified against the dog's own hardcoded dinner
  // target, which needs rotation.y=π/2 for a due-south direction — this
  // formula reproduces exactly that).
  const heading = Math.atan2(-(leg.to.z - leg.from.z), leg.to.x - leg.from.x);
  let done = false;
  if (p >= 1) {
    trip.legIndex++;
    trip.legStart = now;
    if (trip.legIndex >= trip.legs.length) {
      trip.active = false;
      done = true;
    }
  }
  return { pos, heading, done };
}

/** Frame-rate independent shortest-arc angle damp (avoids 2π spin-arounds). */
function dampAngle(cur: number, target: number, k: number): number {
  let d = ((target - cur + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return cur + d * k;
}

let heartTex: THREE.CanvasTexture | null = null;
function getHeartTexture(): THREE.CanvasTexture {
  if (heartTex) return heartTex;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.font = "52px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("❤", 32, 36);
  heartTex = new THREE.CanvasTexture(canvas);
  heartTex.magFilter = THREE.NearestFilter;
  heartTex.colorSpace = THREE.SRGBColorSpace;
  return heartTex;
}

interface FarmSim {
  mode: "work" | "walk" | "feed";
  next: "work" | "feed";
  until: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  walkStart: number;
  walkDur: number;
  wp: number;
  nextFeedAt: number;
  feedStart: number;
}

function Farmstead() {
  const farmer = useRef<THREE.Group>(null);
  const farmerBody = useRef<THREE.Group>(null);
  const farmerArms = useRef<THREE.Group>(null);
  const dog = useRef<THREE.Group>(null);
  const dogTail = useRef<THREE.Group>(null);
  const dogHead = useRef<THREE.Group>(null);
  const bowl = useRef<THREE.Group>(null);
  const heartMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const hearts = useRef<(THREE.Object3D | null)[]>([]);
  // The farmer serves dinner on his own schedule regardless of where the
  // dog is — he never yanks it out of a couple visit. The dog only joins
  // live if it's already idle when serving starts; otherwise the bowl is
  // left out (`foodWaiting`) and the dog eats it later, on its own, the
  // next time it's idle. Walking legs are driven by the DogTrip in
  // `dogTrip`. Starts "playing" (not "idle") since the dog spawns already
  // at the couple — idle would immediately ease it toward the circle.
  const petPlay = useRef<{
    phase: "idle" | "toCouple" | "playing" | "toCircle" | "toFood" | "eating";
    playStart: number;
    nextAt: number;
    eatStart: number;
  }>({ phase: "playing", playStart: 0, nextAt: 50, eatStart: 0 });
  const dogTrip = useRef<DogTrip>({ active: false, legs: [], legIndex: 0, legStart: 0 });
  const foodWaiting = useRef(false);

  const sim = useRef<FarmSim>({
    mode: "work",
    next: "work",
    until: 8,
    from: WPS[0].clone(),
    to: WPS[0].clone(),
    walkStart: 0,
    walkDur: 1,
    wp: 0,
    nextFeedAt: 24,
    feedStart: 0,
  });

  // Dog starts at the couple's play spot on spawn
  useEffect(() => {
    if (dog.current) {
      dog.current.position.copy(DOG_SPAWN);
    }
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = sim.current;
    const f = farmer.current;
    const d = dog.current;
    if (!f || !d) return;
    const k = 1 - Math.pow(0.001, delta);
    const kSoft = 1 - Math.pow(0.02, delta);

    // ---- state transitions ----
    if (s.mode === "work" && t > s.until) {
      const feedTime = t > s.nextFeedAt;
      s.from.copy(f.position).setY(0);
      if (feedTime && s.wp !== 1) {
        // Dinner is reachable in a straight line from A or C only
        s.to.copy(FEED_FARMER);
        s.next = "feed";
      } else {
        // Walk graph: A → B or C; B → A; C → A (never straight across the bed)
        s.wp = s.wp === 0 ? (Math.random() < 0.5 ? 1 : 2) : 0;
        s.to.copy(WPS[s.wp]);
        s.next = "work";
      }
      s.walkStart = t;
      s.walkDur = Math.max(0.4, s.from.distanceTo(s.to) / WALK_SPEED);
      s.mode = "walk";
    } else if (s.mode === "walk" && t >= s.walkStart + s.walkDur) {
      if (s.next === "feed") {
        s.mode = "feed";
        s.feedStart = t;
      } else {
        s.mode = "work";
        s.until = t + 5.5 + Math.random() * 3.5;
      }
    } else if (s.mode === "feed" && t - s.feedStart > FEED_DURATION) {
      s.from.copy(f.position).setY(0);
      s.to.copy(WPS[(s.wp = 2)]); // back to the south-edge spot — clear line
      s.next = "work";
      s.walkStart = t;
      s.walkDur = Math.max(0.4, s.from.distanceTo(s.to) / WALK_SPEED);
      s.mode = "walk";
      s.nextFeedAt = t + 28 + Math.random() * 16;
    }

    // Farmer serves on his own schedule no matter what the dog is doing —
    // this only reflects whether the dog is free to receive it live.
    const dinner = s.mode === "feed" || (s.mode === "walk" && s.next === "feed");
    const dogAtDinner = dinner && petPlay.current.phase === "idle";

    // ---- farmer ----
    const fp = t - s.feedStart;
    let yawTarget: number;
    if (s.mode === "walk") {
      const p = Math.min(1, (t - s.walkStart) / s.walkDur);
      f.position.lerpVectors(s.from, s.to, p);
      f.position.y = Math.abs(Math.sin(t * 8)) * 0.05; // stride bob
      yawTarget = Math.atan2(s.to.x - s.from.x, s.to.z - s.from.z);
    } else if (s.mode === "feed") {
      f.position.set(FEED_FARMER.x, 0, FEED_FARMER.z);
      yawTarget = Math.atan2(DOG_SPOT.x - f.position.x, DOG_SPOT.z - f.position.z);
    } else {
      f.position.set(s.to.x, 0, s.to.z);
      yawTarget = Math.atan2(BED_CENTER.x - f.position.x, BED_CENTER.z - f.position.z);
    }
    f.rotation.y = dampAngle(f.rotation.y, yawTarget, kSoft);

    const swing = s.mode === "work" ? (Math.sin(t * 2.2) + 1) / 2 : 0;
    if (farmerArms.current)
      farmerArms.current.rotation.x = THREE.MathUtils.damp(
        farmerArms.current.rotation.x,
        s.mode === "work" ? -0.4 - swing * 0.9 : -0.35,
        6,
        delta
      );
    if (farmerBody.current) {
      // Kiss: a deep lean toward the pup mid-feed — only if the dog is
      // actually there to receive it (see dogAtDinner above).
      const kiss =
        dogAtDinner
          ? THREE.MathUtils.smoothstep(fp, 2.2, 3.0) *
            (1 - THREE.MathUtils.smoothstep(fp, 3.8, 4.6))
          : 0;
      farmerBody.current.rotation.x = THREE.MathUtils.damp(
        farmerBody.current.rotation.x,
        swing * 0.12 + kiss * 0.55,
        8,
        delta
      );
    }

    // ---- dog: the farmer's dinner call only claims the dog if it's
    // already idle (never interrupts a couple visit or a walk in
    // progress). If the dog is away the whole time the farmer is serving,
    // the bowl is left out (`foodWaiting`) and the dog goes to eat it — on
    // its own, walked at constant speed — the next time it's free.
    const pp = petPlay.current;
    const trip = dogTrip.current;

    if (s.mode === "feed" && !dogAtDinner) {
      foodWaiting.current = true;
    } else if (dogAtDinner) {
      foodWaiting.current = false;
    }

    if (
      pp.phase === "idle" &&
      !dogAtDinner &&
      foodWaiting.current
    ) {
      // Leftover food takes priority over a couple visit — go eat first.
      startTrip(trip, d.position, [DOG_SPOT], t);
      pp.phase = "toFood";
    } else if (
      pp.phase === "idle" &&
      !dogAtDinner &&
      !foodWaiting.current &&
      petContact.coupleSeated &&
      t > pp.nextAt
    ) {
      // Walk the garden edging strip out to the couple (every visit, not
      // just the first — the dog is never teleported).
      startTrip(trip, d.position, [DOG_ROUND_EAST, DOG_ROUND_WEST, COUPLE_PLAY_SPOT], t);
      pp.phase = "toCouple";
    } else if (pp.phase === "eating" && t - pp.eatStart > EAT_DURATION) {
      foodWaiting.current = false;
      pp.phase = "idle";
      pp.nextAt = Math.max(pp.nextAt, t + 8 + Math.random() * 8);
    } else if (pp.phase === "playing") {
      const timeUp = t - pp.playStart > PLAY_DURATION;
      const leftEarly = !petContact.coupleSeated;
      if (timeUp || leftEarly) {
        // Same strip, reversed, then a live rejoin point on the circle so
        // the hand-off back to circling has zero snap.
        const rejoin = new THREE.Vector3(
          DOG_CENTER.x + Math.cos(t * 0.9) * DOG_RADIUS,
          0,
          DOG_CENTER.z + Math.sin(t * 0.9) * DOG_RADIUS
        );
        startTrip(trip, d.position, [DOG_ROUND_WEST, DOG_ROUND_EAST, rejoin], t);
        pp.phase = "toCircle";
      }
    }

    if (dogAtDinner) {
      d.position.x += (DOG_SPOT.x - d.position.x) * kSoft;
      d.position.z += (DOG_SPOT.z - d.position.z) * kSoft;
      d.position.y = Math.abs(Math.sin(t * 7)) * 0.1; // excited hops
      d.rotation.y = dampAngle(d.rotation.y, Math.PI / 2, kSoft); // face the farmer
      if (dogTail.current) dogTail.current.rotation.y = Math.sin(t * 18) * 0.6;
      if (dogHead.current)
        dogHead.current.rotation.x = THREE.MathUtils.damp(
          dogHead.current.rotation.x,
          s.mode === "feed" && fp > 2 && fp < 4.8 ? -0.35 : 0, // look up for the kiss
          8,
          delta
        );
      petContact.atCouple = false;
    } else if (
      pp.phase === "toCouple" ||
      pp.phase === "toCircle" ||
      pp.phase === "toFood"
    ) {
      const step = stepTrip(trip, t, DOG_WALK_SPEED);
      d.position.x = step.pos.x;
      d.position.z = step.pos.z;
      d.position.y = Math.abs(Math.sin(t * 8)) * 0.07; // trotting bob
      d.rotation.y = dampAngle(d.rotation.y, step.heading, kSoft);
      if (dogTail.current) dogTail.current.rotation.y = Math.sin(t * 10) * 0.4;
      if (dogHead.current) dogHead.current.rotation.x = Math.sin(t * 4) * 0.08;
      if (step.done) {
        if (pp.phase === "toCouple") {
          pp.phase = "playing";
          pp.playStart = t;
        } else if (pp.phase === "toFood") {
          pp.phase = "eating";
          pp.eatStart = t;
        } else {
          pp.phase = "idle";
          pp.nextAt = t + 45 + Math.random() * 25;
        }
      }
      petContact.atCouple = false;
    } else if (pp.phase === "eating") {
      d.position.set(DOG_SPOT.x, 0, DOG_SPOT.z);
      d.position.y = Math.abs(Math.sin(t * 4)) * 0.05; // calm munching bob
      d.rotation.y = dampAngle(d.rotation.y, Math.PI / 2, kSoft); // face the bowl
      if (dogTail.current) dogTail.current.rotation.y = Math.sin(t * 8) * 0.4;
      if (dogHead.current)
        dogHead.current.rotation.x = 0.25 + Math.sin(t * 5) * 0.1; // head down, eating
      petContact.atCouple = false;
    } else if (pp.phase === "playing") {
      d.position.set(COUPLE_PLAY_SPOT.x, 0, COUPLE_PLAY_SPOT.z);
      d.position.y = Math.abs(Math.sin(t * 6)) * 0.24; // big excited jumps
      d.rotation.y = dampAngle(d.rotation.y, Math.PI, kSoft); // face the seats (-z)
      if (dogTail.current) dogTail.current.rotation.y = Math.sin(t * 22) * 0.65;
      if (dogHead.current)
        dogHead.current.rotation.x = THREE.MathUtils.damp(
          dogHead.current.rotation.x,
          Math.sin(t * 6) * 0.15 - 0.1,
          10,
          delta
        );
      petContact.atCouple = true;
    } else {
      const a = t * 0.9;
      d.position.x += (DOG_CENTER.x + Math.cos(a) * DOG_RADIUS - d.position.x) * kSoft;
      d.position.z += (DOG_CENTER.z + Math.sin(a) * DOG_RADIUS - d.position.z) * kSoft;
      d.position.y = Math.abs(Math.sin(t * 5)) * 0.14;
      d.rotation.y = dampAngle(d.rotation.y, -a - Math.PI / 2, kSoft);
      if (dogTail.current) dogTail.current.rotation.y = Math.sin(t * 12) * 0.5;
      if (dogHead.current) dogHead.current.rotation.x = Math.sin(t * 3.1) * 0.12;
      petContact.atCouple = false;
    }

    // ---- bowl + hearts ----
    if (bowl.current) {
      // Stays out while food is left waiting for the dog, not just during
      // the farmer's own serving window.
      const target = (s.mode === "feed" && fp > 0.6) || foodWaiting.current ? 1 : 0.001;
      bowl.current.scale.setScalar(
        bowl.current.scale.x + (target - bowl.current.scale.x) * k
      );
    }
    const heartsOn = dogAtDinner && fp > 2.4;
    for (let i = 0; i < 3; i++) {
      const mat = heartMats.current[i];
      const h = hearts.current[i];
      if (!mat || !h) continue;
      if (!heartsOn) {
        mat.opacity += (0 - mat.opacity) * k;
        continue;
      }
      const hp = ((fp - 2.4 + i * 0.6) % 1.8) / 1.8;
      h.position.set(Math.sin(i * 2.4) * 0.25, 0.9 + hp * 0.9, Math.cos(i * 1.7) * 0.2);
      mat.opacity = Math.sin(hp * Math.PI) * 0.95;
    }
  });

  return (
    <group>
      <FarmerRig root={farmer} body={farmerBody} arms={farmerArms} />
      <DogRig root={dog} tail={dogTail} head={dogHead} hearts={hearts} heartMats={heartMats} />

      {/* Dinner bowl — springs up when it's feeding time */}
      <group ref={bowl} position={BOWL_POS.toArray()} scale={0.001}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.1, 10]} />
          <meshStandardMaterial color="#7a5540" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.04, 10]} />
          <meshStandardMaterial color="#a8451f" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** Blocky dog — meshes only; Farmstead's frame loop drives the refs. */
function DogRig({
  root,
  tail,
  head,
  hearts,
  heartMats,
}: {
  root: RefObject<THREE.Group | null>;
  tail: RefObject<THREE.Group | null>;
  head: RefObject<THREE.Group | null>;
  hearts: RefObject<(THREE.Object3D | null)[]>;
  heartMats: RefObject<(THREE.MeshBasicMaterial | null)[]>;
}) {
  const cream = "#ead9bd";
  const brown = "#b98a5a";
  const dark = "#3a2c1e";
  const tex = useMemo(() => getHeartTexture(), []);

  return (
    <group ref={root} position={DOG_CENTER.toArray()}>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.85, 0.42, 0.4]} />
        <meshStandardMaterial color={cream} roughness={0.9} />
      </mesh>
      {/* Back patch */}
      <mesh position={[-0.1, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.42]} />
        <meshStandardMaterial color={brown} roughness={0.9} />
      </mesh>
      {/* Head */}
      <group ref={head} position={[0.52, 0.62, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.38, 0.36, 0.38]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
        <mesh position={[0.22, -0.06, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.2]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
        <mesh position={[0.31, -0.06, 0]}>
          <boxGeometry args={[0.05, 0.07, 0.09]} />
          <meshStandardMaterial color={dark} roughness={0.6} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.08, 0.24, 0.12]}>
          <boxGeometry args={[0.1, 0.14, 0.08]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
        <mesh position={[-0.08, 0.24, -0.12]}>
          <boxGeometry args={[0.1, 0.14, 0.08]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
      </group>
      {/* Legs */}
      {(
        [
          [0.3, 0.11],
          [0.3, -0.11],
          [-0.3, 0.11],
          [-0.3, -0.11],
        ] as const
      ).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.11, lz]} castShadow>
          <boxGeometry args={[0.13, 0.22, 0.13]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
      ))}
      {/* Tail */}
      <group ref={tail} position={[-0.45, 0.58, 0]}>
        <mesh rotation={[0, 0, 0.7]} castShadow>
          <boxGeometry args={[0.3, 0.11, 0.11]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
      </group>

      {/* Breeding-style hearts, shown while being kissed at dinner */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            hearts.current[i] = el;
          }}
        >
          <Billboard>
            <mesh renderOrder={11}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial
                ref={(m) => {
                  heartMats.current[i] = m;
                }}
                map={tex}
                transparent
                opacity={0}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

/** Blocky farmer — meshes only; Farmstead's frame loop drives the refs. */
function FarmerRig({
  root,
  body,
  arms,
}: {
  root: RefObject<THREE.Group | null>;
  body: RefObject<THREE.Group | null>;
  arms: RefObject<THREE.Group | null>;
}) {
  const skin = "#d9a877";
  const robe = "#7a5540";
  const hair = "#3f2f22";

  return (
    <group ref={root} position={WPS[0].toArray()} rotation-y={Math.PI}>
      {/* Legs */}
      <mesh position={[0.12, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.2]} />
        <meshStandardMaterial color="#4c3a28" roughness={0.9} />
      </mesh>
      <mesh position={[-0.12, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.2]} />
        <meshStandardMaterial color="#4c3a28" roughness={0.9} />
      </mesh>
      <group ref={body} position={[0, 0.6, 0]}>
        {/* Torso robe */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.52, 0.84, 0.32]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.06, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.28, -0.02]}>
          <boxGeometry args={[0.42, 0.1, 0.44]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {/* Big villager nose */}
        <mesh position={[0, 0.98, 0.22]}>
          <boxGeometry args={[0.1, 0.18, 0.1]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
        {/* Arms + hoe, swinging as one unit */}
        <group ref={arms} position={[0, 0.72, 0.12]}>
          <mesh position={[0.2, -0.18, 0.1]} castShadow>
            <boxGeometry args={[0.14, 0.5, 0.14]} />
            <meshStandardMaterial color={robe} roughness={0.95} />
          </mesh>
          <mesh position={[-0.2, -0.18, 0.1]} castShadow>
            <boxGeometry args={[0.14, 0.5, 0.14]} />
            <meshStandardMaterial color={robe} roughness={0.95} />
          </mesh>
          {/* Hoe handle + head */}
          <mesh position={[0, -0.42, 0.45]} rotation={[1.15, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 1.1, 0.07]} />
            <meshStandardMaterial color="#8a6a3e" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.62, 0.92]}>
            <boxGeometry args={[0.3, 0.08, 0.14]} />
            <meshStandardMaterial color="#55565a" roughness={0.5} metalness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
