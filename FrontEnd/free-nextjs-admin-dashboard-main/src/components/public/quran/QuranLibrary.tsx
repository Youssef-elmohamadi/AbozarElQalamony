"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Category } from "@/api/public/categories";
import type { PublicQuran } from "@/api/public/content";
import QuranCategorySlider from "./QuranCategorySlider";
import QuranCard from "./QuranCard";

interface QuranLibraryProps {
  initialItems: PublicQuran[];
  initialTotalCount: number;
  initialTotalPages: number;
  categories: Category[];
  initialSort?: "latest" | "oldest";
  initialCategoryId?: number | null;
}

export default function QuranLibrary({
  initialItems,
  initialTotalCount,
  initialTotalPages,
  categories,
  initialSort = "latest",
  initialCategoryId = null,
}: QuranLibraryProps) {
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">(initialSort);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [items, setItems] = useState<PublicQuran[]>(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Custom sort dropdown state & outside click handler
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  // Sentinel for Infinite Scrolling
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Quran lessons data
  const fetchQuranData = useCallback(
    async (
      targetPage: number,
      catId: number | null,
      search: string,
      isNextPage: boolean = false,
      overrideSort?: "latest" | "oldest"
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isNextPage) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("pageSize", "12");
        const currentSort = overrideSort || sortOrder;
        params.set("sort", currentSort);

        // If specific category selected, send it.
        if (catId !== null && catId > 0) {
          params.set("categoryId", String(catId));
        }

        if (search) {
          params.set("search", search);
        }

        const res = await fetch(`/api/public/quran?${params.toString()}`);
        if (!res.ok) throw new Error("فشل تحميل مجالس القرآن الكريم");

        const data = await res.json();
        const newItems: PublicQuran[] = data.items || [];

        if (isNextPage) {
          setItems((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            const filtered = newItems.filter((l) => !existingIds.has(l.id));
            return [...prev, ...filtered];
          });
        } else {
          setItems(newItems);
        }

        setPage(targetPage);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        console.error("Error loading Quran lessons:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [sortOrder, categories]
  );

  // Handle Sort Change
  const handleSortChange = (newSort: "latest" | "oldest") => {
    setSortOrder(newSort);
    setIsSortOpen(false);
    fetchQuranData(1, selectedCategoryId, debouncedSearch, false, newSort);
  };

  useEffect(() => {
    if (initialCategoryId !== undefined && initialCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Re-fetch on category or search change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchQuranData(1, selectedCategoryId, debouncedSearch, false);
  }, [selectedCategoryId, debouncedSearch, fetchQuranData]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingRef.current && page < totalPages) {
          fetchQuranData(page + 1, selectedCategoryId, debouncedSearch, true);
        }
      },
      {
        rootMargin: "300px",
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [page, totalPages, selectedCategoryId, debouncedSearch, fetchQuranData]);

  // Client-side sorting for current rendered items if user flips sort order
  const displayedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.publishDate || b.createdAt || 0).getTime();
    return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* ================= TOP CARD: Header, Breadcrumb, Subtitle & Sort ================= */}
      <div className="bg-[#FAF7F1] rounded-[20px] border border-[#E4E7DA] p-6 sm:p-8 shadow-xs text-right">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-[#78826B] font-medium mb-3"
          aria-label="مسار التنقل"
        >
          <a href="/" className="hover:text-[#3F4A2B] transition-colors">
            الرئيسية
          </a>
          <span>/</span>
          <span className="text-[#3F4A2B] font-bold">مكتبة القرآن الكريم</span>
        </nav>

        {/* Title & Controls row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          {/* Right side in RTL: Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold font-ruqaa text-[#1E2616] tracking-tight">
              مكتبة القرآن الكريم
            </h1>
            <p className="text-xs sm:text-sm text-[#555E46] leading-relaxed">
              مجالس تدبر القرآن العظيم وتفسير آياته وهداياته، لفضيلة الشيخ أبي ذر القلموني حفظه الله.
            </p>
          </div>

          {/* Left side in RTL: Search & Sort controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search box */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في مجالس القرآن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-56 px-3.5 py-1.5 pr-8 text-xs rounded-xl bg-white border border-[#D5DAC8] text-[#1E2616] placeholder:text-[#8E987B] focus:outline-hidden focus:border-[#3F4A2B] transition-colors"
              />
              <svg
                className="w-3.5 h-3.5 text-[#8E987B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Custom Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#555E46] font-medium hidden sm:inline">
                  ترتيب حسب
                </span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  aria-expanded={isSortOpen}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl bg-white border border-[#D5DAC8] text-[#222B18] font-bold hover:bg-[#F7F8F4] hover:border-[#B8C0A6] transition-colors cursor-pointer shadow-2xs select-none"
                >
                  <svg
                    className={`w-3.5 h-3.5 text-[#636C56] transition-transform duration-200 ${
                      isSortOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span>{sortOrder === "latest" ? "الأحدث" : "الأقدم"}</span>
                </button>
              </div>

              {/* Custom Dropdown Menu */}
              {isSortOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-1.5 w-32 rounded-xl bg-white border border-[#DFE5D7] shadow-xl p-1 z-30 text-right animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => handleSortChange("latest")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      sortOrder === "latest"
                        ? "bg-[#273318] text-[#FAFAF5]"
                        : "text-[#222B18] hover:bg-[#F2F4ED]"
                    }`}
                  >
                    <span>الأحدث</span>
                    {sortOrder === "latest" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSortChange("oldest")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer mt-0.5 ${
                      sortOrder === "oldest"
                        ? "bg-[#273318] text-[#FAFAF5]"
                        : "text-[#222B18] hover:bg-[#F2F4ED]"
                    }`}
                  >
                    <span>الأقدم</span>
                    {sortOrder === "oldest" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CATEGORIES SLIDER ================= */}
      {categories.length > 0 && (
        <section aria-label="فئات القرآن الكريم">
          <QuranCategorySlider
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                if (id) {
                  url.searchParams.set("categoryId", String(id));
                } else {
                  url.searchParams.delete("categoryId");
                }
                window.history.replaceState(null, "", url.toString());
              }
            }}
            totalCount={totalCount}
          />
        </section>
      )}

      {/* ================= QURAN LESSONS GRID ================= */}
      <section aria-label="قائمة مجالس القرآن الكريم">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-[16px] bg-[#FAF7F1] border border-[#E4E7DA] animate-pulse p-5"
              />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF7F1] rounded-[20px] border border-[#E4E7DA] p-8 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF3EF] text-[#C0673F] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-[#1E2616]">
              لا توجد مجالس متوفرة في هذا القسم حالياً.
            </p>
            {selectedCategoryId !== null && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs font-bold text-[#C0673F] hover:underline cursor-pointer"
              >
                عرض كل المجالس
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedItems.map((item, idx) => (
              <QuranCard key={`${item.id}-${idx}`} item={item} index={idx} />
            ))}
          </div>
        )}

        {/* ================= INFINITE SCROLL SENTINEL & LOADING INDICATOR ================= */}
        <div ref={sentinelRef} className="py-6 flex justify-center items-center">
          {isLoadingMore && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-[#D5DAC8] text-[#3F4A2B] text-xs font-bold shadow-2xs">
              <span className="w-4 h-4 border-2 border-[#3F4A2B] border-t-transparent rounded-full animate-spin" />
              <span>جاري تحميل المزيد من المجالس...</span>
            </div>
          )}

          {!isLoading && !isLoadingMore && page >= totalPages && displayedItems.length > 0 && (
            <div className="text-center py-2 text-xs text-[#8E987B] font-medium">
              تم عرض كافة المجالس المتاحة ({totalCount} مجلساً)
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
