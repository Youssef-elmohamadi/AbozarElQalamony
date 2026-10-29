"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Category } from "@/api/public/categories";
import type { PublicSermon } from "@/api/public/content";
import SermonsCategorySlider from "./SermonsCategorySlider";
import AudioSermonCard from "./AudioSermonCard";

interface SermonsLibraryProps {
  initialSermons: PublicSermon[];
  initialTotalCount: number;
  initialTotalPages: number;
  categories: Category[];
  initialSort?: "latest" | "oldest";
  initialCategoryId?: number | null;
}

export default function SermonsLibrary({
  initialSermons,
  initialTotalCount,
  initialTotalPages,
  categories,
  initialSort = "latest",
  initialCategoryId = null,
}: SermonsLibraryProps) {
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">(initialSort);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sermons, setSermons] = useState<PublicSermon[]>(initialSermons);
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

  // Fetch sermons function (page 1 reset or subsequent pages)
  const fetchSermonsData = useCallback(
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
        if (catId !== null && catId > 0) {
          params.set("categoryId", String(catId));
        }
        if (search) {
          params.set("search", search);
        }

        const res = await fetch(`/api/public/sermons?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load sermons");
        const data = await res.json();

        const fetchedItems: PublicSermon[] = data.items || [];

        if (isNextPage) {
          setSermons((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newItems = fetchedItems.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newItems];
          });
        } else {
          setSermons(fetchedItems);
        }

        setPage(targetPage);
        setTotalPages(data.totalPages ?? 1);
        setTotalCount(data.totalCount ?? fetchedItems.length);
      } catch (err) {
        console.error("Error loading sermons:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [sortOrder]
  );

  const handleSortChange = (newOrder: "latest" | "oldest") => {
    if (sortOrder === newOrder) {
      setIsSortOpen(false);
      return;
    }
    setSortOrder(newOrder);
    setIsSortOpen(false);
    setPage(1);
    fetchSermonsData(1, selectedCategoryId, debouncedSearch, false, newOrder);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newOrder === "latest") {
        url.searchParams.delete("sort");
      } else {
        url.searchParams.set("sort", newOrder);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Sync selectedCategoryId and sort with URL (handles direct links, client navigation, and browser back/forward buttons)
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("categoryId");
      const urlCatId = catParam !== null && catParam !== "" ? Number(catParam) : null;
      if (urlCatId !== null && !isNaN(urlCatId)) {
        setSelectedCategoryId(urlCatId);
      } else if (catParam === null) {
        setSelectedCategoryId(null);
      }
      const sortParam = params.get("sort");
      if (sortParam === "latest" || sortParam === "oldest") {
        setSortOrder(sortParam);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Track previous category and search values to trigger fetch ONLY on actual user change
  const prevCategoryRef = useRef<number | null>(initialCategoryId);
  const prevSearchRef = useRef<string>(debouncedSearch);

  useEffect(() => {
    if (
      prevCategoryRef.current === selectedCategoryId &&
      prevSearchRef.current === debouncedSearch
    ) {
      return;
    }

    prevCategoryRef.current = selectedCategoryId;
    prevSearchRef.current = debouncedSearch;

    setPage(1);
    fetchSermonsData(1, selectedCategoryId, debouncedSearch, false);
  }, [selectedCategoryId, debouncedSearch, fetchSermonsData]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingRef.current && page < totalPages) {
          fetchSermonsData(page + 1, selectedCategoryId, debouncedSearch, true);
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
  }, [page, totalPages, selectedCategoryId, debouncedSearch, fetchSermonsData]);

  return (
    <div className="space-y-6">
      {/* ================= TOP CARD ================= */}
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
          <span className="text-[#3F4A2B] font-bold">مكتبة الخطب</span>
        </nav>

        {/* Title & Controls row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold font-ruqaa text-[#1E2616] tracking-tight">
              مكتبة الخطب المنبرية
            </h1>
            <p className="text-xs sm:text-sm text-[#555E46] leading-relaxed">
              خطب الجمعة والمواسم الفاضلة ومواعظ التوبة والرقائق، مسموعة ومؤصلة لفضيلة الشيخ أبي ذر القلموني.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search box */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في الخطب..."
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
      <section aria-label="فئات خطب الجمعة">
        <SermonsCategorySlider
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
              window.history.pushState(null, "", url.toString());
            }
          }}
          totalSermonsCount={totalCount}
        />
      </section>

      {/* ================= SERMONS GRID ================= */}
      <section aria-label="قائمة الخطب المنبرية">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-[16px] bg-[#FAF7F1] border border-[#E4E7DA] animate-pulse p-5"
              />
            ))}
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF7F1] rounded-[20px] border border-[#E4E7DA] p-8 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF3EF] text-[#C0673F] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-[#1E2616]">
              لا توجد خطب متوفرة في هذا القسم حالياً.
            </p>
            {selectedCategoryId !== null && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs font-bold text-[#C0673F] hover:underline cursor-pointer"
              >
                عرض كل الخطب
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sermons.map((sermon, idx) => (
              <AudioSermonCard key={`${sermon.id}-${idx}`} sermon={sermon} index={idx} />
            ))}
          </div>
        )}

        {/* Sentinel for Infinite Scrolling */}
        <div ref={sentinelRef} className="py-6 flex justify-center items-center">
          {isLoadingMore && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-[#D5DAC8] text-[#3F4A2B] text-xs font-bold shadow-2xs">
              <span className="w-4 h-4 border-2 border-[#3F4A2B] border-t-transparent rounded-full animate-spin" />
              <span>جاري تحميل المزيد من الخطب...</span>
            </div>
          )}

          {!isLoading && !isLoadingMore && page >= totalPages && sermons.length > 0 && (
            <div className="text-center py-2 text-xs text-[#8E987B] font-medium">
              تم عرض كافة الخطب المتاحة ({totalCount} خطبة)
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
