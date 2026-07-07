"use client";

import dynamic from "next/dynamic";
import { useSiteStore } from "@/lib/store";
import NavDots from "@/components/ui/NavDots";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SimpleView from "@/components/ui/SimpleView";
import ModeToggle from "@/components/ui/ModeToggle";
import SoundToggle from "@/components/ui/SoundToggle";
import AchievementToast from "@/components/ui/AchievementToast";
import BugCounter from "@/components/ui/BugCounter";
import VaultOverlay from "@/components/ui/VaultOverlay";

const Experience = dynamic(() => import("@/components/scene/Experience"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const simple = useSiteStore((s) => s.simpleMode);

  return (
    <main className="h-dvh w-screen overflow-hidden">
      {simple ? (
        <SimpleView />
      ) : (
        <>
          <Experience />
          <NavDots />
          <AchievementToast />
          <BugCounter />
          <VaultOverlay />
          <LoadingScreen />
        </>
      )}
      <ModeToggle />
      <SoundToggle />
    </main>
  );
}
