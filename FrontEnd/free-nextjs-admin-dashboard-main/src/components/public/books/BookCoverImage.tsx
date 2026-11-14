"use client";

import React, { useState } from "react";
import Image from "next/image";

interface BookCoverImageProps {
  coverUrl: string | null;
  title: string;
}

export default function BookCoverImage({ coverUrl, title }: BookCoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!coverUrl || hasError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-3 text-[#3F4A2B] h-full w-full">
        <svg
          className="w-10 h-10 mb-1 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className="text-[11px] font-bold line-clamp-1">{title}</span>
      </div>
    );
  }

  return (
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
          alt={title}
          fill
          unoptimized
          onError={() => setHasError(true)}
          className="object-contain drop-shadow-md group-hover/cover:scale-[1.03] transition-transform duration-300"
        />
      </div>
    </>
  );
}

