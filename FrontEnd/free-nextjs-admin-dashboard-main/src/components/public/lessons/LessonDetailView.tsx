"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PublicLesson } from "@/api/public/content";
import { useAudio, buildAudioTrack } from "@/context/AudioContext";
import HumanAudioPlayer from "./HumanAudioPlayer";

interface LessonDetailViewProps {
  lesson: PublicLesson;
  relatedLessons: PublicLesson[];
  prevLesson?: PublicLesson | null;
  nextLesson?: PublicLesson | null;
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

export default function LessonDetailView({
  lesson,
  relatedLessons = [],
  prevLesson,
  nextLesson,
}: LessonDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const { playTrack, togglePlay, isTrackActive, isPlaying } = useAudio();

  const audioUrl = getMediaUrl(lesson.audioFilePath);
  const formattedDate = formatDate(lesson.publishDate || lesson.createdAt);

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
          title: lesson.title,
          text: lesson.description || lesson.title,
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePlayRelated = (rel: PublicLesson) => {
    if (isTrackActive(rel.id)) {
      togglePlay();
      return;
    }
    const track = buildAudioTrack(rel, `/lessons/${rel.id}`);
    if (track) {
      const allLessons = [lesson, ...relatedLessons];
      const playlist = allLessons
        .map((l) => buildAudioTrack(l, `/lessons/${l.id}`))
        .filter((t): t is NonNullable<typeof t> => t !== null);
      playTrack(track, playlist);
    }
  };

  // Derive lecture tags / topics
  const tags = ["التزكية", "الرقائق", "التوبة", "الفرار إلى الله"];

  return (
    <div className="py-6 sm:py-10 text-right">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ================= BREADCRUMBS ================= */}
        <nav
          className="flex items-center gap-1.5 text-xs text-[#78826B] font-medium"
          aria-label="مسار الدرس"
        >
          <Link href="/" className="hover:text-[#3F4A2B] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/lessons" className="hover:text-[#3F4A2B] transition-colors">
            مكتبة الدروس
          </Link>
          {lesson.categoryName && (
            <>
              <span>/</span>
              <Link
                href={lesson.categoryId ? `/lessons?categoryId=${lesson.categoryId}` : "/lessons"}
                className="hover:text-[#3F4A2B] transition-colors"
              >
                {lesson.categoryName}
              </Link>
            </>
          )}
        </nav>

        {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* RIGHT / MAIN CONTENT: Audio Player & Lesson Details (8 Cols) */}
          <main className="lg:col-span-8 space-y-6">
            {/* 1. On-Page Full Audio Player (Syncs with persistent global AudioContext) */}
            <section aria-label="مشغل الدرس الصوتي">
              <HumanAudioPlayer
                track={lesson}
                playlist={[lesson, ...relatedLessons]}
                pageUrl={`/lessons/${lesson.id}`}
                durationInMinutes={lesson.durationInMinutes || 45}
              />
            </section>

            {/* 2. Metadata & Actions Box */}
            <div className="space-y-4">
              {/* Category & Council Badge */}
              <div className="flex items-center gap-2">
                {lesson.categoryName && (
                  <Link
                    href={lesson.categoryId ? `/lessons?categoryId=${lesson.categoryId}` : "/lessons"}
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3EF] text-[#C0673F] border border-[#F5E3D8] hover:bg-[#F2E2D2] transition-colors"
                  >
                    {lesson.categoryName}
                  </Link>
                )}
                <span className="text-xs text-[#8E987B] font-medium">
                  المجلس {lesson.id}
                </span>
              </div>

              {/* Title - Regular Site Font (Cairo / sans) */}
              <h1 className="text-base sm:text-lg lg:text-[20px] font-bold text-[#1E2616] tracking-tight leading-snug">
                {lesson.title}
              </h1>

              {/* Date & Listen count & Duration */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#78826B]">
                {formattedDate && <span>{formattedDate}</span>}
                <span>•</span>
                <span>{lesson.durationInMinutes || 45}:00 دقيقة</span>
              </div>

              {/* Action Buttons: Download, Share, Copy Link */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {audioUrl && (
                  <a
                    href={`/api/download?url=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(
                      `${lesson.title.trim().replace(/[\\/:*?"<>|]/g, "_") || "درس"}.mp3`
                    )}`}
                    download={`${lesson.title.trim().replace(/[\\/:*?"<>|]/g, "_") || "درس"}.mp3`}
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

            {/* 3. About Lesson Card (عن الدرس) */}
            <div className="bg-white rounded-[20px] border border-[#E4E7DA] p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-[#1E2616] border-r-3 border-[#C0673F] pr-3">
                عن الدرس
              </h2>

              <div className="text-sm text-[#4B533E] leading-[1.8] font-normal">
                {lesson.description ? (
                  <div>
                    <p className={!isDescExpanded ? "line-clamp-4" : ""}>
                      {lesson.description}
                    </p>
                    {lesson.description.length > 200 && (
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
                    نبذة قصيرة عن موضوع الدرس، وأهم المسائل التي يتناولها، تكتب من لوحة التحكم، وتظهر هنا في ثلاثة إلى خمسة أسطر مع زر «عرض المزيد» للنص الطويل.
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

            {/* 4. Bottom Previous / Next Council Navigation */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {prevLesson ? (
                <Link
                  href={`/lessons/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F8F4] border border-[#D5DAC8] text-xs font-bold text-[#3F4A2B] transition-colors shadow-2xs"
                >
                  <span>المجلس السابق</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/lessons/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F8F4] border border-[#D5DAC8] text-xs font-bold text-[#3F4A2B] transition-colors shadow-2xs"
                >
                  <span>المجلس التالي</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </main>

          {/* LEFT / SIDEBAR: Lessons from same category (4 Cols) */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#E4E7DA]">
              <h3 className="text-sm font-bold text-[#1E2616]">
                اسمع أيضاً
              </h3>
              <Link
                href="/lessons"
                className="text-xs font-bold text-[#C0673F] hover:text-[#9E4F28] transition-colors"
              >
                كل الدروس
              </Link>
            </div>

            {/* Related Lessons Stack matching image style exactly */}
            <div className="space-y-3.5">
              {relatedLessons.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#F6F4ED] text-xs text-[#8E987B] text-center border border-[#EBE7DA]">
                  لا توجد دروس أخرى في هذه الفئة حالياً.
                </div>
              ) : (
                relatedLessons.map((rel) => {
                  const isRelActive = isTrackActive(rel.id);
                  const isRelPlaying = isRelActive && isPlaying;
                  const relDuration = formatDuration(rel.durationInMinutes);
                  const relDate = formatDate(rel.publishDate || rel.createdAt);

                  return (
                    <Link
                      key={rel.id}
                      href={`/lessons/${rel.id}`}
                      className="group flex items-center justify-between gap-3 text-right hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {/* Right (Text content) */}
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

                      {/* Left: Warm cream rounded card with centered gold/terracotta mic & bottom-right black duration badge */}
                      <div className={`relative w-[110px] sm:w-[125px] h-[75px] sm:h-[82px] rounded-[18px] flex items-center justify-center shrink-0 border transition-colors ${isRelActive ? "bg-[#FAF1EC] border-[#E8C4B0]" : "bg-[#F6F4ED] border-[#EBE7DA]/80"
                        }`}>
                        {/* Mic Icon or playing indicator */}
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

                        {/* Duration pill attached at bottom-right inside card */}
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
