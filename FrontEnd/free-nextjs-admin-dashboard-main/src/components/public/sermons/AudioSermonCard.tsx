import React from "react";
import Link from "next/link";
import type { PublicSermon } from "@/api/public/content";

interface AudioSermonCardProps {
  sermon: PublicSermon;
  index?: number;
}

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
  if (!minutes || minutes <= 0) return "45:00";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:00`;
  }
  return `${remainingMinutes}:00`;
};

export default function AudioSermonCard({ sermon }: AudioSermonCardProps) {
  const formattedDate = formatDate(sermon.deliveryDate || sermon.publishDate || sermon.createdAt);
  const durationText = formatDuration(sermon.durationInMinutes || 45);

  return (
    <article className="group relative bg-[#FAFAF5] rounded-[16px] border border-[#E7E2D5] hover:border-[#D5DAC8] p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between text-right overflow-hidden">
      {/* Top Bar inside Card: Duration Badge (left) & Microphone icon (right/center) */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Duration Badge (Left in RTL) */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#222B18] text-[#FAFAF5] text-[11px] font-mono font-bold tracking-tight">
          {durationText}
        </span>

        {/* Audio Mic Icon (Top-center subtle accent) */}
        <div className="w-8 h-8 rounded-full bg-[#FAF3EF] text-[#C0673F] flex items-center justify-center shrink-0 border border-[#F5E3D8]/80 group-hover:scale-110 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
        </div>
      </div>

      {/* Center: Category Badge & Title */}
      <div className="space-y-2.5 my-auto text-center px-1 py-1">
        {sermon.categoryName && (
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11.5px] font-bold bg-[#FAF3EF] text-[#864024] border border-[#F5E3D8]">
              {sermon.categoryName}
            </span>
          </div>
        )}

        <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1E2616] group-hover:text-[#3F4A2B] transition-colors leading-[1.4] line-clamp-2">
          <Link href={`/sermons/${sermon.id}`} className="hover:text-[#C0673F] transition-colors">
            {sermon.title}
          </Link>
        </h3>

        {sermon.description && (
          <p className="text-[12.5px] text-[#555E46] line-clamp-2 leading-relaxed font-normal">
            {sermon.description}
          </p>
        )}
      </div>

      {/* Bottom Bar: Date & Audio Play/Listen Action */}
      <div className="mt-4 pt-3.5 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#555E46]">
        {/* Date */}
        <span className="text-[11.5px] text-[#78826B] font-medium">
          {formattedDate || "خطبة جمعة"}
        </span>

        {/* Audio Action -> Navigates to Sermon Details */}
        <Link
          href={`/sermons/${sermon.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF3EF] hover:bg-[#F5E3D8] text-[#864024] text-[12px] font-bold transition-colors cursor-pointer border border-[#EBC7B3]"
          aria-label={`استماع لـ ${sermon.title}`}
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>استماع صوتي</span>
        </Link>
      </div>
    </article>
  );
}
