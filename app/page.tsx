"use client";

import dynamic from "next/dynamic";
import { useSiteStore } from "@/lib/store";
import Hotbar from "@/components/ui/Hotbar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SimpleView from "@/components/ui/SimpleView";
import ModeToggle from "@/components/ui/ModeToggle";
import SoundToggle from "@/components/ui/SoundToggle";
import AudioAutoStart from "@/components/ui/AudioAutoStart";
import AchievementToast from "@/components/ui/AchievementToast";
import BugCounter from "@/components/ui/BugCounter";
import VaultOverlay from "@/components/ui/VaultOverlay";
import TerminalOverlay from "@/components/ui/TerminalOverlay";
import LookHint from "@/components/ui/LookHint";

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
          <Hotbar />
          <AchievementToast />
          <BugCounter />
          <VaultOverlay />
          <TerminalOverlay />
          <LookHint />
          <LoadingScreen />
        </>
      )}
      <ModeToggle />
      <SoundToggle />
      <AudioAutoStart />
    </main>
  );
}
