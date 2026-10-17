"use client";

import React, { useState, useRef, useEffect } from "react";

interface HumanAudioPlayerProps {
  audioUrl?: string | null;
  durationInMinutes?: number | null;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

export default function HumanAudioPlayer({
  audioUrl,
  durationInMinutes = 45,
}: HumanAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState((durationInMinutes || 45) * 60);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn("Audio playback prevented:", err);
      });
    }
  };

  const seekRelative = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.min(Math.max(audio.currentTime + seconds, 0), duration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubFraction, setScrubFraction] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const calculateFractionFromPointer = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    // RTL: Right is 0%, Left is 100%
    const clickX = clientX - rect.left;
    const fractionFromRight = 1 - (clickX / rect.width);
    return Math.min(Math.max(fractionFromRight, 0), 1);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    const fraction = calculateFractionFromPointer(e.clientX);
    setScrubFraction(fraction);
    const newTime = fraction * duration;
    setCurrentTime(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing || !duration) return;
    const fraction = calculateFractionFromPointer(e.clientX);
    setScrubFraction(fraction);
    const newTime = fraction * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const fraction = calculateFractionFromPointer(e.clientX);
    if (duration) {
      const newTime = fraction * duration;
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
      setCurrentTime(newTime);
    }
    setIsScrubbing(false);
    setScrubFraction(null);
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIndex];
    setPlaybackRate(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

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

  const activeFraction = isScrubbing && scrubFraction !== null ? scrubFraction : progressFraction;

  return (
    <div className="w-full rounded-2xl bg-[#FAF8F3] border border-[#E3DEC9] p-4 sm:p-5 shadow-xs select-none" dir="rtl">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

      {/* ================= CLEAN SLIM PROGRESS BAR (RTL: Starts from Right) ================= */}
      <div className="space-y-1" dir="rtl">
        {/* Outer clickable track wrapper with comfortable vertical padding for easy grabbing */}
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
          aria-label="شريط تقدم الدرس"
          title="اسحب أو انقر للتنقل في الدرس"
        >
          {/* Track Bar */}
          <div className="relative w-full h-2 rounded-full bg-[#E2DCBA] overflow-visible">
            {/* Active Progress Fill (Grows from Right to Left) */}
            <div
              style={{ width: `${Math.min(Math.max(activeFraction * 100, 0), 100)}%` }}
              className={`absolute right-0 top-0 h-full bg-[#3F4A2B] rounded-full ${
                isScrubbing ? "" : "transition-[width] duration-100 ease-linear"
              }`}
            >
              {/* Sleek Scrubber Thumb Handle (at the left edge of the fill in RTL) */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#3F4A2B] border-2 border-white shadow-md transition-transform ${
                  isScrubbing ? "w-4 h-4 scale-125" : "w-3.5 h-3.5 opacity-90 group-hover:scale-110"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Timestamps: Current time on Right (00:00), Total duration on Left (34:00) in RTL */}
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
          onClick={cycleSpeed}
          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2EFE6] text-[11px] font-bold text-[#3F4A2B] transition-colors cursor-pointer border border-[#DCD6C2] shadow-2xs"
          title="سرعة التشغيل"
        >
          {playbackRate}x
        </button>

        {/* Center: Forward, Main Play, Rewind */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* تقديم 10 ثوان */}
          <button
            type="button"
            onClick={() => seekRelative(-10)}
            className="w-8 h-8 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer"
            title="تأخير 10 ثوان"
            aria-label="تأخير 10 ثوان"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Main Play / Pause Button - Calm Olive */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-transform duration-150 active:scale-95 cursor-pointer ${
              audioUrl
                ? "bg-[#3F4A2B] hover:bg-[#2F3820] text-[#FAFAF5] hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل الدرس"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current translate-x-[-1px]" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* تأخير 10 ثوان */}
          <button
            type="button"
            onClick={() => seekRelative(10)}
            className="w-8 h-8 rounded-full text-[#5B664B] hover:text-[#2F3820] hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer"
            title="تقديم 10 ثوان"
            aria-label="تقديم 10 ثوان"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
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
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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
