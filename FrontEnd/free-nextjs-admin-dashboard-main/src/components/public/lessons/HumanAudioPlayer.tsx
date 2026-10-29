"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAudio, buildAudioTrack } from "@/context/AudioContext";

interface TrackItem {
  id: number | string;
  title: string;
  audioFilePath?: string | null;
  categoryName?: string;
  durationInMinutes?: number | null;
}

interface HumanAudioPlayerProps {
  track?: TrackItem | null;
  playlist?: TrackItem[];
  pageUrl?: string;
  audioUrl?: string | null;
  durationInMinutes?: number | null;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

export default function HumanAudioPlayer({
  track,
  playlist = [],
  pageUrl,
  audioUrl: directAudioUrl,
  durationInMinutes = 45,
}: HumanAudioPlayerProps) {
  const {
    currentTrack,
    isPlaying: globalIsPlaying,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    playbackRate: globalPlaybackRate,
    volume: globalVolume,
    isMuted: globalIsMuted,
    playTrack,
    togglePlay,
    seekTo,
    seekRelative,
    cycleSpeed,
    setVolume,
    toggleMute,
    isTrackActive,
  } = useAudio();

  // Check if this track is currently active in the global audio context
  const isThisTrackActive = track
    ? isTrackActive(track.id)
    : directAudioUrl
      ? currentTrack?.audioUrl === directAudioUrl
      : false;

  // Derive audio state (from global context if active, or default inactive)
  const isPlaying = isThisTrackActive && globalIsPlaying;
  const currentTime = isThisTrackActive ? globalCurrentTime : 0;
  const defaultDurationSec = (durationInMinutes || track?.durationInMinutes || 45) * 60;
  const duration = isThisTrackActive && globalDuration > 0 ? globalDuration : defaultDurationSec;
  const playbackRate = isThisTrackActive ? globalPlaybackRate : 1;
  const volume = isThisTrackActive ? globalVolume : 1;
  const isMuted = isThisTrackActive ? globalIsMuted : false;

  // Local UI states
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubFraction, setScrubFraction] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Resolved audio URL
  const activeAudioUrl =
    directAudioUrl ||
    (track?.audioFilePath
      ? track.audioFilePath.startsWith("http")
        ? track.audioFilePath
        : `${process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com"}${track.audioFilePath.startsWith("/") ? "" : "/"
        }${track.audioFilePath}`
      : null);

  /* ── Start or toggle playback ── */
  const handleTogglePlay = () => {
    if (isThisTrackActive) {
      togglePlay();
      return;
    }

    if (track) {
      const audioTrack = buildAudioTrack(track, pageUrl);
      if (audioTrack) {
        const fullPlaylist =
          playlist.length > 0
            ? playlist
              .map((p) => buildAudioTrack(p, pageUrl))
              .filter((t): t is NonNullable<typeof t> => t !== null)
            : [audioTrack];
        playTrack(audioTrack, fullPlaylist);
      }
    } else if (activeAudioUrl) {
      const fallbackTrack = {
        id: "direct-audio",
        title: "تسجيل صوتي",
        audioUrl: activeAudioUrl,
        durationInMinutes,
        pageUrl,
      };
      playTrack(fallbackTrack, [fallbackTrack]);
    }
  };

