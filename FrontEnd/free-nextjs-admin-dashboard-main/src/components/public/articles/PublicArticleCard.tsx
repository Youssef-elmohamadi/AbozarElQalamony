"use client";

import React from "react";
import Link from "next/link";
import type { PublicArticle } from "@/api/public/content";
import { formatReadingTime, formatArabicDate } from "@/lib/arabicPlural";

interface PublicArticleCardProps {
  article: PublicArticle;
}

// Estimate reading time in minutes (approx. 180 Arabic words per minute)
const estimateReadingTime = (text?: string | null): number => {
  if (!text) return 3;
  const clean = text.replace(/<[^>]*>?/gm, "").trim();
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
};

export default function PublicArticleCard({ article }: PublicArticleCardProps) {
  const formattedDate = formatArabicDate(article.publishDate || article.createdAt);
  const minutes = estimateReadingTime(article.body || article.content || article.description);
  const readingTimeText = formatReadingTime(minutes);

  const excerpt =
    article.description ||
    article.summary ||
    (article.body ? article.body.replace(/<[^>]*>?/gm, "").trim().slice(0, 180) : "");

  return (
    <article
      className="group relative flex flex-col h-full bg-white rounded-[14px] border border-[#e9e2d3] p-[22px] text-right overflow-hidden transition-[transform,box-shadow,border-color] duration-[180ms] ease-out [@media(hover:hover)]:hover:-translate-y-[2px] [@media(hover:hover)]:hover:border-[#C0673F] [@media(hover:hover)]:hover:shadow-[0_6px_18px_rgba(38,51,31,0.08)] motion-reduce:transform-none motion-reduce:transition-none focus-within:outline-2 focus-within:outline-[#C0673F] focus-within:outline-offset-[3px]"
    >
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Top Metadata Row: Date (Right in RTL) + Reading Time (Left in RTL) */}
        <div className="flex items-center justify-between text-[13.5px] text-[#6b6a5c] mb-3">
          {/* Formatted Date on the start (Right in RTL) */}
          <span className="font-mono tracking-tight font-medium">
            {formattedDate || "—"}
          </span>

          {/* Reading time with small 14px clock icon on the end (Left in RTL) */}
          <span className="inline-flex items-center gap-1.5 font-medium">
            <svg
              className="w-[14px] h-[14px] shrink-0 text-[#6b6a5c]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{readingTimeText}</span>
          </span>
        </div>

        {/* Title: 19.5px, 600 weight, line-height 1.5, 2-line clamp with min-height 3em so excerpt starts at the same line */}
        <h3 className="text-[19.5px] font-[600] text-[#1E2616] leading-[1.5] line-clamp-2 min-h-[3em] mb-2.5">
          {/* Stretched Link covering the entire card */}
          <Link
            href={`/articles/${article.id}`}
            className="after:absolute after:inset-0 after:z-10 focus:outline-hidden"
          >
            {article.title}
          </Link>
        </h3>

        {/* Excerpt: 15px, line-height 1.9, line-clamp 3, color #4a4d3d */}
        <p className="text-[15px] text-[#4a4d3d] leading-[1.9] line-clamp-3">
          {excerpt || "اضغط لمتابعة قراءة المقال الكامل ومطالعة تفاصيله..."}
        </p>
      </div>

      {/* Footer: Anchored at the bottom with margin-top: auto, border-top: 1px solid #efe8d8, padding-top: 14px */}
      <div className="mt-auto pt-[14px] border-t border-[#efe8d8] flex items-center justify-between">
        {/* Category: 13.5px, #6b6a5c */}
        <span className="text-[13.5px] text-[#6b6a5c] font-medium">
          مقال دعوي
        </span>

        {/* Action Link: Olive color, 600 weight, arrow translates 4px towards the inline-end (Left in RTL) */}
        <span
          className="text-[13.5px] font-[600] text-[#3F4A2B] inline-flex items-center gap-1.5 transition-colors duration-[180ms] [@media(hover:hover)]:group-hover:text-[#C0673F]"
        >
          <span>قراءة المقال</span>
          <svg
            className="w-[14px] h-[14px] transition-transform duration-[180ms] ease-out motion-reduce:transform-none [@media(hover:hover)]:group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* Left arrow icon in RTL points to the left */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      </div>
    </article>
  );
}
