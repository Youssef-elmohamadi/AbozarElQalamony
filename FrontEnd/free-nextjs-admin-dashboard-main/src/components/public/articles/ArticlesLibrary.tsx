"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { PublicArticle } from "@/api/public/content";
import PublicArticleCard from "./PublicArticleCard";
import { formatArticlesCount } from "@/lib/arabicPlural";

interface ArticlesLibraryProps {
  initialArticles: PublicArticle[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialSort?: "latest" | "oldest";
  initialSearch?: string;
}

const isTestArticle = (article: { title?: string; body?: string; description?: string | null }) => {
  const t = (article.title || "").trim();
  const d = (article.description || "").trim();
  return t.includes("تللت") || d.includes("تللت") || /test/i.test(t);
};

export default function ArticlesLibrary({
  initialArticles,
  initialTotalCount,
  initialTotalPages,
  initialSort = "latest",
  initialSearch = "",
}: ArticlesLibraryProps) {
  // State
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Clean initial articles from any test items
  const cleanInitialArticles = initialArticles.filter((a) => !isTestArticle(a));

  const [articles, setArticles] = useState<PublicArticle[]>(cleanInitialArticles);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(cleanInitialArticles.length || initialTotalCount);
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
  const requestIdRef = useRef(0);

  // Sync browser URL seamlessly
  const updateUrl = useCallback((search: string, sort: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (search.trim()) {
      url.searchParams.set("search", search.trim());
    } else {
      url.searchParams.delete("search");
      url.searchParams.delete("q");
    }
    if (sort && sort !== "latest") {
      url.searchParams.set("sort", sort);
    } else {
      url.searchParams.delete("sort");
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch articles function (page 1 reset or subsequent pages)
  const fetchArticlesData = useCallback(
    async (
      targetPage: number,
      search: string,
      isNextPage: boolean = false,
      overrideSort?: "latest" | "oldest"
    ) => {
      if (isNextPage && isFetchingRef.current) return;
      isFetchingRef.current = true;

      const currentReqId = ++requestIdRef.current;
      const activeSort = overrideSort || sortOrder;

      if (isNextPage) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("pageSize", "12");
        if (search) params.set("search", search);
        params.set("sort", activeSort);

        const res = await fetch(`/api/public/articles?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch articles");

        const data = await res.json();
        // Ignore response if a newer search/sort was fired
        if (currentReqId !== requestIdRef.current) return;

        const rawItems: PublicArticle[] = data.items || [];
        const newItems = rawItems.filter((a) => !isTestArticle(a));

        if (isNextPage) {
          setArticles((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const filtered = newItems.filter((a) => !existingIds.has(a.id));
            return [...prev, ...filtered];
          });
        } else {
          setArticles(newItems);
        }

        setPage(targetPage);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount ?? newItems.length);
      } catch (err) {
        console.error("Error loading articles:", err);
      } finally {
        if (currentReqId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          isFetchingRef.current = false;
        }
      }
    },
    [sortOrder]
  );

  // Track previous search to prevent unwanted skeletons
  const prevSearchRef = useRef<string>(initialSearch);

  useEffect(() => {
    const isSearchChanged = prevSearchRef.current !== debouncedSearch;

    if (isSearchChanged) {
      prevSearchRef.current = debouncedSearch;
      updateUrl(debouncedSearch, sortOrder);
      fetchArticlesData(1, debouncedSearch, false);
    }
  }, [debouncedSearch, sortOrder, fetchArticlesData, updateUrl]);

  // Handle Sort Change
  const handleSortChange = (newSort: "latest" | "oldest") => {
    if (newSort === sortOrder) return;
    setSortOrder(newSort);
    updateUrl(debouncedSearch, newSort);
    fetchArticlesData(1, debouncedSearch, false, newSort);
  };

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          page < totalPages &&
          !isLoading &&
          !isLoadingMore &&
          !isFetchingRef.current
        ) {
          fetchArticlesData(page + 1, debouncedSearch, true);
        }
      },
      { rootMargin: "350px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, isLoading, isLoadingMore, debouncedSearch, fetchArticlesData]);

  const displayCount = articles.length;

  return (
    <div className="space-y-6 text-right">
      {/* ================= COMPACT TOP CARD: Header, Breadcrumb, Subtitle & Single-row Controls ================= */}
      <div className="bg-[#FAF7F1] rounded-2xl border border-[#E4E7DA] p-5 sm:p-7 shadow-xs space-y-4">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-[#78826B] font-medium"
          aria-label="مسار التنقل"
        >
          <a href="/" className="hover:text-[#3F4A2B] transition-colors">
            الرئيسية
          </a>
          <span>/</span>
          <span className="text-[#3F4A2B] font-bold">مكتبة المقالات</span>
        </nav>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-[32px] sm:text-[38px] font-bold font-ruqaa text-[#1E2616] leading-snug">
            المقالات والرسائل الدعوية
          </h1>
          <p className="text-sm sm:text-[15px] text-[#4E573D] leading-relaxed max-w-2xl">
            مقالات وبحوث ورسائل فضيلة الشيخ أبي ذر القلموني في التزكية والعقيدة والتربية الإيمانية ومفاهيم السلوك.
          </p>
        </div>

        {/* Controls Row: Placed neatly right below the description */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث في المقالات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-64 px-3.5 py-2 pr-9 text-xs sm:text-[13px] rounded-xl bg-white border border-[#D5DAC8] text-[#1E2616] placeholder:text-[#8E987B] focus:outline-hidden focus:border-[#3F4A2B] transition-colors shadow-2xs"
            />
            <svg
              className="w-4 h-4 text-[#8E987B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E987B] hover:text-[#1E2616] p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[13px] text-[#555E46] font-medium hidden sm:inline">
                ترتيب حسب
              </span>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-expanded={isSortOpen}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-[13px] rounded-xl bg-white border border-[#D5DAC8] text-[#222B18] font-bold hover:bg-[#F7F8F4] hover:border-[#B8C0A6] transition-colors cursor-pointer shadow-2xs select-none"
              >
                <svg
                  className={`w-3.5 h-3.5 text-[#636C56] transition-transform duration-200 ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>{sortOrder === "latest" ? "الأحدث" : "الأقدم"}</span>
                <svg className="w-3.5 h-3.5 text-[#3F4A2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu */}
            {isSortOpen && (
              <div className="absolute right-0 sm:left-0 mt-1.5 w-36 rounded-xl bg-white border border-[#D5DAC8] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    handleSortChange("latest");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    sortOrder === "latest"
                      ? "bg-[#3F4A2B]/10 text-[#3F4A2B]"
                      : "text-[#1E2616] hover:bg-[#FAF7F1]"
                  }`}
                >
                  <span>الأحدث أولاً</span>
                  {sortOrder === "latest" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3F4A2B]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSortChange("oldest");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    sortOrder === "oldest"
                      ? "bg-[#3F4A2B]/10 text-[#3F4A2B]"
                      : "text-[#1E2616] hover:bg-[#FAF7F1]"
                  }`}
                >
                  <span>الأقدم أولاً</span>
                  {sortOrder === "oldest" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3F4A2B]" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SINGLE UNIFIED STATUS LINE: e.g. "7 مقالات · الأحدث" ================= */}
      <div className="px-1 text-xs sm:text-[13px] text-[#4A543B] font-semibold flex items-center gap-2">
        <span>{formatArticlesCount(displayCount)}</span>
        <span>·</span>
        <span>{sortOrder === "latest" ? "الأحدث" : "الأقدم"}</span>
      </div>

      {/* ================= ARTICLES GRID ================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#DFE5D7] p-5 sm:p-6 space-y-4 animate-pulse h-64 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-4/5" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
              <div className="pt-3 border-t border-[#EEF0E6] flex justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#DFE5D7] p-8 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF0E6] flex items-center justify-center text-[#3F4A2B]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#2A331D]">لا توجد مقالات متطابقة</h3>
          <p className="text-xs text-[#8C987E] max-w-sm mx-auto">
            {debouncedSearch
              ? `لم نعثر على نتائج تطابق "${debouncedSearch}". جرّب كلمات بحث أخرى.`
              : "لا توجد مقالات منشورة حالياً."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {articles.map((article) => (
            <PublicArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-6 w-full" />

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#DFE5D7] shadow-xs text-xs font-bold text-[#3F4A2B]">
            <div className="w-4 h-4 border-2 border-[#3F4A2B] border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل المزيد من المقالات...</span>
          </div>
        </div>
      )}

      {/* Reached End of List Message */}
      {!isLoading && articles.length > 0 && page >= totalPages && (
        <div className="text-center py-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F7F8F4] border border-[#DFE5D7] text-xs font-medium text-[#8C987E]">
            تم عرض جميع المقالات ({formatArticlesCount(displayCount)})
          </span>
        </div>
      )}
    </div>
  );
}