  /* ── Spacebar shortcut: Start playing this track if no global track is active ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox" ||
          target.getAttribute("role") === "searchbox"
        ) {
          return;
        }
      }

      // If no track is currently playing globally, pressing Space starts this track
      if (!currentTrack && (track || activeAudioUrl)) {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentTrack, track, activeAudioUrl, isThisTrackActive]);

  /* ── Scrubbing / Seeking logic ── */
  const calculateFractionFromPointer = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    // RTL: Right is 0%, Left is 100%
    const clickX = clientX - rect.left;
    const fractionFromRight = 1 - clickX / rect.width;
    return Math.min(Math.max(fractionFromRight, 0), 1);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    const fraction = calculateFractionFromPointer(e.clientX);
    setScrubFraction(fraction);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing || !duration) return;
    const fraction = calculateFractionFromPointer(e.clientX);
    setScrubFraction(fraction);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const fraction = calculateFractionFromPointer(e.clientX);
    const newTime = fraction * duration;

    if (isThisTrackActive) {
      seekTo(newTime);
    } else if (track) {
      const audioTrack = buildAudioTrack(track, pageUrl);
      if (audioTrack) {
        const fullPlaylist =
          playlist.length > 0
            ? playlist
              .map((p) => buildAudioTrack(p, pageUrl))
              .filter((t): t is NonNullable<typeof t> => t !== null)
            : [audioTrack];
        playTrack(audioTrack, fullPlaylist);
        setTimeout(() => seekTo(newTime), 60);
      }
    }

    setIsScrubbing(false);
    setScrubFraction(null);
  };

  /* ── Relative seek (+/- 10s) ── */
  const handleSeekRelative = (seconds: number) => {
    if (isThisTrackActive) {
      seekRelative(seconds);
    } else {
      handleTogglePlay();
    }
  };

  /* ── Speed cycling ── */
  const handleCycleSpeed = () => {
    if (isThisTrackActive) {
      cycleSpeed();
    }
  };

  /* ── Volume change ── */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  /* ── Format helper ── */
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressFraction = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const activeFraction =
    isScrubbing && scrubFraction !== null ? scrubFraction : progressFraction;

  return (
    <div
      className="w-full rounded-2xl bg-[#FAF8F3] border border-[#E3DEC9] p-4 sm:p-5 shadow-xs select-none"
      dir="rtl"
    >
      {/* ================= CLEAN SLIM PROGRESS BAR (RTL: Starts from Right) ================= */}
      <div className="space-y-1" dir="rtl">
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative py-2 cursor-pointer group flex items-center touch-none select-none"
          role="slider"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-label="شريط تقدم المقطع الصوتي"
          title="اسحب أو انقر للتنقل في التسجيل"
        >
          {/* Track Bar */}
          <div className="relative w-full h-2 rounded-full bg-[#E2DCBA] overflow-visible">
            {/* Active Progress Fill (Grows from Right to Left) */}
            <div
              style={{
                width: `${Math.min(Math.max(activeFraction * 100, 0), 100)}%`,
              }}
              className={`absolute right-0 top-0 h-full bg-[#3F4A2B] rounded-full ${isScrubbing ? "" : "transition-[width] duration-100 ease-linear"
                }`}
            >
              {/* Scrubber Thumb Handle */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#3F4A2B] border-2 border-white shadow-md transition-transform ${isScrubbing
                    ? "w-4 h-4 scale-125"
                    : "w-3.5 h-3.5 opacity-90 group-hover:scale-110"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Timestamps: Current time on Right (00:00), Total duration on Left (34:00) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#677353] select-none">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* ================= CONTROLS ROW ================= */}
      <div className="mt-3 pt-2.5 border-t border-[#EDE8DA] flex items-center justify-between">
        {/* Speed Pill (Left in RTL) */}
        <button
          type="button"
          onClick={handleCycleSpeed}
          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2EFE6] text-[11px] font-bold text-[#3F4A2B] transition-colors cursor-pointer border border-[#DCD6C2] shadow-2xs"
          title="سرعة التشغيل"
        >
          {playbackRate}x
        </button>

        {/* Center: Forward, Main Play, Rewind */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* تأخير 10 ثوان */}
          <button
            type="button"
            onClick={() => handleSeekRelative(-10)}
            className="w-8 h-8 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer"
            title="تأخير 10 ثوان"
            aria-label="تأخير 10 ثوان"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
              />
            </svg>
          </button>

          {/* Main Play / Pause Button - Calm Olive */}
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!activeAudioUrl}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-transform duration-150 active:scale-95 cursor-pointer ${activeAudioUrl
                ? "bg-[#3F4A2B] hover:bg-[#2F3820] text-[#FAFAF5] hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل المقطع"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 fill-current translate-x-[-1px]"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* تقديم 10 ثوان */}
          <button
            type="button"
            onClick={() => handleSeekRelative(10)}
            className="w-8 h-8 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer"
            title="تقديم 10 ثوان"
            aria-label="تقديم 10 ثوان"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
              />
            </svg>
          </button>
        </div>

        {/* Volume & Mute (Right in RTL) */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            type="button"
            onClick={toggleMute}
            className="w-7 h-7 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer"
            title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            aria-label="مستوى الصوت"
          >
            {isMuted || volume === 0 ? (
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>

          {showVolumeSlider && (
            <div className="absolute bottom-8 right-0 bg-white border border-[#DCD6C2] p-2 rounded-xl shadow-lg flex items-center z-20">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-[#3F4A2B] cursor-pointer"
                aria-label="تعديل شدة الصوت"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
