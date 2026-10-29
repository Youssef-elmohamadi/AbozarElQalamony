"use client";

import React, { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAudio, isPathOnTrack } from "@/context/AudioContext";

/* ─── Format helpers ─── */
const formatTime = (secs: number) => {
  if (isNaN(secs) || secs < 0) return "00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function GlobalAudioPlayer() {
  const pathname = usePathname();
  const {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    isPlayerVisible,
    playTrack,
    togglePlay,
    seekTo,
    seekRelative,
    setVolume,
    toggleMute,
    cycleSpeed,
    playNext,
    playPrev,
    closePlayer,
  } = useAudio();

  /* ── Local UI state ── */
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  /* ── Scrubbing / progress bar ── */
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubFraction, setScrubFraction] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const isOnTrackPage = isPathOnTrack(pathname, currentTrack);

  // Bottom bar only shows when a track is active AND user leaves the track's page
  if (!isPlayerVisible || !currentTrack || isOnTrackPage) return null;

  const progressFraction = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const activeFraction =
    isScrubbing && scrubFraction !== null ? scrubFraction : progressFraction;

  const calcFractionFromPointer = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    // RTL: right = 0%, left = 100%
    const clickX = clientX - rect.left;
    const fromRight = 1 - clickX / rect.width;
    return Math.min(Math.max(fromRight, 0), 1);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    const f = calcFractionFromPointer(e.clientX);
    setScrubFraction(f);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing || !duration) return;
    const f = calcFractionFromPointer(e.clientX);
    setScrubFraction(f);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (duration && scrubFraction !== null) {
      seekTo(scrubFraction * duration);
    }
    setIsScrubbing(false);
    setScrubFraction(null);
  };

  /* ── Check if can go next/prev ── */
  const currentIdx = playlist.findIndex((t) => t.id === currentTrack.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < playlist.length - 1;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MAIN PLAYER BAR — Fixed at the bottom of the viewport
         ═══════════════════════════════════════════════════════ */}
      <div
        dir="rtl"
        className="fixed bottom-0 left-0 right-0 z-[999] transition-all duration-300 ease-out"
      >
        {/* ── Playlist Dropdown (above the player bar) ── */}
        {showPlaylist && playlist.length > 0 && (
          <div className="mx-2 sm:mx-4 mb-1 max-h-[280px] overflow-y-auto rounded-t-2xl bg-white/95 backdrop-blur-xl border border-b-0 border-[#E3DEC9] shadow-2xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-4 py-3 border-b border-[#F0EBE0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E2118]">
                قائمة التشغيل
                <span className="text-[11px] text-[#8C8379] font-normal mr-2">
                  {currentIdx + 1} من {playlist.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPlaylist(false)}
                className="p-1 rounded-lg hover:bg-black/5 text-[#8C8379] transition-colors"
              >
                <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {playlist.map((track, idx) => {
              const isActive = track.id === currentTrack.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    playTrack(track, playlist);
                  }}
                  className={`w-full text-right px-4 py-3 flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-[#FAF1EC]"
                      : "hover:bg-[#FAF8F5]"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      isActive
                        ? "bg-[#C0673F] text-white"
                        : "bg-[#EFEAE2] text-[#696156]"
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <span className="flex gap-[2px] items-end h-3">
                        <span className="w-[2px] h-full bg-white rounded-full animate-pulse" />
                        <span className="w-[2px] h-2/3 bg-white rounded-full animate-pulse [animation-delay:0.15s]" />
                        <span className="w-[2px] h-full bg-white rounded-full animate-pulse [animation-delay:0.3s]" />
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive ? "text-[#A4532B]" : "text-[#1E2118]"
                    }`}
                  >
                    {track.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Player Bar ── */}
        <div className="bg-[#FDFCF7]/95 backdrop-blur-xl border-t border-[#E3DEC9] shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
          {/* ── Top: Thin Progress Bar (spans full width) ── */}
          <div
            ref={progressBarRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative h-[6px] cursor-pointer group touch-none select-none"
            role="slider"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-label="شريط تقدم الدرس"
          >
            <div className="absolute inset-0 bg-[#E8E2CC]">
              <div
                style={{
                  width: `${Math.min(Math.max(activeFraction * 100, 0), 100)}%`,
                }}
                className={`absolute right-0 top-0 h-full bg-gradient-to-l from-[#3F4A2B] to-[#5A6840] ${
                  isScrubbing ? "" : "transition-[width] duration-100 ease-linear"
                }`}
              >
                {/* Scrubber thumb */}
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#3F4A2B] border-2 border-white shadow-md transition-transform ${
                    isScrubbing
                      ? "w-4 h-4 scale-110"
                      : "w-0 h-0 opacity-0 group-hover:w-3 group-hover:h-3 group-hover:opacity-100"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ── Main Controls Row ── */}
          <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center gap-3 sm:gap-4">
            {/* — Close button — */}
            <button
              type="button"
              onClick={closePlayer}
              className="p-1.5 rounded-lg text-[#A09889] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="إغلاق المشغل"
            >
              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* — Track Info — */}
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[13px] sm:text-sm font-bold text-[#1E2118] truncate leading-tight">
                {currentTrack.title}
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#8C8379] truncate leading-tight mt-0.5">
                {currentTrack.categoryName || "فضيلة الشيخ أبو ذر القلموني"}
              </p>
            </div>

            {/* — Timestamps — */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#8C8379] shrink-0">
              <span>{formatTime(currentTime)}</span>
              <span className="text-[#C5BEB5]">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* — Playback Speed — */}
            <button
              type="button"
              onClick={cycleSpeed}
              className="hidden sm:flex px-2 py-1 rounded-lg bg-[#F5F0E5] hover:bg-[#EBE5D5] text-[11px] font-bold text-[#3F4A2B] transition-colors border border-[#DCD6C2] shrink-0"
              title="سرعة التشغيل"
            >
              {playbackRate}x
            </button>

            {/* — Playlist toggle — */}
            {playlist.length > 1 && (
              <button
                type="button"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  showPlaylist
                    ? "text-[#C0673F] bg-[#FAF1EC]"
                    : "text-[#8C8276] hover:text-[#1E2118] hover:bg-black/5"
                }`}
                title="قائمة التشغيل"
              >
                <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 10h16M4 14h10m-10 4h6" />
                </svg>
              </button>
            )}

            {/* — Skip Backward (10s) — */}
            <button
              type="button"
              onClick={() => seekRelative(-10)}
              className="p-1 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors shrink-0"
              title="تأخير 10 ثوان"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                />
              </svg>
            </button>

            {/* — Prev Track — */}
            <button
              type="button"
              onClick={playPrev}
              disabled={!hasPrev}
              className={`p-1 rounded-full transition-colors shrink-0 ${
                hasPrev
                  ? "text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5"
                  : "text-[#D0CBBC] cursor-not-allowed"
              }`}
              title="الدرس السابق"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* — Play / Pause — */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#C0673F] hover:bg-[#A8532D] text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-current translate-x-[-1px]" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* — Next Track — */}
            <button
              type="button"
              onClick={playNext}
              disabled={!hasNext}
              className={`p-1 rounded-full transition-colors shrink-0 ${
                hasNext
                  ? "text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5"
                  : "text-[#D0CBBC] cursor-not-allowed"
              }`}
              title="الدرس التالي"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* — Skip Forward (10s) — */}
            <button
              type="button"
              onClick={() => seekRelative(10)}
              className="p-1 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors shrink-0"
              title="تقديم 10 ثوان"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                />
              </svg>
            </button>

            {/* — Volume — */}
            <div
              className="relative hidden sm:flex items-center shrink-0"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors"
                title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="absolute bottom-full mb-2 right-0 bg-white/95 backdrop-blur-xl border border-[#DCD6C2] p-2.5 rounded-xl shadow-xl z-20">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-[#3F4A2B] cursor-pointer"
                    aria-label="مستوى الصوت"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

