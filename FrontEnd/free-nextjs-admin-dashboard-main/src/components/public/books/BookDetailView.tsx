"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicBook } from "@/api/public/content";
import InteractivePdfReader from "./InteractivePdfReader";
import { formatArabicDate } from "@/lib/arabicPlural";

interface BookDetailViewProps {
  book: PublicBook;
  relatedBooks: PublicBook[];
}

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/") || path.startsWith("uploads/")) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function BookDetailView({
  book,
  relatedBooks = [],
}: BookDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Remember last read progress in browser
  const [lastReadPage, setLastReadPage] = useState<number>(1);

  const coverUrl = getMediaUrl(book.coverImagePath);
  const pdfUrl = getMediaUrl(book.pdfFilePath);
  const formattedDate = formatArabicDate(book.publishDate || book.createdAt) || "14 أكتوبر 2026";

  // Load last read progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`book_progress_${book.id}`);
      if (saved) {
        const p = parseInt(saved, 10);
        if (!isNaN(p) && p > 0) {
          setLastReadPage(p);
        }
      }
    } catch {
      // ignore
    }
  }, [book.id]);

  const saveProgress = (page: number) => {
    setLastReadPage(page);
    try {
      localStorage.setItem(`book_progress_${book.id}`, String(page));
    } catch {
      // ignore
    }
  };

  const scrollToReader = () => {
    const el = document.getElementById("book-reader-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
          title: book.title,
          text: book.description || book.title,
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="py-6 sm:py-10 bg-[#FAF8F3] min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= BREADCRUMB ================= */}
        <nav
          className="flex items-center gap-1.5 text-xs text-[#7A8569] font-medium"
          aria-label="مسار التنقل"
        >
          <Link href="/" className="hover:text-[#3F4A2B] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/books" className="hover:text-[#3F4A2B] transition-colors">
            مكتبة الكتب
          </Link>
          {book.categoryName && (
            <>
              <span>/</span>
              <span className="text-[#3F4A2B] font-bold">{book.categoryName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-[#1E2616] font-bold truncate max-w-[200px] sm:max-w-xs">
            {book.title}
          </span>
        </nav>

        {/* ================= 2-COLUMN MAIN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================= MAIN CONTENT (Right in RTL - 8 Cols) ================= */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Top Hero Details Card */}
            <div className="bg-white rounded-2xl border border-[#E8E3D5] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start justify-between gap-6 lg:gap-8">
              {/* Text Info (Right in RTL) */}
              <div className="flex-1 space-y-4 text-right">
                {/* Category Pill */}
                {book.categoryName && (
                  <span className="inline-block px-3 py-1 rounded-md bg-[#FDF3EB] text-[#C0673F] text-xs font-bold border border-[#F3E2D5]">
                    {book.categoryName}
                  </span>
                )}

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#1E2616] tracking-tight leading-snug">
                  {book.title}
                </h1>

                {/* Author Name */}
                <div className="text-xs sm:text-sm text-[#556341] font-medium">
                  المؤلف:{" "}
                  <strong className="text-[#2A331D] font-bold">
                    {book.authorName || book.author || "فضيلة الشيخ أبو ذر القلموني"}
                  </strong>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#7A8569] font-medium">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>نسخة إلكترونية PDF</span>
                  {book.pagesCount && (
                    <>
                      <span>•</span>
                      <span>{book.pagesCount} صفحة</span>
                    </>
                  )}
                </div>

                {/* Description with Expand/Collapse */}
                {book.description && (
                  <div className="space-y-1 text-xs sm:text-sm text-[#556341] leading-relaxed">
                    <p className={!isDescExpanded ? "line-clamp-3" : ""}>
                      {book.description}
                    </p>
                    {book.description.length > 140 && (
                      <button
                        type="button"
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-xs font-bold text-[#C0673F] hover:underline cursor-pointer"
                      >
                        {isDescExpanded ? "عرض أقل" : "عرض المزيد..."}
                      </button>
                    )}
                  </div>
                )}

                {/* Actions Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {/* Start Reading Button (Scrolls to embedded reader) */}
                  {pdfUrl && (
                    <button
                      type="button"
                      onClick={scrollToReader}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D3924] hover:bg-[#202917] text-[#FAFAF5] text-xs sm:text-sm font-bold shadow-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span>ابدأ القراءة</span>
                    </button>
                  )}

                  {/* Download PDF Button */}
                  {pdfUrl ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4EFE6] hover:bg-[#ECE6DA] text-[#2B3620] border border-[#DFD8C7] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <svg className="w-4 h-4 text-[#556341]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>تحميل PDF</span>
                    </a>
                  ) : (
                    <span className="inline-block px-3.5 py-2.5 rounded-xl bg-[#F4EFE6] text-[#8C987E] text-xs font-bold border border-[#DFD8C7]">
                      سيتاح التحميل قريباً
                    </span>
                  )}

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4EFE6] hover:bg-[#ECE6DA] text-[#2B3620] border border-[#DFD8C7] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4 text-[#556341]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>{copied ? "تم النسخ!" : "مشاركة"}</span>
                  </button>
                </div>

                {/* Last Read Bookmark Indicator */}
                {pdfUrl && lastReadPage > 1 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={scrollToReader}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ECE8DC] hover:bg-[#E2DDD0] text-[#3F4A2B] text-[11px] sm:text-xs font-medium transition-colors cursor-pointer border border-[#DDD7C6]"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#C0673F] animate-pulse" />
                      <span>
                        آخر قراءة لك: <strong>صفحة {lastReadPage}</strong> • اضغط للمتابعة
                      </span>
                      <svg className="w-3.5 h-3.5 rotate-180 text-[#C0673F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Realistic 3D Book Cover (Left in RTL) */}
              <div className="relative shrink-0 w-44 sm:w-52 aspect-[3/4.2] flex items-center justify-center select-none group">
                <div className="relative w-full h-full rounded-r-md rounded-l-xl bg-gradient-to-l from-[#1C2415] via-[#2A3520] to-[#344128] border-r border-[#4A5A38]/30 shadow-2xl flex flex-col justify-between p-4 sm:p-5 text-center text-[#FAFAF5] overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_35px_rgba(30,38,22,0.3)]">
                  {/* Spine Highlight Effect */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />
                  <div className="absolute right-2.5 top-0 bottom-0 w-px bg-black/30 pointer-events-none" />

                  {/* Top Accent Line */}
                  <div className="w-10 h-1 bg-[#C0673F] rounded-full mx-auto" />

                  {/* Title / Cover Rendering */}
                  {coverUrl && !imageError ? (
                    <div className="relative w-full h-full my-1 rounded-sm overflow-hidden">
                      <Image
                        src={coverUrl}
                        alt={book.title}
                        fill
                        unoptimized
                        sizes="208px"
                        className="object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="my-auto space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold font-ruqaa text-[#FAF7F0] leading-snug drop-shadow-sm">
                        {book.title}
                      </h3>
                    </div>
                  )}

                  {/* Author Name at Bottom */}
                  <div className="text-[11px] font-medium text-[#D1DAC4] tracking-tight">
                    {book.authorName ? book.authorName.replace("فضيلة الشيخ ", "") : "أبو ذر القلموني"}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Embedded Real Interactive PDF Reader Section */}
            <div id="book-reader-section" className="space-y-4 pt-2 scroll-mt-24">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-bold text-[#1E2616] flex items-center gap-2">
                  <span className="w-1.5 h-4.5 rounded-full bg-[#3F4A2B]" />
                  <span>تصفح وقراءة الكتاب كاملاً</span>
                </h2>
                <span className="text-xs text-[#7A8569] font-medium">
                  تقليب أفقي للصفحات • تصفح الفهرس والصفحات
                </span>
              </div>

              {pdfUrl ? (
                <InteractivePdfReader
                  pdfUrl={pdfUrl}
                  bookTitle={book.title}
                  authorName={book.authorName}
                  initialPage={lastReadPage || 1}
                  fallbackOutline={book.tableOfContents}
                  onPageChange={(page) => saveProgress(page)}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-[#DFE5D7] p-8 sm:p-12 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F1] flex items-center justify-center text-[#3F4A2B] text-xl">
                    📖
                  </div>
                  <h3 className="text-base font-bold text-[#1E2616]">
                    ملف الكتاب الإلكتروني
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A8569] max-w-md mx-auto leading-relaxed">
                    ملف الكتاب قيد الإعداد والمراجعة، وسيتاح قريباً للقراءة والتحميل المباشر بإذن الله تعالى.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ================= SIDEBAR (Left in RTL - 4 Cols) ================= */}
          <div className="lg:col-span-4 space-y-4 text-right">
            <div className="bg-white rounded-2xl border border-[#E8E3D5] p-5 sm:p-6 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                <h3 className="text-sm font-bold text-[#1E2616]">
                  كتب من نفس القسم
                </h3>
                <Link
                  href={book.categoryId ? `/books?categoryId=${book.categoryId}` : "/books"}
                  className="text-xs font-bold text-[#C0673F] hover:underline"
                >
                  الكل ←
                </Link>
              </div>

              {/* Related books list */}
              {relatedBooks.length === 0 ? (
                <p className="text-xs text-[#8C987E] py-4 text-center">
                  لا توجد كتب مقترحة أخرى في هذا القسم حالياً.
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedBooks.slice(0, 6).map((relBook) => {
                    const relDate = formatArabicDate(relBook.publishDate || relBook.createdAt) || "14 أكتوبر 2026";
                    return (
                      <Link
                        key={relBook.id}
                        href={`/books/${relBook.id}`}
                        className="group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-transparent hover:border-[#E2DDCB] hover:bg-[#FAF8F3] transition-all"
                      >
                        {/* Book Info */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-xs sm:text-[13px] font-bold text-[#2A331D] group-hover:text-[#3F4A2B] transition-colors line-clamp-1 leading-snug">
                            {relBook.title}
                          </h4>
                          <div className="text-[10.5px] text-[#7A8569] flex items-center gap-1.5">
                            <span>{relBook.categoryName || book.categoryName}</span>
                          </div>
                          <div className="text-[10px] text-[#9EA98F] font-mono">
                            {relDate}
                          </div>
                        </div>

                        {/* Dark Olive Book Icon Box */}
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#2C3820] text-[#FAFAF5] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.7}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
