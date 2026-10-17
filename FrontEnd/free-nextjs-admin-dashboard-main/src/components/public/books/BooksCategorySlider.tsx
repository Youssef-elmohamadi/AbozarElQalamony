"use client";

import React, { useRef } from "react";
import type { Category } from "@/api/public/categories";

interface BooksCategorySliderProps {
  categories: Category[];
  selectedCategoryId: number | null; // null represents "كل الكتب"
  onSelectCategory: (id: number | null) => void;
  totalBooksCount?: number;
}

export default function BooksCategorySlider({
  categories,
  selectedCategoryId,
  onSelectCategory,
  totalBooksCount,
}: BooksCategorySliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full group/slider select-none">
      {/* Scroll controls (desktop) */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="تمرير لليمين"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-[#DFE5D7] shadow-md items-center justify-center text-[#3F4A2B] hover:bg-[#EEF0E6] hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="تمرير لليسار"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-[#DFE5D7] shadow-md items-center justify-center text-[#3F4A2B] hover:bg-[#EEF0E6] hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Horizontal pill list */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto py-2.5 px-1 no-scrollbar scroll-smooth"
      >
        {/* First Button: "كل الكتب" */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
            selectedCategoryId === null
              ? "bg-[#3F4A2B] text-[#FAFAF5] shadow-sm ring-2 ring-[#3F4A2B]/20"
              : "bg-white text-[#556341] border border-[#DFE5D7] hover:border-[#3F4A2B]/40 hover:bg-[#F7F8F4]"
          }`}
        >
          <span>كل الكتب والمؤلفات</span>
          {typeof totalBooksCount === "number" && totalBooksCount > 0 && (
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                selectedCategoryId === null
                  ? "bg-white/20 text-[#FAFAF5]"
                  : "bg-[#EEF0E6] text-[#3F4A2B]"
              }`}
            >
              {totalBooksCount}
            </span>
          )}
        </button>

        {/* Dynamic Category Buttons */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#3F4A2B] text-[#FAFAF5] shadow-sm ring-2 ring-[#3F4A2B]/20"
                  : "bg-white text-[#556341] border border-[#DFE5D7] hover:border-[#3F4A2B]/40 hover:bg-[#F7F8F4]"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
