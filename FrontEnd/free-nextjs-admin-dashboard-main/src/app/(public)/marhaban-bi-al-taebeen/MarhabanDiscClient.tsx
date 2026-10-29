"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Category } from "@/api/public/categories";
import type { PublicLesson } from "@/api/public/content";
import { useAudio, buildAudioTrack } from "@/context/AudioContext";
import type { AudioTrack } from "@/context/AudioContext";

export interface ChildCategoryWithData extends Category {
  subCategories?: Category[];
  lessons?: PublicLesson[];
  lessonsCount?: number;
}

interface MarhabanDiscClientProps {
  mainCategory: Category;
  subCategories: ChildCategoryWithData[];
  lessons: PublicLesson[];
  totalCount: number;
}

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "تاريخ غير محدد";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "تاريخ غير محدد";
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "تاريخ غير محدد";
  }
};

const formatDuration = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return "42:10";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:00`;
  }
  return `${remainingMinutes}:00`;
};

export default function MarhabanDiscClient({
  mainCategory,
  subCategories = [],
  lessons = [],
  totalCount = 0,
}: MarhabanDiscClientProps) {
  const { playTrack, isTrackActive, isPlaying } = useAudio();

  // Use child categories from backend if available
  const hasBackendChildren = subCategories && subCategories.length > 0;

  // Accordion state
  const [openAccordionIds, setOpenAccordionIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (subCategories && subCategories.length > 0) {
      initial[String(subCategories[0].id)] = true;
    }
    return initial;
  });

  const [copied, setCopied] = useState<boolean>(false);

  const toggleAccordion = (id: number | string) => {
    setOpenAccordionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /** Build the full playlist of AudioTracks from all lessons */
  const buildPlaylist = (): AudioTrack[] => {
    return lessons
      .map((l) => buildAudioTrack({ ...l, categoryName: l.categoryName || mainCategory.name }))
      .filter((t): t is AudioTrack => t !== null);
  };

  const handlePlayTrack = (lesson: PublicLesson) => {
    const track = buildAudioTrack({
      ...lesson,
      categoryName: lesson.categoryName || mainCategory.name,
    });
    if (track) {
      playTrack(track, buildPlaylist());
    }
  };

  const handleStartListening = () => {
    if (lessons.length > 0) {
      handlePlayTrack(lessons[0]);
    }
    const el = document.getElementById("tracks-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent, title: string, audioPath?: string | null) => {
    e.stopPropagation();
    const url = getMediaUrl(audioPath);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.mp3`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`جاري تجهيز وتحميل الملف الصوتي لدرس: ${title}`);
    }
  };

  // Render list of accordion items from backend child categories only
  const displayAccordion = subCategories.map((child) => {
    const childLessons = child.lessons && child.lessons.length > 0
      ? child.lessons
      : lessons.filter((l) => l.title.includes(child.name) || (l as any).categoryId === child.id);

    return {
      id: child.id,
      name: child.name,
      lessonsCountText: `${childLessons.length || child.lessonsCount || 0} درس`,
      subCountText: child.subCategories && child.subCategories.length > 0 ? `${child.subCategories.length} تصنيفان` : "",
      subCategories: (child.subCategories || []).map((sc) => ({
        id: sc.id,
        name: sc.name,
        lessonsCount: "درس",
      })),
      tracks: childLessons.map((l) => ({
        id: l.id,
        title: l.title,
        duration: formatDuration(l.durationInMinutes),
        audioFilePath: l.audioFilePath,
        durationInMinutes: l.durationInMinutes,
        categoryName: child.name,
      })),
    };
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFCF7] text-[#2D2A26] pb-24 font-sans text-right text-[13px] sm:text-sm">
      {/* Equalizer keyframe animation */}
      <style>{`
        @keyframes eqBar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>

      {/* ================= BREADCRUMB ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <nav className="flex items-center text-xs text-[#7D766E] gap-2 font-medium">
          <Link href="/" className="hover:text-[#2D2A26] transition-colors">
            الرئيسية
          </Link>
          <span className="text-[#C5BEB5]">/</span>
          <span className="text-[#A4532B] font-bold">إسطوانة {mainCategory.name || "مرحبا بالتائبين"}</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= HERO CARD ================= */}
        <div className="bg-[#FAF3EA] border border-[#EADBCA] rounded-3xl p-5 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-6">
            {/* Main content right side in RTL */}
            <div className="flex-1 text-right space-y-3.5 w-full">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F5E2D5] text-[#A4532B] text-[11px] font-bold tracking-wide">
                  سلسلة صوتية
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E2118] font-ruqaa leading-tight tracking-tight">
                اسطوانة {mainCategory.name || "مرحبا بالتائبين"}
              </h1>

              <div className="border border-[#386694]/50 rounded-lg p-2.5 bg-white/40 max-w-xl">
                <p className="text-xs sm:text-[13px] text-[#4A453F] leading-relaxed font-medium">
                  سلسلة الوعظ والتزكية المؤثرة لفضيلة الشيخ أبي ذر القلموني، حفظه الله لبيان فضل التوبة، وبشارة
                  العائدين، وأدوية القلوب الغافلة.
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-start gap-y-1.5 gap-x-2.5 text-[11px] sm:text-xs text-[#736B63] font-semibold pt-0.5">
                {displayAccordion.length > 0 && (
                  <>
                    <span>{displayAccordion.length} تصنيفات</span>
                    <span className="text-[#C8BEB3]">•</span>
                  </>
                )}
                <span>{totalCount > 0 ? `${totalCount} درس` : `${lessons.length} درس`}</span>
                <span className="text-[#C8BEB3]">•</span>
                <span>المدة الكلية: ~18 ساعة</span>
                <span className="text-[#C8BEB3]">•</span>
                <span>جودة صوتية عالية</span>
                <span className="text-[#C8BEB3]">•</span>
                <span className="text-emerald-700 font-bold">متاحة للتحميل والنشر</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-start gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleStartListening}
                  className="px-5 py-2 rounded-xl bg-[#2D3823] hover:bg-[#222A1A] text-[#FAFAF5] text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-current rotate-180" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>ابدأ الاستماع</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("جاري تجهيز رابط تحميل الأسطوانة بالكامل...")}
                  className="px-4 py-2 rounded-xl bg-[#EDE4D8] hover:bg-[#E2D6C6] text-[#4A433A] text-xs font-bold flex items-center gap-1.5 transition-all border border-[#DDD1C0] active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>تحميل السلسلة كاملة</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-[#EFE6DB] text-[#5C5349] text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{copied ? "تم النسخ!" : "مشاركة"}</span>
                </button>
              </div>
            </div>

            {/* Banner Cover on the other side */}
            <div className="w-48 h-40 sm:w-52 sm:h-44 bg-[#2D3A2C] rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-md border-4 border-[#3D4C3B] shrink-0 relative overflow-hidden">
              <div className="w-8 h-0.5 bg-[#C0673F] mb-2.5 opacity-80" />
              <h2 className="text-xl sm:text-2xl font-black text-[#F4E9DC] font-ruqaa leading-tight tracking-wider">
                {mainCategory.name || "مرحبا بالتائبين"}
              </h2>
              <div className="w-10 h-0.5 bg-[#C0673F] mt-2.5 opacity-80" />
              <p className="text-[10px] text-[#A6B29F] mt-1.5 font-mono">فضيلة الشيخ أبو ذر القلموني</p>
            </div>
          </div>
        </div>

        {/* ================= TOP SECTION: دروس الاسطوانه ================= */}
        <section id="tracks-section" className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#1E2118]">دروس الاسطوانه</h2>
            <span className="text-xs text-[#8C8379] font-bold">
              {lessons.length} درس • الأحدث
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#ECE5DA] shadow-xs overflow-hidden divide-y divide-[#F4EFE6]">
            {lessons.map((lesson, idx) => {
              const isCurrent = isTrackActive(lesson.id);
              const isCurrentPlaying = isCurrent && isPlaying;
              const displayIdx = idx + 1;

              return (
                <div
                  key={lesson.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3.5 transition-all ${isCurrent ? "bg-[#FAF1EC]" : "hover:bg-[#FAF8F5]"
                    }`}
                >
                  {/* Right side in RTL: Title & Number Badge */}
                  <div className="flex items-center gap-3.5 text-right">
                    {/* Number Badge or Playing Indicator */}
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isCurrent
                          ? "bg-[#C0673F] text-white"
                          : "bg-[#EFEAE2] text-[#696156]"
                        }`}
                    >
                      {isCurrentPlaying ? (
                        <span className="flex gap-[2px] items-end h-3">
                          <span className="w-[2px] h-full bg-white rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate" }} />
                          <span className="w-[2px] h-2/3 bg-white rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate 0.15s" }} />
                          <span className="w-[2px] h-full bg-white rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate 0.3s" }} />
                        </span>
                      ) : (
                        displayIdx
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className={`text-xs sm:text-[13px] font-extrabold cursor-pointer transition-colors block ${isCurrent ? "text-[#A4532B]" : "text-[#1E2118] hover:text-[#A4532B]"
                          }`}
                      >
                        {lesson.title}
                      </Link>
                      <p className="text-[11px] text-[#8C8379] mt-0.5">
                        {formatDate(lesson.publishDate || lesson.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Left side in RTL: Duration + Download + Play button */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    {/* Duration */}
                    <span className="text-[11px] sm:text-xs font-mono font-medium text-[#7A7167]">
                      {formatDuration(lesson.durationInMinutes)}
                    </span>

                    {/* Download Icon */}
                    <button
                      type="button"
                      title="تحميل الدرس"
                      onClick={(e) => handleDownload(e, lesson.title, lesson.audioFilePath)}
                      className="p-1.5 text-[#8C8276] hover:text-[#1E2118] transition-colors rounded-lg hover:bg-black/5"
                    >
                      <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>

                    {/* Play/Pause Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayTrack(lesson)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 ${isCurrent
                          ? "bg-[#C0673F] text-white hover:bg-[#A8532D]"
                          : "bg-[#2D3823] text-white hover:bg-[#222A1A]"
                        }`}
                    >
                      {isCurrentPlaying ? (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 fill-current rotate-180" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= BOTTOM ACCORDION: الكاتيجوريز التابعة ================= */}
        <section className="space-y-4 pt-2">
          {displayAccordion.map((section) => {
            const isOpen = !!openAccordionIds[section.id];

            return (
              <div
                key={section.id}
                className="bg-white rounded-3xl border border-[#ECE5DA] shadow-xs overflow-hidden transition-all"
              >
                {/* Accordion Header Row */}
                <div
                  onClick={() => toggleAccordion(section.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors select-none"
                >
                  {/* Right side: Folder icon + Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded-lg bg-[#FAF5EE] border border-[#E8DFC9] flex items-center justify-center text-[#9E8462] shrink-0">
                      <svg className="w-5 h-5 stroke-current stroke-1.5 fill-none" viewBox="0 0 24 24">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#1E2118]">
                      {section.name}
                    </h3>
                  </div>

                  {/* Left side: [N] درس - 2 تصنيفان + Arrow */}
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#8C8379]">
                    <span>
                      {section.lessonsCountText}
                      {section.subCountText ? ` - ${section.subCountText}` : ""}
                    </span>

                    <button
                      type="button"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#8C8379] hover:bg-black/5 transition-transform"
                    >
                      <svg
                        className={`w-4 h-4 stroke-current stroke-2 fill-none transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Accordion Content when Open */}
                {isOpen && (
                  <div className="border-t border-[#F1E9DF] bg-white divide-y divide-[#F4EFE6]">
                    {/* Tracks inside this category */}
                    {section.tracks && section.tracks.length > 0 && (
                      <div className="divide-y divide-[#F4EFE6]">
                        {section.tracks.map((track, trackIdx) => {
                          const isCurrent = isTrackActive(track.id);
                          const isCurrentPlaying = isCurrent && isPlaying;

                          return (
                            <div
                              key={track.id}
                              className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all pr-6 sm:pr-8 ${isCurrent ? "bg-[#FAF1EC]" : "hover:bg-[#FAF8F5]"
                                }`}
                            >
                              {/* Right side: number + title */}
                              <div className="flex items-center gap-4 text-right">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent
                                    ? "bg-[#C0673F] text-white"
                                    : "bg-[#EFEAE2] text-[#696156]"
                                    }`}
                                >
                                  {isCurrentPlaying ? (
                                    <span className="flex gap-[2px] items-end h-3">
                                      <span className="w-[2px] h-full bg-white rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate" }} />
                                      <span className="w-[2px] h-2/3 bg-white rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate 0.15s" }} />
                                      <span className="w-[2px] h-full bg-white rounded-full" style={{ animation: "eqBar 0.45s ease-in-out infinite alternate 0.3s" }} />
                                    </span>
                                  ) : (
                                    trackIdx + 1
                                  )}
                                </div>
                                <h4
                                  onClick={() => {
                                    const t = buildAudioTrack({
                                      id: track.id,
                                      title: track.title,
                                      audioFilePath: track.audioFilePath,
                                      categoryName: track.categoryName || section.name,
                                      durationInMinutes: track.durationInMinutes,
                                    });
                                    if (t) playTrack(t, buildPlaylist());
                                  }}
                                  className={`text-xs sm:text-[13px] font-extrabold cursor-pointer transition-colors ${isCurrent ? "text-[#A4532B]" : "text-[#1E2118] hover:text-[#A4532B]"
                                    }`}
                                >
                                  {track.title}
                                </h4>
                              </div>

                              {/* Left side: duration + download + play */}
                              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                <span className="text-[11px] sm:text-xs font-mono font-medium text-[#7A7167]">
                                  {track.duration}
                                </span>

                                <button
                                  type="button"
                                  title="تحميل"
                                  onClick={(e) => handleDownload(e, track.title, track.audioFilePath)}
                                  className="p-1.5 text-[#8C8276] hover:text-[#1E2118] transition-colors rounded-lg hover:bg-black/5"
                                >
                                  <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const t = buildAudioTrack({
                                      id: track.id,
                                      title: track.title,
                                      audioFilePath: track.audioFilePath,
                                      categoryName: track.categoryName || section.name,
                                      durationInMinutes: track.durationInMinutes,
                                    });
                                    if (t) playTrack(t, buildPlaylist());
                                  }}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 ${isCurrent
                                    ? "bg-[#C0673F] text-white hover:bg-[#A8532D]"
                                    : "bg-[#2D3823] text-white hover:bg-[#222A1A]"
                                    }`}
                                >
                                  {isCurrentPlaying ? (
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 fill-current rotate-180" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Subcategories (e.g. شروط التوبة النصوح / ما يبطل التوبة) */}
                    {section.subCategories && section.subCategories.length > 0 && (
                      <div className="p-3 sm:p-4 space-y-2 bg-[#F9F7F2]">
                        {section.subCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-white rounded-2xl border border-[#EBE3D7] p-3.5 sm:p-4 flex items-center justify-between hover:border-[#D5C9B8] transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-7 rounded-lg bg-[#FAF5EE] border border-[#E8DFC9] flex items-center justify-center text-[#9E8462] shrink-0">
                                <svg className="w-4 h-4 stroke-current stroke-1.5 fill-none" viewBox="0 0 24 24">
                                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                              </div>
                              <h5 className="text-sm font-bold text-[#1E2118]">{sub.name}</h5>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C8379]">
                              <span>{sub.lessonsCount}</span>
                              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* ================= PUBLISHING CALLOUT / LICENSE ================= */}
        <div className="bg-white border border-[#E5DACB] rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1 text-right">
            <p className="text-sm sm:text-base font-black text-[#5C321E] font-ruqaa">
              « هذه المواد من أراد أن ينشرها فلينشرها دون إذن وليتق الله فيها »
            </p>
            <p className="text-xs text-[#8C7565]">
              يمكنك نسخ هذه الاسطوانة وتوزيعها على التائبين والشباب بنية احتساب الأجر.
            </p>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl text-[#8C7565] hover:text-[#5C321E] hover:bg-[#FAF3EA] transition-all shrink-0"
            title="مشاركة"
          >
            <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
