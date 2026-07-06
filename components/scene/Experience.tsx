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
      <fog attach="fog" args={["#d6a878", 46, 120]} />

      {/* Low golden sun raking from behind the house + warm sky fill */}
      <ambientLight intensity={0.5} color="#c3aeb0" />
      <directionalLight
        position={[34, 20, -58]}
        intensity={2.3}
        color="#ffcf95"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
      />

      <ScrollControls pages={SEGMENTS} damping={0.42} infinite>
        <CameraRig />
        <ScrollLoopFix />
        <VoxelWorld />
        <Figures />
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
