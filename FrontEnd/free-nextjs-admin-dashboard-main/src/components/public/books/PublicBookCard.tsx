"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicBook } from "@/api/public/content";

interface PublicBookCardProps {
  book: PublicBook;
}

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function PublicBookCard({ book }: PublicBookCardProps) {
  const [imageError, setImageError] = useState(false);

  const formattedDate = book.publishDate || book.createdAt
    ? new Date(book.publishDate || book.createdAt || "").toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const rawCover = getMediaUrl(book.coverImagePath);
  const hasCover = Boolean(rawCover && !imageError);
  const pdfUrl = getMediaUrl(book.pdfFilePath);

  return (
    <article className="group bg-white rounded-xl border border-[#DFE5D7] hover:border-[#3F4A2B]/40 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Cover Image Area - Elegant presentation showing 100% of the book cover */}
      <Link
        href={`/books/${book.id}`}
        className="relative w-full aspect-[4/3] bg-[#EAE8E1] overflow-hidden flex items-center justify-center border-b border-[#EEF0E6] block group/img"
      >
        {hasCover ? (
          <>
            {/* Soft blurred ambient backdrop from the actual cover colors */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-35 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${rawCover})` }}
            />
            {/* Subtle inner shadow / border */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />

            {/* Complete, uncropped cover image */}
            <div className="relative w-full h-full p-2 flex items-center justify-center">
              <Image
                src={rawCover!}
                alt={book.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain drop-shadow-md group-hover/img:scale-[1.03] transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-[#8C987E] group-hover/img:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#EEF0E6] flex items-center justify-center mb-2 text-[#3F4A2B] shadow-2xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#556341] line-clamp-1 max-w-[85%]">{book.title}</span>
          </div>
        )}

        {/* Category badge */}
        {book.categoryName && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#1E2516]/85 backdrop-blur-md text-[#FAF8F2] text-[10px] font-bold shadow-xs">
            {book.categoryName}
          </span>
        )}
      </Link>

      {/* Content Area - Compact padding */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Metadata row */}
          <div className="flex items-center justify-between text-[10.5px] text-[#8C987E]">
            <span className="font-medium text-[#556341] line-clamp-1">
              {book.authorName || book.author || "فضيلة الشيخ أبو ذر القلموني"}
            </span>
            {formattedDate && <span className="shrink-0">{formattedDate}</span>}
          </div>

          {/* Title */}
          <Link
            href={`/books/${book.id}`}
            className="block hover:underline"
          >
            <h3 className="text-xs sm:text-[13.5px] font-bold text-[#2A331D] group-hover:text-[#3F4A2B] transition-colors line-clamp-1 leading-snug">
              {book.title}
            </h3>
          </Link>

          {/* Description */}
          {book.description && (
            <p className="text-[11px] text-[#5E6A4B] line-clamp-2 leading-relaxed">
              {book.description}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-[#EEF0E6] flex items-center justify-between gap-2 text-xs relative z-10">
          <Link
            href={`/books/${book.id}`}
            className="text-[11.5px] font-bold text-[#3F4A2B] hover:text-[#2A331D] flex items-center gap-1 transition-colors"
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
              download
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3F4A2B] text-[#FAFAF5] text-[11px] font-bold hover:bg-[#343E23] transition-colors cursor-pointer shadow-2xs relative z-10"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>تحميل PDF</span>
            </a>
          ) : (
            <span className="text-[10px] text-[#A6B29C] font-medium">سيتاح قريباً</span>
          )}
        </div>
      </div>
    </article>
  );
}
