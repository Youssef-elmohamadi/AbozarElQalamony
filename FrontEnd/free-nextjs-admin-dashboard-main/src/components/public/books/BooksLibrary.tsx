"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Category } from "@/api/public/categories";
import type { PublicBook } from "@/api/public/content";
import BooksCategorySlider from "./BooksCategorySlider";
import PublicBookCard from "./PublicBookCard";

interface BooksLibraryProps {
  initialBooks: PublicBook[];
  initialTotalCount: number;
  initialTotalPages: number;
  categories: Category[];
  initialSort?: "latest" | "oldest";
  initialCategoryId?: number | null;
}

export default function BooksLibrary({
  initialBooks,
  initialTotalCount,
  initialTotalPages,
  categories,
  initialSort = "latest",
  initialCategoryId = null,
}: BooksLibraryProps) {
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">(initialSort);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [books, setBooks] = useState<PublicBook[]>(initialBooks);
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

  // Fetch books function (page 1 reset or subsequent pages)
  const fetchBooksData = useCallback(
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
        if (catId) params.set("categoryId", String(catId));
        if (search) params.set("search", search);
        params.set("sort", overrideSort || sortOrder);

        const res = await fetch(`/api/public/books?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch books");

        const data = await res.json();
        const newItems: PublicBook[] = data.items || [];

        if (isNextPage) {
          setBooks((prev) => {
            const existingIds = new Set(prev.map((b) => b.id));
            const filtered = newItems.filter((b) => !existingIds.has(b.id));
            return [...prev, ...filtered];
          });
        } else {
          setBooks(newItems);
        }

        setPage(targetPage);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [sortOrder]
  );

  // Filter books in-memory if needed
  const displayBooks = React.useMemo(() => {
    return books;
  }, [books]);

  // Track previous category and search to prevent unwanted skeletons
  const prevCategoryRef = useRef<number | null>(initialCategoryId);
  const prevSearchRef = useRef<string>("");

  useEffect(() => {
    if (initialCategoryId !== undefined && initialCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  useEffect(() => {
    const isCatChanged = prevCategoryRef.current !== selectedCategoryId;
    const isSearchChanged = prevSearchRef.current !== debouncedSearch;

    if (isCatChanged || isSearchChanged) {
      prevCategoryRef.current = selectedCategoryId;
      prevSearchRef.current = debouncedSearch;
      fetchBooksData(1, selectedCategoryId, debouncedSearch, false);
    }
  }, [selectedCategoryId, debouncedSearch, fetchBooksData]);

  // Handle Sort Change
  const handleSortChange = (newSort: "latest" | "oldest") => {
    if (newSort === sortOrder) return;
    setSortOrder(newSort);
    fetchBooksData(1, selectedCategoryId, debouncedSearch, false, newSort);
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
          fetchBooksData(page + 1, selectedCategoryId, debouncedSearch, true);
        }
      },
      { rootMargin: "350px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, isLoading, isLoadingMore, selectedCategoryId, debouncedSearch, fetchBooksData]);

  return (
    <div className="space-y-6">
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
          <span className="text-[#3F4A2B] font-bold">مكتبة الكتب</span>
        </nav>

        {/* Title & Controls row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          {/* Right side in RTL: Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold font-ruqaa text-[#1E2616] tracking-tight">
              مكتبة الكتب والمؤلفات
            </h1>
            <p className="text-xs sm:text-sm text-[#555E46] leading-relaxed">
              مؤلفات وكتب ورسائل فضيلة الشيخ أبي ذر القلموني في التزكية والرقائق والهمة العالية، متاحة للقراءة والتحميل المباشر.
            </p>
          </div>

          {/* Left side in RTL: Search & Sort controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search box */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في الكتب..."
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

            {/* Custom Sort Dropdown matching Site Identity */}
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
                  <svg
                    className="w-3.5 h-3.5 text-[#3F4A2B]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                </button>
              </div>

              {/* Dropdown Menu */}
              {isSortOpen && (
                <div className="absolute left-0 mt-1.5 w-36 rounded-xl bg-white border border-[#D5DAC8] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
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
      </div>

      {/* Category Slider */}
      <BooksCategorySlider
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
        totalBooksCount={totalCount}
      />

      {/* Main Grid or Loading / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#DFE5D7] overflow-hidden flex flex-col justify-between animate-pulse"
            >
              <div className="w-full aspect-[16/11] bg-gray-200" />
              <div className="p-3.5 space-y-2.5">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-14 bg-gray-200 rounded" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="pt-2.5 border-t border-[#EEF0E6] flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-6 w-20 bg-gray-200 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayBooks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#DFE5D7] p-8 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF0E6] flex items-center justify-center text-[#3F4A2B]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#2A331D]">لا توجد كتب متطابقة</h3>
          <p className="text-xs text-[#8C987E] max-w-sm mx-auto">
            {debouncedSearch
              ? `لم نعثر على نتائج تطابق "${debouncedSearch}". جرّب كتابة كلمات بحث أخرى.`
              : "لا توجد كتب مسجلة في هذا التصنيف حالياً."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayBooks.map((book) => (
            <PublicBookCard key={book.id} book={book} />
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
            <span>جاري تحميل المزيد من الكتب...</span>
          </div>
        </div>
      )}

      {/* Reached End of List Message */}
      {!isLoading && displayBooks.length > 0 && page >= totalPages && (
        <div className="text-center py-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F7F8F4] border border-[#DFE5D7] text-xs font-medium text-[#8C987E]">
            تم عرض جميع الكتب المتاحة ({totalCount} كتاب)
          </span>
        </div>
      )}
    </div>
  );
}
