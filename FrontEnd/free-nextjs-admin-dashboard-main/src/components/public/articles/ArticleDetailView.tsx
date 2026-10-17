"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PublicArticle } from "@/api/public/content";
import { formatArabicDate, formatReadingTime } from "@/lib/arabicPlural";

interface ArticleDetailViewProps {
  article: PublicArticle;
  relatedArticles: PublicArticle[];
  prevArticle?: PublicArticle | null;
  nextArticle?: PublicArticle | null;
}

const isTestArticle = (item: { title?: string; description?: string | null }) => {
  const t = String(item?.title || "");
  const d = String(item?.description || "");
  return t.includes("تللت") || d.includes("تللت") || /test/i.test(t);
};

const estimateReadingTime = (text?: string | null): number => {
  if (!text) return 3;
  const clean = text.replace(/<[^>]*>?/gm, "").trim();
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
};

export default function ArticleDetailView({
  article,
  relatedArticles = [],
  prevArticle,
  nextArticle,
}: ArticleDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [fontScale, setFontScale] = useState<number>(100); // 90%, 100%, 115%, 130%

  const formattedDate = formatArabicDate(article.publishDate || article.createdAt);
  const readingTime = estimateReadingTime(article.body || article.content || article.description);
  const readingTimeText = formatReadingTime(readingTime);
  const bodyHtml = article.body || article.content || "";

  const cleanRelated = relatedArticles.filter((r) => !isTestArticle(r));

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
          title: article.title,
          text: article.description || article.title,
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const increaseFont = () => setFontScale((s) => Math.min(s + 15, 145));
  const decreaseFont = () => setFontScale((s) => Math.max(s - 15, 85));
  const resetFont = () => setFontScale(100);

  return (
    <div className="py-6 sm:py-10 bg-[#FAF8F3] min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ================= BREADCRUMBS ================= */}
        <nav
          className="flex items-center gap-1.5 text-xs text-[#7A8569] font-medium"
          aria-label="مسار التنقل"
        >
          <Link href="/" className="hover:text-[#3F4A2B] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[#3F4A2B] transition-colors">
            مكتبة المقالات
          </Link>
          <span>/</span>
          <span className="text-[#1E2616] font-bold truncate max-w-[200px] sm:max-w-xs">
            {article.title}
          </span>
        </nav>

        {/* ================= 2-COLUMN GRID LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================= MAIN ARTICLE AREA (8 Cols) ================= */}
          <div className="lg:col-span-8 space-y-6">
            <article className="bg-white rounded-3xl border border-[#E8E3D5] p-6 sm:p-10 shadow-xs space-y-6">
              {/* Header: Reading Time, Date & Tools */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
                {/* Right in RTL: Reading Time & Date */}
                <div className="flex items-center gap-2.5 flex-wrap text-[13px] sm:text-[13.5px] font-medium text-[#465136]">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#556341]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{readingTimeText}</span>
                  </span>
                  {formattedDate && (
                    <>
                      <span className="text-[#D1DAC4]">•</span>
                      <span className="font-mono text-[#465136]">{formattedDate}</span>
                    </>
                  )}
                </div>

                {/* Left in RTL: Reading Tools (Font Resizer, Share, Print) */}
                <div className="flex items-center gap-1.5 select-none print:hidden">
                  {/* Font Size Adjusters */}
                  <div className="flex items-center bg-[#FAF7F1] border border-[#E4E7DA] rounded-xl p-0.5 text-xs text-[#556341]">
                    <button
                      type="button"
                      onClick={decreaseFont}
                      title="تصغير الخط"
                      className="px-2 py-1 rounded-lg hover:bg-white transition-colors cursor-pointer font-bold"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={resetFont}
                      title="إعادة ضبط حجم الخط"
                      className="px-2 py-1 text-[11px] font-mono hover:bg-white transition-colors cursor-pointer"
                    >
                      {fontScale}%
                    </button>
                    <button
                      type="button"
                      onClick={increaseFont}
                      title="تكبير الخط"
                      className="px-2 py-1 rounded-lg hover:bg-white transition-colors cursor-pointer font-bold"
                    >
                      A+
                    </button>
                  </div>

                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    title="طباعة المقال"
                    className="p-2 rounded-xl bg-[#FAF7F1] border border-[#E4E7DA] text-[#556341] hover:text-[#1E2616] hover:bg-white transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F1] border border-[#E4E7DA] text-xs font-bold text-[#556341] hover:text-[#1E2616] hover:bg-white transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{copied ? "تم النسخ!" : "مشاركة"}</span>
                  </button>
                </div>
              </div>

              {/* Title & Author */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#1E2616] tracking-tight leading-snug">
                  {article.title}
                </h1>
                <div className="text-xs sm:text-sm text-[#556341] font-semibold flex items-center gap-2">
                  <span>بقلم:</span>
                  <span className="text-[#3F4A2B] font-bold">
                    {article.authorName || "فضيلة الشيخ أبو ذر القلموني"}
                  </span>
                </div>
              </div>

              {/* Description / Summary Callout */}
              {(article.description || article.summary) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F1] border-r-4 border-r-[#3F4A2B] border border-[#E4E7DA] text-xs sm:text-sm text-[#465136] leading-relaxed italic">
                  {article.description || article.summary}
                </div>
              )}

              {/* Article Full Body */}
              <div
                style={{ fontSize: `${fontScale}%` }}
                className="transition-[font-size] duration-150 text-[#2B351E] leading-loose space-y-4 pt-2"
              >
                {bodyHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    className="article-content prose prose-olive max-w-none text-right font-normal space-y-4 leading-[2.1] [&_p]:mb-4 [&_p]:text-justify [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#1E2616] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#1E2616] [&_h3]:mt-5 [&_h3]:mb-2 [&_blockquote]:border-r-4 [&_blockquote]:border-[#3F4A2B] [&_blockquote]:bg-[#FAF7F1] [&_blockquote]:p-4 [&_blockquote]:rounded-xl [&_blockquote]:my-4 [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_strong]:text-[#1E2616] [&_strong]:font-bold"
                  />
                ) : (
                  /* Fallback display if body is plain or pending */
                  <div className="space-y-4 text-justify">
                    <p className="indent-4 leading-loose">
                      {article.description || "محتوى المقال قيد المراجعة والنشر قريباً بإذن الله تعالى."}
                    </p>
                  </div>
                )}
              </div>

              {/* Article Footer Bar: Conclusion Quote & Share */}
              <div className="pt-8 mt-8 border-t border-[#F0ECE1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A8569]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F1] border border-[#E4E7DA] flex items-center justify-center text-[#3F4A2B] font-bold">
                    ✍
                  </div>
                  <div>
                    <div className="font-bold text-[#1E2616]">
                      {article.authorName || "فضيلة الشيخ أبو ذر القلموني"}
                    </div>
                    <div className="text-[11px] text-[#8E987B]">الموقع الرسمي لفضيلة الشيخ</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F4A2B] hover:bg-[#323B22] text-[#FAFAF5] text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{copied ? "تم نسخ الرابط!" : "انشر المقال تؤجر"}</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Next / Previous Article Navigation */}
            {(prevArticle || nextArticle) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <Link
                    href={`/articles/${prevArticle.id}`}
                    className="p-4 rounded-2xl bg-white border border-[#E8E3D5] hover:border-[#3F4A2B]/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-1 text-right group"
                  >
                    <span className="text-[11px] text-[#7A8569] font-medium flex items-center gap-1">
                      <span>→</span>
                      <span>المقال السابق</span>
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#1E2616] group-hover:text-[#3F4A2B] transition-colors line-clamp-1">
                      {prevArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextArticle ? (
                  <Link
                    href={`/articles/${nextArticle.id}`}
                    className="p-4 rounded-2xl bg-white border border-[#E8E3D5] hover:border-[#3F4A2B]/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-1 text-left group"
                  >
                    <span className="text-[11px] text-[#7A8569] font-medium flex items-center justify-end gap-1">
                      <span>المقال التالي</span>
                      <span>←</span>
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#1E2616] group-hover:text-[#3F4A2B] transition-colors line-clamp-1 text-right">
                      {nextArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>

          {/* ================= SIDEBAR (4 Cols) ================= */}
          <div className="lg:col-span-4 space-y-5 text-right">
            {/* Related Articles Card */}
            <div className="bg-white rounded-3xl border border-[#E8E3D5] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                <h3 className="text-sm font-bold text-[#1E2616] flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-[#3F4A2B]" />
                  <span>مقالات ورسائل أخرى</span>
                </h3>
                <Link
                  href="/articles"
                  className="text-xs font-bold text-[#C0673F] hover:underline"
                >
                  الكل ←
                </Link>
              </div>

              {cleanRelated.length === 0 ? (
                <p className="text-xs text-[#8C987E] py-4 text-center">
                  لا توجد مقالات مقترحة أخرى حالياً.
                </p>
              ) : (
                <div className="space-y-3">
                  {cleanRelated.slice(0, 5).map((rel) => {
                    const relDate = formatArabicDate(rel.publishDate || rel.createdAt);
                    const relTime = formatReadingTime(
                      estimateReadingTime(rel.body || rel.content || rel.description)
                    );
                    return (
                      <Link
                        key={rel.id}
                        href={`/articles/${rel.id}`}
                        className="group block p-3 rounded-xl border border-transparent hover:border-[#E2DDCB] hover:bg-[#FAF8F3] transition-all space-y-1.5"
                      >
                        <h4 className="text-xs sm:text-[13px] font-bold text-[#2A331D] group-hover:text-[#3F4A2B] transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#556341] font-medium">
                          <span>{relTime}</span>
                          {relDate && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[#556341]">{relDate}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Explore Other Libraries */}
            <div className="bg-white rounded-3xl border border-[#E8E3D5] p-5 sm:p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#7A8569] uppercase tracking-wider mb-2">
                تصفح أقسام الموقع
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  href="/lessons"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F3] text-[#2B351E] font-medium transition-colors"
                >
                  <span>مكتبة الدروس العلمية</span>
                  <span className="text-[#7A8569]">←</span>
                </Link>
                <Link
                  href="/sermons"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F3] text-[#2B351E] font-medium transition-colors"
                >
                  <span>خطب الجمعة المنبرية</span>
                  <span className="text-[#7A8569]">←</span>
                </Link>
                <Link
                  href="/books"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F3] text-[#2B351E] font-medium transition-colors"
                >
                  <span>مكتبة الكتب والمؤلفات</span>
                  <span className="text-[#7A8569]">←</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
