"use client";

import React from "react";
import type { PublicQuran } from "@/api/public/content";
import { useAudio, buildAudioTrack } from "@/context/AudioContext";

interface QuranCardProps {
  item: PublicQuran;
  index?: number;
}

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
};

const formatDuration = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return "25:00";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:00`;
  }
  return `${remainingMinutes}:00`;
};

export default function QuranCard({ item }: QuranCardProps) {
  const { playTrack, togglePlay, isTrackActive, isPlaying } = useAudio();
  const trackId = `quran-${item.id}`;
  const isActive = isTrackActive(trackId);
  const isCurrentPlaying = isActive && isPlaying;

  const audioUrl = getMediaUrl(item.audioFilePath);
  const formattedDate = formatDate(item.publishDate || item.createdAt);
  const durationText = formatDuration(item.durationInMinutes);

  const handlePlayQuran = () => {
    if (isActive) {
      togglePlay();
      return;
    }
    const track = buildAudioTrack({
      id: trackId,
      title: item.title,
      audioFilePath: item.audioFilePath,
      categoryName: item.surahName ? `سورة ${item.surahName}` : (item.categoryName || "تلاوة قرآنية"),
      durationInMinutes: item.durationInMinutes,
    });
    if (track) {
      playTrack(track);
    }
  };

  return (
    <article className={`group relative rounded-[16px] border p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between text-right overflow-hidden ${isActive
        ? "bg-[#FAF7F1] border-[#C0673F]"
        : "bg-[#FAFAF5] border-[#E7E2D5] hover:border-[#C0673F]/60"
      }`}>
      {/* Top Bar: Duration & Surah Number Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Duration badge */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#222B18] text-[#FAFAF5] text-[11px] font-mono font-bold tracking-tight">
          {durationText}
        </span>

        {/* Surah Name / Number badge */}
        {item.surahName && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FAF3EF] text-[#864024] border border-[#F5E3D8]">
            <svg className="w-3.5 h-3.5 text-[#C0673F]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4 8-4 8 4-8 4zm-9 3l9 4.5 9-4.5v3L12 22 3 17.5v-3z" />
            </svg>
            <span>سورة {item.surahName}</span>
            {item.surahNumber && <span className="opacity-75">({item.surahNumber})</span>}
          </span>
        )}
      </div>

      {/* Center: Category Badge & Title & Description */}
      <div className="space-y-2.5 my-auto text-center px-1 py-1">
        {item.categoryName && (
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11.5px] font-bold bg-[#F2F5EC] text-[#3F4A2B] border border-[#DFE5D7]">
              {item.categoryName}
            </span>
          </div>
        )}

        <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1E2616] group-hover:text-[#864024] transition-colors leading-[1.4] line-clamp-2">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-[12.5px] text-[#555E46] line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>
        )}
      </div>

      {/* Bottom Bar: Date & Audio Play */}
      <div className="mt-4 pt-3.5 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#555E46]">
        {/* Date */}
        <span className="text-[11.5px] text-[#78826B] font-medium">
          {formattedDate || "تلاوة مباركة"}
        </span>

        {/* Audio Action (Global Audio Integration) */}
        {audioUrl ? (
          <button
            type="button"
            onClick={handlePlayQuran}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer border ${isActive
                ? "bg-[#C0673F] text-white border-[#C0673F] shadow-sm"
                : "bg-[#FAF3EF] hover:bg-[#F5E3D8] text-[#864024] border-[#EBC7B3]"
              }`}
            aria-label={isCurrentPlaying ? `إيقاف مؤقت لـ ${item.title}` : `استماع لـ ${item.title}`}
          >
            {isCurrentPlaying ? (
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            <span>{isCurrentPlaying ? "إيقاف مؤقت" : isActive ? "متابعة" : "استماع للتلاوة"}</span>
          </button>
        ) : (
          <span className="text-[11px] text-[#8E987B] font-medium">
            تسجيل صوتي
          </span>
        )}
      </div>
    </article>
  );
}
