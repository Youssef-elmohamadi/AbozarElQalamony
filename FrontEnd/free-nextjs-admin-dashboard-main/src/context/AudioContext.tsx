"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

/* ─── Types ─── */
export interface AudioTrack {
  id: number | string;
  title: string;
  audioUrl: string;
  categoryName?: string;
  durationInMinutes?: number | null;
  pageUrl?: string;
}

interface AudioState {
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isPlayerVisible: boolean;
}

interface AudioContextValue extends AudioState {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playTrack: (track: AudioTrack, playlist?: AudioTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  seekRelative: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  cycleSpeed: () => void;
  playNext: () => void;
  playPrev: () => void;
  closePlayer: () => void;
  isTrackActive: (trackId: number | string) => boolean;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];
const STORAGE_KEY = "abozar_audio_state";

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

/* ─── Helper: Resolve media URL ─── */
const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

/* ─── Provider ─── */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  /* ── Restore last session from localStorage ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.currentTrack) {
          setCurrentTrack(data.currentTrack);
          setPlaylist(data.playlist || []);
          setCurrentTime(data.currentTime || 0);
          setPlaybackRate(data.playbackRate || 1);
          setVolume(data.volume ?? 1);
          setIsPlayerVisible(true);
          // Don't auto-play on restore
        }
      }
    } catch {
      // ignore
    }
  }, []);

  /* ── Persist state to localStorage ── */
  useEffect(() => {
    if (currentTrack) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            currentTrack,
            playlist,
            currentTime,
            playbackRate,
            volume,
          })
        );
      } catch {
        // ignore
      }
    }
  }, [currentTrack, playlist, currentTime, playbackRate, volume]);

  /* ── Audio element event listeners ── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      // Auto-play next in playlist
      const idx = playlist.findIndex((t) => t.id === currentTrack?.id);
      if (idx >= 0 && idx < playlist.length - 1) {
        const next = playlist[idx + 1];
        setCurrentTrack(next);
        setCurrentTime(0);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => { });
            setIsPlaying(true);
          }
        }, 100);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [currentTrack, playlist]);

  /* ── When track changes, load and play ── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.audioUrl;
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.load();

    // Restore saved position if resuming same track from localStorage
    const savedRaw = localStorage.getItem(STORAGE_KEY);
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        if (saved.currentTrack?.id === currentTrack.id && saved.currentTime > 0) {
          audio.currentTime = saved.currentTime;
        }
      } catch {
        // ignore
      }
    }
  }, [currentTrack?.id, currentTrack?.audioUrl]);

  /* ── Media Session API for OS-level controls ── */
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: "فضيلة الشيخ أبو ذر القلموني",
      album: currentTrack.categoryName || "دروس ومحاضرات",
    });

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().catch(() => { });
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
      }
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + 10,
          duration
        );
      }
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      playPrev();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      playNext();
    });
  }, [currentTrack, duration]);

  /* ── Keyboard shortcut: Spacebar to toggle Play/Pause ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;

      // Do NOT intercept if user is typing in form inputs / textareas
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

      // If a track is active, toggle playback and prevent default page scroll
      if (currentTrack && audioRef.current) {
        e.preventDefault();
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => { });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentTrack, isPlaying]);

  /* ─── Actions ─── */

  const playTrack = useCallback(
    (track: AudioTrack, newPlaylist?: AudioTrack[]) => {
      if (newPlaylist) {
        setPlaylist(newPlaylist);
      }

      if (currentTrack?.id === track.id) {
        // Same track, toggle play/pause
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play().catch(() => { });
          }
        }
        setIsPlayerVisible(true);
        return;
      }

      setCurrentTrack(track);
      setCurrentTime(0);
      setIsPlayerVisible(true);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => { });
          setIsPlaying(true);
        }
      }, 100);
    },
    [currentTrack?.id, isPlaying]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => { });
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const seekRelative = useCallback(
    (seconds: number) => {
      if (audioRef.current) {
        const newTime = Math.min(
          Math.max(audioRef.current.currentTime + seconds, 0),
          duration
        );
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      audioRef.current.muted = next;
    }
  }, [isMuted]);

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playbackRate);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }, [playbackRate]);

  const playNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    if (idx >= 0 && idx < playlist.length - 1) {
      const next = playlist[idx + 1];
      setCurrentTrack(next);
      setCurrentTime(0);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => { });
          setIsPlaying(true);
        }
      }, 100);
    }
  }, [currentTrack, playlist]);

  const playPrev = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      const prev = playlist[idx - 1];
      setCurrentTrack(prev);
      setCurrentTime(0);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => { });
          setIsPlaying(true);
        }
      }, 100);
    }
  }, [currentTrack, playlist]);

  const closePlayer = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setIsPlayerVisible(false);
    setCurrentTrack(null);
    setPlaylist([]);
    setCurrentTime(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isTrackActive = useCallback(
    (trackId: number | string) => currentTrack?.id === trackId,
    [currentTrack?.id]
  );

  const value: AudioContextValue = {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    isPlayerVisible,
    audioRef,
    playTrack,
    togglePlay,
    pause,
    seekTo,
    seekRelative,
    setVolume,
    toggleMute,
    cycleSpeed,
    playNext,
    playPrev,
    closePlayer,
    isTrackActive,
  };

  return (
    <AudioContext.Provider value={value}>
      {/* The single persistent <audio> element that never unmounts */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </AudioContext.Provider>
  );
}

/* ─── Hook ─── */
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

/* ─── Helper to build AudioTrack from lesson/sermon data ─── */
export function buildAudioTrack(
  item: {
    id: number | string;
    title: string;
    audioFilePath?: string | null;
    categoryName?: string;
    durationInMinutes?: number | null;
  },
  pageUrl?: string
): AudioTrack | null {
  const audioUrl = getMediaUrl(item.audioFilePath);
  if (!audioUrl) return null;
  return {
    id: item.id,
    title: item.title,
    audioUrl,
    categoryName: item.categoryName,
    durationInMinutes: item.durationInMinutes,
    pageUrl,
  };
}

/* ─── Helper to determine if current route is the page of the track ─── */
export function isPathOnTrack(
  pathname: string | null | undefined,
  track: AudioTrack | null | undefined
): boolean {
  if (!pathname || !track) return false;
  const cleanPath = pathname.replace(/\/$/, "");
  if (track.pageUrl && cleanPath === track.pageUrl.replace(/\/$/, "")) {
    return true;
  }
  // Fallback pattern matching for standard lesson & sermon routes
  const trackIdStr = String(track.id);
  if (
    cleanPath === `/lessons/${trackIdStr}` ||
    cleanPath === `/sermons/${trackIdStr}`
  ) {
    return true;
  }
  return false;
}
