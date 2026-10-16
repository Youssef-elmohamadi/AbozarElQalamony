"use client";

import React from "react";

interface DataTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  pageSizeOptions?: number[];
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function DataTablePagination({
  currentPage,
  pageSize,
  totalCount,
  pageSizeOptions = [6, 10, 20, 50],
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  if (totalCount <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);
  const startIndex = (currentSafePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  // Generate page numbers with a smart window if many pages
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    if (currentSafePage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentSafePage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentSafePage - 1, currentSafePage, currentSafePage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-gray-800">
      {/* Counters & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          عرض{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {startIndex + 1}
          </span>{" "}
          إلى{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {endIndex}
          </span>{" "}
          من{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {totalCount}
          </span>{" "}
          عنصر
        </div>

        <div className="flex items-center gap-1.5 p-1 text-xs text-gray-500 dark:text-gray-400">
          <span>عناصر لكل صفحة:</span>
          <select
            value={pageSize}
            disabled={isFetching}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-hidden disabled:opacity-50 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentSafePage - 1))}
          disabled={currentSafePage === 1 || isFetching}
          className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          السابق
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((pageItem, idx) => {
          if (pageItem === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-xs text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = pageItem as number;
          const isActive = currentSafePage === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              disabled={isFetching}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#3F4A2B] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentSafePage + 1))}
          disabled={currentSafePage === totalPages || isFetching}
          className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
