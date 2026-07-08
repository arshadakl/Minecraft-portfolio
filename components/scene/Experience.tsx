"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import CameraRig from "./CameraRig";
import ScrollLoopFix from "./ScrollLoopFix";
import VoxelWorld from "./VoxelWorld";
import DuskSky from "./DuskSky";
import Door from "./Door";
import NameSign from "./rooms/NameSign";
import EntryHall from "./rooms/EntryHall";
import AboutRoom from "./rooms/AboutRoom";
import AchievementsRoom from "./rooms/AchievementsRoom";
import ExperienceRoom from "./rooms/ExperienceRoom";
import ProjectsRoom from "./rooms/ProjectsRoom";
import SkillsRoom from "./rooms/SkillsRoom";
import ContactRoom from "./rooms/ContactRoom";
import Figures from "./Figures";
import Bugs from "./Bugs";
import Vault from "./Vault";
import Lever from "./Lever";
import Rain from "./Rain";
import RedstoneWall from "./RedstoneWall";
import SceneAtmosphere from "./SceneAtmosphere";
import { SEGMENTS } from "@/lib/path";

/** The full 3D tour: golden-hour cottage, scroll rig, all room content. */
export default function Experience() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.8, 30], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.12;
      }}
    >
      <DuskSky />
      {/* Fog + sun/moon + ambient — cross-fades when the lever flips */}
      <SceneAtmosphere />
      {/* Passing showers on a timer; the couple's umbrella follows it */}
      <Rain />

      <ScrollControls pages={SEGMENTS} damping={0.42} infinite>
        <CameraRig />
        <ScrollLoopFix />
        <VoxelWorld />
        <Figures />
        <Bugs />
        <Vault />
        <Lever />
        <RedstoneWall />
        <Door />
        <NameSign />
        <EntryHall />
        <Suspense fallback={null}>
          <AboutRoom />
        </Suspense>
        <AchievementsRoom />
        <ExperienceRoom />
        <ProjectsRoom />
        <SkillsRoom />
        <ContactRoom />
      </ScrollControls>
    </Canvas>
  );
}
