"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PublicSermon } from "@/api/public/content";
import { useAudio, buildAudioTrack } from "@/context/AudioContext";
import HumanAudioPlayer from "../lessons/HumanAudioPlayer";

interface SermonDetailViewProps {
  sermon: PublicSermon;
  relatedSermons: PublicSermon[];
  prevSermon?: PublicSermon | null;
  nextSermon?: PublicSermon | null;
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
  if (!minutes || minutes <= 0) return "45:00";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:00`;
  }
  return `${remainingMinutes}:00`;
};

export default function SermonDetailView({
  sermon,
  relatedSermons = [],
  prevSermon,
  nextSermon,
}: SermonDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const { playTrack, togglePlay, isTrackActive, isPlaying } = useAudio();

  const audioUrl = getMediaUrl(sermon.audioFilePath);
  const formattedDate = formatDate(sermon.deliveryDate || sermon.publishDate || sermon.createdAt);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: sermon.description || sermon.title,
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePlayRelated = (rel: PublicSermon) => {
    if (isTrackActive(rel.id)) {
      togglePlay();
      return;
    }
    const track = buildAudioTrack(rel, `/sermons/${rel.id}`);
    if (track) {
      const allSermons = [sermon, ...relatedSermons];
      const playlist = allSermons
        .map((s) => buildAudioTrack(s, `/sermons/${s.id}`))
        .filter((t): t is NonNullable<typeof t> => t !== null);
      playTrack(track, playlist);
    }
  };

  const tags = ["خطبة جمعة", "موعظة", "التوبة", "الرقائق", "الدار الآخرة"];

  return (
    <div className="py-6 sm:py-10 text-right">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ================= BREADCRUMBS ================= */}
        <nav
          className="flex items-center gap-1.5 text-xs text-[#78826B] font-medium"
          aria-label="مسار الخطبة"
        >
          <Link href="/" className="hover:text-[#3F4A2B] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/sermons" className="hover:text-[#3F4A2B] transition-colors">
            مكتبة الخطب
          </Link>
          {sermon.categoryName && (
            <>
              <span>/</span>
              <Link
                href={sermon.categoryId ? `/sermons?categoryId=${sermon.categoryId}` : "/sermons"}
                className="hover:text-[#3F4A2B] transition-colors"
              >
                {sermon.categoryName}
              </Link>
            </>
          )}
        </nav>

        {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <main className="lg:col-span-8 space-y-6">
            {/* On-Page Full Audio Player (Syncs with persistent global AudioContext) */}
            <section aria-label="مشغل الخطبة الصوتي">
              <HumanAudioPlayer
                track={sermon}
                playlist={[sermon, ...relatedSermons]}
                pageUrl={`/sermons/${sermon.id}`}
                durationInMinutes={sermon.durationInMinutes || 45}
              />
            </section>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {sermon.categoryName && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3EF] text-[#C0673F] border border-[#F5E3D8]">
                    {sermon.categoryName}
                  </span>
                )}
                <span className="text-xs text-[#8E987B] font-medium">
                  خطبة رقم {sermon.id}
                </span>
              </div>

              <h1 className="text-base sm:text-lg lg:text-[20px] font-bold text-[#1E2616] tracking-tight leading-snug">
                {sermon.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#78826B]">
                {formattedDate && <span>{formattedDate}</span>}
                <span>•</span>
                <span>{sermon.durationInMinutes || 45}:00 دقيقة</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {audioUrl && (
                  <a
                    href={`/api/download?url=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(
                      `${sermon.title.trim().replace(/[\\/:*?"<>|]/g, "_") || "خطبة"}.mp3`
                    )}`}
                    download={`${sermon.title.trim().replace(/[\\/:*?"<>|]/g, "_") || "خطبة"}.mp3`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF3EF] hover:bg-[#F5E3D8] text-[#864024] text-xs font-bold border border-[#EBC7B3] transition-colors cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>تحميل الصوت</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F7F8F4] text-[#3F4A2B] text-xs font-bold border border-[#D5DAC8] transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>مشاركة</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F7F8F4] text-[#3F4A2B] text-xs font-bold border border-[#D5DAC8] transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copied ? "تم النسخ ✓" : "نسخ الرابط"}</span>
                </button>
              </div>
            </div>

            {/* About Sermon Card */}
            <div className="bg-white rounded-[20px] border border-[#E4E7DA] p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-[#1E2616] border-r-3 border-[#C0673F] pr-3">
                عن الخطبة
              </h2>

              <div className="text-sm text-[#4B533E] leading-[1.8] font-normal">
                {sermon.description ? (
                  <div>
                    <p className={!isDescExpanded ? "line-clamp-4" : ""}>
                      {sermon.description}
                    </p>
                    {sermon.description.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-xs font-bold text-[#C0673F] hover:underline mt-2 cursor-pointer"
                      >
                        {isDescExpanded ? "عرض أقل" : "عرض المزيد..."}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[#8E987B] text-xs">
                    خطبة جمعة منبرية مؤثرة لفضيلة الشيخ أبي ذر القلموني حفظه الله تعالى، تتناول مسائل الإيمان والتوبة والتحذير من الغفلة والفرار إلى الله عز وجل.
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="pt-3 border-t border-[#F2F4ED] flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-[#FAF7F1] text-[#656E54] border border-[#E4E7DA]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Previous / Next Sermon Navigation (Keeps audio playing across page transitions!) */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {prevSermon ? (
                <Link
                  href={`/sermons/${prevSermon.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F8F4] border border-[#D5DAC8] text-xs font-bold text-[#3F4A2B] transition-colors shadow-2xs"
                >
                  <span>الخطبة السابقة</span>
                </Link>
              ) : (
                <div />
              )}

              {nextSermon ? (
                <Link
                  href={`/sermons/${nextSermon.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F8F4] border border-[#D5DAC8] text-xs font-bold text-[#3F4A2B] transition-colors shadow-2xs"
                >
                  <span>الخطبة التالية</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#E4E7DA]">
              <h3 className="text-sm font-bold text-[#1E2616]">
                اسمع أيضاً
              </h3>
              <Link
                href="/sermons"
                className="text-xs font-bold text-[#C0673F] hover:text-[#9E4F28] transition-colors"
              >
                كل الخطب
              </Link>
            </div>

            <div className="space-y-3.5">
              {relatedSermons.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#F6F4ED] text-xs text-[#8E987B] text-center border border-[#EBE7DA]">
                  لا توجد خطب أخرى في هذه الفئة حالياً.
                </div>
              ) : (
                relatedSermons.map((rel) => {
                  const isRelActive = isTrackActive(rel.id);
                  const isRelPlaying = isRelActive && isPlaying;
                  const relDuration = formatDuration(rel.durationInMinutes || 45);
                  const relDate = formatDate(rel.deliveryDate || rel.publishDate || rel.createdAt);

                  return (
                    <Link
                      key={rel.id}
                      href={`/sermons/${rel.id}`}
                      className="group flex items-center justify-between gap-3 text-right hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <div className="space-y-1 flex-1 py-1">
                        <h4 className={`text-[14px] sm:text-[15px] font-bold leading-snug line-clamp-2 ${isRelActive ? "text-[#C0673F]" : "text-[#1E2516] group-hover:text-[#3F4A2B]"
                          }`}>
                          {rel.title}
                        </h4>
                        {rel.categoryName && (
                          <span className="block text-[12px] text-[#78826B] font-medium">
                            {rel.categoryName}
                          </span>
                        )}
                        <span className="block text-[11px] text-[#9EA891]">
                          {relDate}
                        </span>
                      </div>

                      <div className={`relative w-[110px] sm:w-[125px] h-[75px] sm:h-[82px] rounded-[18px] flex items-center justify-center shrink-0 border transition-colors ${isRelActive ? "bg-[#FAF1EC] border-[#E8C4B0]" : "bg-[#F6F4ED] border-[#EBE7DA]/80"
                        }`}>
                        {isRelPlaying ? (
                          <div className="flex gap-[3px] items-end h-5">
                            <span className="w-[3px] bg-[#C0673F] rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate", height: "60%" }} />
                            <span className="w-[3px] bg-[#C0673F] rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate 0.15s", height: "100%" }} />
                            <span className="w-[3px] bg-[#C0673F] rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate 0.3s", height: "40%" }} />
                          </div>
                        ) : (
                          <svg
                            className="w-5 h-5 text-[#9E7B54]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.7}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
                            />
                          </svg>
                        )}

                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#1E2516] text-[#FAFAF5] text-[10.5px] font-mono font-bold tracking-tight shadow-2xs">
                          {relDuration}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
