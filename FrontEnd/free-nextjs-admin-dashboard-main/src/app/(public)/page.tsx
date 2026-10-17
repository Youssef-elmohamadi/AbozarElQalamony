import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublicHomeData } from "@/api/public/home";
import { getPublicCategories, type Category } from "@/api/public/categories";
import AlertsTicker from "@/components/public/alerts/AlertsTicker";

export const metadata: Metadata = {
  title: "الرئيسية | الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني",
  description:
    "مرحباً بكم في المنصة الرسمية لفضيلة الشيخ أبي ذر القلموني. استمع إلى أحدث الخطب والدروس العلمية وحمّل كتب ومؤلفات الشيخ واسطوانة مرحبا بالتائبين.",
  alternates: {
    canonical: "/",
  },
};

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const stripHtml = (html?: string | null) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
};

// Arabic Pluralization Helper (قواعد تمييز العدد في اللغة العربية)
function formatArabicCount(
  count: number,
  forms: {
    zero: string;
    one: string;
    two: string;
    few: string; // 3 to 10: جمع
    many: string; // 11+: مفرد منصوب
  }
): string {
  if (count === 0) return forms.zero;
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

const formatLessons = (n: number) =>
  formatArabicCount(n, {
    zero: "لا توجد دروس",
    one: "درس واحد",
    two: "درسان",
    few: "دروس",
    many: "درساً",
  });

function formatDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "غير محدد";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} دقيقة`;
  }

  const hoursStr =
    hours === 1
      ? "ساعة"
      : hours === 2
        ? "ساعتان"
        : hours >= 3 && hours <= 10
          ? `${hours} ساعات`
          : `${hours} ساعة`;

  if (minutes === 0) {
    return hoursStr;
  }

  return `${hoursStr} و${minutes} دقيقة`;
}

const formatBooks = (n: number) =>
  formatArabicCount(n, {
    zero: "لا توجد كتب",
    one: "كتاب واحد",
    two: "كتابان",
    few: "كتب",
    many: "كتاباً",
  });

const formatSermons = (n: number) =>
  formatArabicCount(n, {
    zero: "لا توجد خطب",
    one: "خطبة واحدة",
    two: "خطبتان",
    few: "خطب",
    many: "خطبةً",
  });

const formatItems = (n: number) =>
  formatArabicCount(n, {
    zero: "لا توجد مواد",
    one: "مادة واحدة",
    two: "مادتان",
    few: "مواد",
    many: "مادةً",
  });

const formatArabicDate = (dateString?: string | null) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("ar-EG-u-nu-latn", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

const renderCategoryIcon = (type: number) => {
  switch (type) {
    case 1: // كتب ومؤلفات
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    case 2: // دروس وسلاسل علمية
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
          />
        </svg>
      );
    case 3: // خطب جمعة
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      );
  }
};

export default async function HomePage() {
  // Fetch unified home data and all categories for subcategory tags
  const [homeData, allCategories] = await Promise.all([
    getPublicHomeData(),
    getPublicCategories(),
  ]);

  const {
    topCategories = [],
    latestLessons = [],
    latestSermons = [],
    latestBooks = [],
    latestArticles = [],
    activeAlerts = [],
  } = homeData;

  return (
    <div className="pt-6 sm:pt-10 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* ================= HERO & ALERTS SECTION (FIRST SCREEN ONLY) ================= */}
        <div className="space-y-6 sm:space-y-8">
          <section className="py-2 sm:py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Right Side: Text & Actions */}
              <div className="lg:col-span-7 space-y-4 text-right">
                {/* Official Badge Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D5DAC8]/90 bg-[#F5F7F0]/80 text-xs sm:text-[13px] text-[#4B533E] font-medium shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0673F]" />
                  <span>الموقع العلمي والدعوي الرسمي المعتمد</span>
                </div>

                {/* Scholar Name in Authentic Ruqaa Calligraphy */}
                <h1 className="space-y-1">
                  <span className="block text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#2A341E] font-ruqaa leading-tight">
                    موقع فضيلة الشيخ
                  </span>
                  <span
                    className="block text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#C0673F] font-ruqaa leading-tight"
                    aria-label="أبي ذر القلموني"
                  >
                    <span className="inline-block ml-[6px] sm:ml-[7px]">أ</span>بي ذر القلموني
                  </span>
                </h1>

                {/* Natural Human-Scaled Description */}
                <p className="text-sm sm:text-[15px] text-[#4B533E] max-w-xl leading-relaxed">
                  مرحباً بكم في البوابة الرسمية لتراث دروس ومؤلفات فضيلة الشيخ أبي ذر
                  القلموني، حفظه الله، في التزكية والرقائق، والفقه والحديث، وخطب
                  الجمعة، ودعوة القلوب للفرار إلى الله.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/lessons"
                    className="px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#273318] hover:bg-[#343E23] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    ابدأ من مكتبة الدروس
                  </Link>

                  <Link
                    href="/marhaban-bi-al-taebeen"
                    className="px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-[#EEF0E6] border border-[#B8C0A6] text-[#273318] text-xs sm:text-sm font-bold shadow-2xs transition-colors"
                  >
                    اسطوانة مرحبا بالتائبين
                  </Link>
                </div>
              </div>

              {/* Left Side: Dark Olive Asymmetric Card */}
              <div className="lg:col-span-5 flex justify-center lg:justify-start">
                <div className="w-full max-w-[340px] sm:max-w-[370px] bg-[#29351C] text-white p-7 sm:p-9 rounded-[28px] rounded-br-[75px] shadow-xl flex flex-col items-center text-center">
                  {/* White Emblem Badge */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#FAFAF5] p-3 shadow-md flex items-center justify-center mb-5">
                    <Image
                      src="/logo-qalamuni-1.svg"
                      alt="شعار الشيخ أبو ذر القلموني"
                      width={56}
                      height={56}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title */}
                  <h2
                    className="text-xl sm:text-2xl font-bold text-[#FAFAF5] font-ruqaa mb-3 tracking-wide"
                    aria-label="مشروع ففروا إلى الله"
                  >
                    ــفـفروا إلى الله
                  </h2>

                  {/* Quranic Ayah */}
                  <p className="text-xs sm:text-sm text-[#DFE5D7] font-amiri leading-relaxed mb-4 px-2">
                    «قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنْفُسِهِمْ لَا
                    تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ»
                  </p>

                  {/* Accent Divider */}
                  <div className="w-24 h-px bg-[#C0673F]/70 mb-4" />

                  {/* Category Note */}
                  <span className="text-[11px] sm:text-xs font-semibold text-[#DEA587]">
                    دروس وخطب ومؤلفات مسموعة ومقروءة
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= ACTIVE ALERTS TICKER ================= */}
          {activeAlerts && activeAlerts.length > 0 && (
            <AlertsTicker alerts={activeAlerts} />
          )}
        </div>

        {/* ================= TOP CATEGORIES SECTION ================= */}
        {topCategories && topCategories.length > 0 && (
          <section className="max-w-[1200px] mx-auto space-y-4 pt-4 sm:pt-8">
            <div className="flex items-center gap-2.5 border-b border-[#E9E2D3] pb-3">
              <span className="w-1.5 h-6 rounded-full bg-[#C0673F]" />
              <h2 className="text-[24px] font-bold text-[#2A341E] leading-[1.35]">
                أبرز الأقسام
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCategories.map((cat) => {
                const children = (allCategories || []).filter(
                  (c) => c.parentId === cat.id
                );

                return (
                  <div
                    key={cat.id}
                    className="relative group bg-white rounded-[14px] border border-[#E9E2D3] p-5 shadow-none hover:border-[#D49E7C] transition-colors duration-150 min-h-[195px] flex flex-col text-right"
                  >
                    <div className="space-y-2 pb-2">
                      {/* Category Type Badge (12.5px / weight 500 / radius 8px) */}
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-[12.5px] font-medium bg-[#FAF4EC] text-[#B05B33] border border-[#F2E2D2]">
                          {renderCategoryIcon(cat.type)}
                          <span>{cat.typeName || "قسم علمي"}</span>
                        </span>
                      </div>

                      {/* Card Title (18px / weight 600 / line-height 1.35) - No color change on hover */}
                      <h3 className="text-[18px] font-semibold text-[#1E2616] leading-[1.35] pt-0.5">
                        <Link
                          href={`/categories/${cat.id}`}
                          className="focus:outline-hidden after:absolute after:inset-0 after:rounded-[14px]"
                        >
                          {cat.name}
                        </Link>
                      </h3>

                      {/* Child Categories Chips (Solid light #F3EFE6 bg without borders / 13px / weight 400 / radius 8px) */}
                      {children.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 relative z-10">
                          {children.slice(0, 3).map((child) => (
                            <Link
                              key={child.id}
                              href={`/categories/${child.id}`}
                              className="inline-block text-[13px] font-normal text-[#3F4834] bg-[#F3EFE6] hover:bg-[#EAE4D7] hover:text-[#222A17] px-2.5 py-0.5 rounded-[8px] leading-[1.5] transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                          {children.length > 3 && (
                            <span className="inline-block text-[12px] text-[#636C56] font-normal leading-[1.5]">
                              +{children.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Pinned to bottom via mt-auto with high contrast count */}
                    <div className="mt-auto pt-3 border-t border-[#F0F2EB] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-[#3F4735] text-[14px] font-medium leading-[1.5]">
                        {cat.lessonsCount > 0 && (
                          <span>{formatLessons(cat.lessonsCount)}</span>
                        )}
                        {cat.booksCount > 0 && (
                          <span>{formatBooks(cat.booksCount)}</span>
                        )}
                        {cat.sermonsCount > 0 && (
                          <span>{formatSermons(cat.sermonsCount)}</span>
                        )}
                        {cat.lessonsCount === 0 &&
                          cat.booksCount === 0 &&
                          cat.sermonsCount === 0 && (
                            <span>{formatItems(cat.totalContentCount)}</span>
                          )}
                      </div>

                      <span className="font-semibold text-[14px] text-[#C0673F] flex items-center gap-1 leading-[1.5]">
                        <span>تصفح القسم</span>
                        <span
                          aria-hidden="true"
                          className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200"
                        >
                          &larr;
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= LATEST LESSONS SECTION ================= */}
        {latestLessons && latestLessons.length > 0 && (
          <section className="max-w-[1200px] mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E2D3] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#3F4A2B]" />
                <h2 className="text-[24px] font-bold text-[#2A341E] leading-[1.35]">
                  أحدث الدروس
                </h2>
              </div>
              <Link
                href="/content?type=lessons"
                className="text-[14px] font-semibold text-[#C0673F] hover:text-[#9E4F28] transition-colors flex items-center gap-1 leading-[1.5]"
              >
                <span>عرض جميع الدروس</span>
                <span aria-hidden="true" className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="relative group bg-white rounded-[14px] border border-[#E9E2D3] p-5 shadow-none hover:border-[#D49E7C] transition-colors duration-150 min-h-[195px] flex flex-col text-right"
                >
                  <div className="space-y-2 pb-2">
                    {lesson.categoryName && (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-[12.5px] font-medium bg-[#FAF4EC] text-[#B05B33] border border-[#F2E2D2]">
                          {renderCategoryIcon(2)}
                          {lesson.categoryName}
                        </span>
                      </div>
                    )}

                    <h3 className="text-[18px] font-semibold text-[#1E2616] leading-[1.35] line-clamp-2 pt-0.5">
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="hover:text-[#C0673F] transition-colors focus:outline-hidden"
                      >
                        {lesson.title}
                      </Link>
                    </h3>

                    {lesson.description && (
                      <p className="text-[13px] text-[#636C56] font-normal line-clamp-2 leading-[1.5] pt-0.5">
                        {stripHtml(lesson.description)}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#F0F2EB] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#3F4735] text-[14px] font-medium leading-[1.5]">
                      <svg
                        className="w-3.5 h-3.5 text-[#636C56]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                        <path strokeLinecap="round" strokeWidth="1.8" d="M12 6v6l4 2" />
                      </svg>
                      <span>
                        {formatDuration(lesson.durationMinutes || lesson.durationInMinutes || 45)}
                      </span>
                    </span>

                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="font-semibold text-[14px] text-[#C0673F] hover:text-[#9E4F28] flex items-center gap-1 leading-[1.5] transition-colors"
                    >
                      <span>استماع</span>
                      <svg
                        className="w-3 h-3 fill-current transform group-hover:-translate-x-0.5 transition-transform"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= LATEST SERMONS SECTION ================= */}
        {latestSermons && latestSermons.length > 0 && (
          <section className="max-w-[1200px] mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E2D3] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#C0673F]" />
                <h2 className="text-[24px] font-bold text-[#2A341E] leading-[1.35]">
                  خطب الجمعة
                </h2>
              </div>
              <Link
                href="/content?type=sermons"
                className="text-[14px] font-semibold text-[#C0673F] hover:text-[#9E4F28] transition-colors flex items-center gap-1 leading-[1.5]"
              >
                <span>عرض جميع الخطب</span>
                <span aria-hidden="true" className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestSermons.map((sermon) => {
                const sermonDate =
                  sermon.khutbahDate ||
                  sermon.deliveryDate ||
                  sermon.publishDate ||
                  sermon.createdAt;
                const formattedDate = formatArabicDate(sermonDate);

                return (
                  <div
                    key={sermon.id}
                    className="relative group bg-white rounded-[14px] border border-[#E9E2D3] p-5 shadow-none hover:border-[#D49E7C] transition-colors duration-150 min-h-[195px] flex flex-col text-right"
                  >
                    <div className="space-y-2 pb-2">
                      {sermon.categoryName && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-[12.5px] font-medium bg-[#FAF4EC] text-[#B05B33] border border-[#F2E2D2]">
                            {renderCategoryIcon(3)}
                            {sermon.categoryName}
                          </span>
                        </div>
                      )}

                      <h3 className="text-[18px] font-semibold text-[#1E2616] leading-[1.35] line-clamp-2 pt-0.5">
                        <Link
                          href={`/content?type=sermons&id=${sermon.id}`}
                          className="focus:outline-hidden after:absolute after:inset-0 after:rounded-[14px]"
                        >
                          {sermon.title}
                        </Link>
                      </h3>

                      {sermon.description && (
                        <p className="text-[13px] text-[#636C56] font-normal line-clamp-2 leading-[1.5] pt-0.5">
                          {stripHtml(sermon.description)}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-[#F0F2EB] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#3F4735] text-[14px] font-medium leading-[1.5]">
                        <svg
                          className="w-3.5 h-3.5 text-[#636C56]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formattedDate || "خطبة منبرية"}</span>
                      </span>

                      {sermon.audioFilePath ? (
                        <a
                          href={getMediaUrl(sermon.audioFilePath)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 font-semibold text-[14px] text-[#C0673F] hover:text-[#9E4F28] flex items-center gap-1 leading-[1.5] transition-colors"
                        >
                          <span>استماع للخطبة</span>
                          <svg
                            className="w-3 h-3 fill-current transform group-hover:-translate-x-0.5 transition-transform"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </a>
                      ) : (
                        <span className="font-semibold text-[14px] text-[#C0673F] flex items-center gap-1 leading-[1.5]">
                          <span>تفاصيل الخطبة</span>
                          <span
                            aria-hidden="true"
                            className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200"
                          >
                            &larr;
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= LATEST BOOKS SECTION ================= */}
        {latestBooks && latestBooks.length > 0 && (
          <section className="max-w-[1200px] mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E2D3] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#3F4A2B]" />
                <h2 className="text-[24px] font-bold text-[#2A341E] leading-[1.35]">
                  مؤلفات وكتب
                </h2>
              </div>
              <Link
                href="/books"
                className="text-[14px] font-semibold text-[#C0673F] hover:text-[#9E4F28] transition-colors flex items-center gap-1 leading-[1.5]"
              >
                <span>جميع الكتب والمؤلفات</span>
                <span aria-hidden="true" className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestBooks.map((book) => {
                const coverUrl = getMediaUrl(book.coverImagePath);
                const pdfUrl = getMediaUrl(book.pdfFilePath);

                return (
                  <div
                    key={book.id}
                    className="relative group bg-white rounded-[14px] border border-[#E9E2D3] p-4 shadow-none hover:border-[#D49E7C] transition-colors duration-150 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <Link
                        href={`/books/${book.id}`}
                        className="block w-full h-44 rounded-[10px] bg-[#EAE8E1] border border-[#E9E2D3] flex items-center justify-center text-brand-600 overflow-hidden relative group/cover"
                      >
                        {coverUrl ? (
                          <>
                            {/* Blurred ambient backdrop */}
                            <div
                              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-35 scale-110 pointer-events-none"
                              style={{ backgroundImage: `url(${coverUrl})` }}
                            />
                            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                            {/* Complete uncropped cover */}
                            <div className="relative w-full h-full p-2 flex items-center justify-center">
                              <Image
                                src={coverUrl}
                                alt={book.title}
                                fill
                                unoptimized
                                className="object-contain drop-shadow-md group-hover/cover:scale-[1.03] transition-transform duration-300"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-3 text-[#3F4A2B]">
                            <svg className="w-10 h-10 mb-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <span className="text-[11px] font-bold line-clamp-1">{book.title}</span>
                          </div>
                        )}
                      </Link>

                      {book.categoryName && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-[12px] font-medium bg-[#FAF4EC] text-[#B05B33] border border-[#F2E2D2]">
                            {renderCategoryIcon(1)}
                            {book.categoryName}
                          </span>
                        </div>
                      )}

                      <h3 className="text-[16px] font-semibold text-[#1E2616] hover:text-[#C0673F] transition-colors line-clamp-2 leading-[1.35]">
                        <Link
                          href={`/books/${book.id}`}
                          className="hover:underline"
                        >
                          {book.title}
                        </Link>
                      </h3>

                      <p className="text-[12px] text-[#7A836D]">
                        {book.authorName || book.author || "فضيلة الشيخ أبو ذر القلموني"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0F2EB] flex items-center justify-between text-xs">
                      <Link
                        href={`/books/${book.id}`}
                        className="text-[12px] font-bold text-[#3F4A2B] hover:text-[#2A331D] flex items-center gap-1 transition-colors"
                      >
                        <span>تفاصيل وقراءة</span>
                        <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-[8px] bg-[#3F4A2B] hover:bg-[#2C341D] text-white text-[12px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>تحميل PDF</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">نسخة ورقية</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= LATEST ARTICLES SECTION ================= */}
        {latestArticles && latestArticles.length > 0 && (
          <section className="max-w-[1200px] mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E2D3] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-[#3F4A2B]" />
                <h2 className="text-[24px] font-bold text-[#2A341E] leading-[1.35]">
                  المقالات
                </h2>
              </div>
              <Link
                href="/content?type=articles"
                className="text-[14px] font-semibold text-[#C0673F] hover:text-[#9E4F28] transition-colors flex items-center gap-1 leading-[1.5]"
              >
                <span>جميع المقالات</span>
                <span aria-hidden="true" className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestArticles.map((art) => {
                const formattedDate = formatArabicDate(art.publishDate || art.createdAt);

                return (
                  <div
                    key={art.id}
                    className="relative group bg-white rounded-[14px] border border-[#E9E2D3] p-5 shadow-none hover:border-[#D49E7C] transition-colors duration-150 min-h-[195px] flex flex-col justify-between text-right"
                  >
                    <div className="space-y-2 pb-2">
                      {art.categoryName && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-[12.5px] font-medium bg-[#FAF4EC] text-[#B05B33] border border-[#F2E2D2]">
                            {renderCategoryIcon(4)}
                            {art.categoryName}
                          </span>
                        </div>
                      )}
                      <h3 className="text-[18px] font-semibold text-[#1E2616] leading-[1.35] line-clamp-2 pt-0.5">
                        <Link
                          href={`/content?type=articles&id=${art.id}`}
                          className="focus:outline-hidden after:absolute after:inset-0 after:rounded-[14px]"
                        >
                          {art.title}
                        </Link>
                      </h3>
                      {(art.summary || art.description) && (
                        <p className="text-[13px] text-[#636C56] font-normal line-clamp-2 leading-[1.5] pt-0.5">
                          {stripHtml(art.summary || art.description)}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-[#F0F2EB] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#3F4735] text-[14px] font-medium leading-[1.5]">
                        <svg
                          className="w-3.5 h-3.5 text-[#636C56]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formattedDate || "مقال تربوي"}</span>
                      </span>

                      <span className="font-semibold text-[14px] text-[#C0673F] flex items-center gap-1 leading-[1.5]">
                        <span>قراءة المقال</span>
                        <span
                          aria-hidden="true"
                          className="inline-block transform group-hover:-translate-x-1 transition-transform duration-200"
                        >
                          &larr;
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
