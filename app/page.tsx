"use client";

import dynamic from "next/dynamic";
import { useSiteStore } from "@/lib/store";
import NavDots from "@/components/ui/NavDots";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SimpleView from "@/components/ui/SimpleView";
import ModeToggle from "@/components/ui/ModeToggle";
import SoundToggle from "@/components/ui/SoundToggle";

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
          <LoadingScreen />
        </>
      )}
      <ModeToggle />
      <SoundToggle />
    </main>
  );
}
