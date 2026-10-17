"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/api/public/categories";

interface ContentFilterProps {
  categories: Category[];
  initialType?: string;
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
  onFilterChange?: (filters: {
    type: string;
    categoryId: string;
    search: string;
    sort: string;
  }) => void;
}

const CONTENT_TYPES = [
  { id: "all", label: "كافة المواد" },
  { id: "lessons", label: "الدروس العلمية" },
  { id: "sermons", label: "خطب الجمعة" },
  { id: "books", label: "الكتب والمؤلفات" },
  { id: "articles", label: "المقالات والرسائل" },
  { id: "quran", label: "مجالس القرآن الكريم" },
];

export default function ContentFilter({
  categories = [],
  initialType = "all",
  initialCategory = "",
  initialSearch = "",
  initialSort = "latest",
  onFilterChange,
}: ContentFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeType, setActiveType] = useState(
    searchParams.get("type") || initialType
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || initialCategory
  );
  const [search, setSearch] = useState(
    searchParams.get("q") || initialSearch
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort") || initialSort
  );

  const applyFilters = (
    type: string,
    category: string,
    query: string,
    sort: string
  ) => {
    setActiveType(type);
    setSelectedCategory(category);
    setSearch(query);
    setSortOrder(sort);

    if (onFilterChange) {
      onFilterChange({ type, categoryId: category, search: query, sort });
      return;
    }

    const params = new URLSearchParams();
    if (type && type !== "all") params.set("type", type);
    if (category) params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    if (sort && sort !== "latest") params.set("sort", sort);

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(targetUrl);
  };

  const handleTypeClick = (typeId: string) => {
    let newCategory = selectedCategory;
    if (selectedCategory) {
      const cat = categories.find((c) => String(c.id) === selectedCategory);
      if (cat) {
        if (typeId === "lessons" && cat.type !== 2) newCategory = "";
        else if (typeId === "sermons" && cat.type !== 3) newCategory = "";
        else if (typeId === "books" && cat.type !== 1) newCategory = "";
        else if (typeId === "quran" && cat.type !== 4) newCategory = "";
      }
    }
    applyFilters(typeId, newCategory, search, sortOrder);
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(activeType, e.target.value, search, sortOrder);
  };

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(activeType, selectedCategory, search, e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(activeType, selectedCategory, search, sortOrder);
  };

  const handleReset = () => {
    applyFilters("all", "", "", "latest");
  };

  // Filter category dropdown to match selected content type
  const filteredCategories = categories.filter((cat) => {
    if (activeType === "all") return true;
    if (activeType === "lessons") return cat.type === 2;
    if (activeType === "sermons") return cat.type === 3;
    if (activeType === "books") return cat.type === 1;
    if (activeType === "quran") return cat.type === 4;
    return true;
  });

  const hasActiveFilters =
    activeType !== "all" ||
    selectedCategory !== "" ||
    search.trim() !== "" ||
    sortOrder === "oldest";

  return (
    <div className="w-full bg-white rounded-2xl border border-brand-200/70 p-4 sm:p-5 shadow-xs mb-8">
      {/* Top Row: Type Pills (Tabs) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 border-b border-gray-100 no-scrollbar">
        {CONTENT_TYPES.map((type) => {
          const isActive = activeType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeClick(type.id)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#3F4A2B] text-white shadow-xs"
                  : "bg-[#EEF0E6]/70 text-brand-900 hover:bg-[#EEF0E6] hover:text-brand-700"
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Bottom Row: Category Selector, Sort Selector, Search Input, and Reset */}
      <div className="mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Category Dropdown */}
          <div className="w-full sm:w-56 relative">
            <select
              value={selectedCategory}
              onChange={handleCategorySelect}
              aria-label="تصفية حسب التصنيف"
              className="w-full appearance-none bg-[#FAFAF5] border border-brand-200/80 text-brand-900 text-xs sm:text-sm rounded-xl py-2.5 pr-3 pl-8 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-400 font-medium cursor-pointer"
            >
              <option value="">
                {activeType === "all"
                  ? "جميع التصنيفات"
                  : `تصنيفات ${CONTENT_TYPES.find((t) => t.id === activeType)?.label || ""}`}
              </option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2.5 text-brand-700">
              <svg
                className="w-4 h-4"
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
            </div>
          </div>

          {/* Sort Selector: Newest vs Oldest */}
          <div className="w-full sm:w-48 relative">
            <select
              value={sortOrder}
              onChange={handleSortSelect}
              aria-label="ترتيب المحتوى حسب التاريخ"
              className="w-full appearance-none bg-[#FAFAF5] border border-brand-200/80 text-brand-900 text-xs sm:text-sm rounded-xl py-2.5 pr-8 pl-8 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-400 font-bold cursor-pointer transition shadow-2xs"
            >
              <option value="latest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#3F4A2B]">
              <svg
                className="w-4 h-4"
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
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-brand-700">
              <svg
                className="w-4 h-4"
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
            </div>
          </div>
        </div>

        {/* Search Field & Reset */}
        <div className="flex items-center gap-2 flex-1">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative flex items-center"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالعنوان أو الكلمات الدلالية..."
              className="w-full bg-[#FAFAF5] border border-brand-200/80 text-brand-900 placeholder-gray-400 text-xs sm:text-sm rounded-xl py-2.5 pr-9 pl-16 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-400 transition"
            />
            <button
              type="submit"
              className="absolute right-3 text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
              aria-label="بحث"
            >
              <svg
                className="w-4 h-4"
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
            </button>
            <button
              type="submit"
              className="absolute left-1.5 px-3 py-1 bg-[#3F4A2B] hover:bg-[#343E23] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              فلترة
            </button>
          </form>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-bold text-[#C0673F] hover:text-[#A65330] hover:bg-accent-50 rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1 border border-accent-200/60 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>إلغاء الفلترة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
