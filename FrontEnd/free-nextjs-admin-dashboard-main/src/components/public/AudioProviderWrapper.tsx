"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AudioProvider, useAudio, isPathOnTrack } from "@/context/AudioContext";
import GlobalAudioPlayer from "@/components/public/GlobalAudioPlayer";

function AudioContentPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isPlayerVisible, currentTrack } = useAudio();
  const isOnTrackPage = isPathOnTrack(pathname, currentTrack);
  const showBottomBar = isPlayerVisible && currentTrack && !isOnTrackPage;

  return (
    <div
      className={`flex flex-col min-h-screen transition-[padding] duration-300 ease-out ${
        showBottomBar ? "pb-20" : ""
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Client-side wrapper that provides the global AudioContext,
 * renders the persistent audio player bar, and ensures
 * proper bottom padding only when the floating bottom bar is visible.
 */
export default function AudioProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AudioProvider>
      <AudioContentPadding>{children}</AudioContentPadding>
      <GlobalAudioPlayer />
    </AudioProvider>
  );
}
