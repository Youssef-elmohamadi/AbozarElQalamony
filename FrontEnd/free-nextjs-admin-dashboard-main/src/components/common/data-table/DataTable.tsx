"use client";

import React from "react";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import { ColumnDef, CreateButtonConfig } from "./types";

interface DataTableProps<T> {
  title: string;
  totalCount?: number;
  createButton?: CreateButtonConfig;
  columns: ColumnDef<T>[];
  data: T[];
  isFetching?: boolean;
  emptyMessage?: string;
  getRowKey?: (item: T, index: number) => string | number;
  pagination?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function DataTable<T>({
  title,
  totalCount,
  createButton,
  columns,
  data,
  isFetching = false,
  emptyMessage = "لا توجد نتائج مطابقة",
  getRowKey = (item: any, i) => item.id ?? i,
  pagination,
  headerActions,
}: DataTableProps<T>) {
  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      {/* Top Header with Title, Count & Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {totalCount !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-300">
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {headerActions}

          {createButton && (
            createButton.href ? (
              <Link
                href={createButton.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-theme-xs cursor-pointer"
              >
                {createButton.icon || <PlusIcon className="w-4 h-4 stroke-current" />}
                <span>{createButton.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={createButton.onClick}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-theme-xs cursor-pointer"
              >
                {createButton.icon || <PlusIcon className="w-4 h-4 stroke-current" />}
                <span>{createButton.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-start text-sm">
          {/* Branded Olive Green Header (#3F4A2B) */}
          <thead className="bg-[#3F4A2B] text-white">
            <tr>
              {columns.map((col, idx) => {
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "end"
                    ? "text-end"
                    : "text-start";

                return (
                  <th
                    key={idx}
                    className={`py-3.5 px-4 font-semibold text-xs tracking-wider ${alignClass} ${
                      col.headerClassName || ""
                    }`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody
            className={`divide-y divide-gray-200/70 dark:divide-gray-800 transition-opacity duration-200 ${
              isFetching ? "opacity-50" : "opacity-100"
            }`}
          >
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    {isFetching ? (
                      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    )}
                    <p className="text-sm font-medium">
                      {isFetching
                        ? "جاري تحميل البيانات من الخادم..."
                        : emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={getRowKey(item, rowIndex)}
                  className="hover:bg-[#EEF0E6]/30 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((col, colIndex) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "end"
                        ? "text-end"
                        : "text-start";

                    let content: React.ReactNode = null;
                    if (col.render) {
                      content = col.render(item, rowIndex);
                    } else if (col.accessor) {
                      content = col.accessor(item);
                    } else if (col.accessorKey) {
                      content = String(item[col.accessorKey] ?? "");
                    }

                    return (
                      <td
                        key={colIndex}
                        className={`py-4 px-4 ${alignClass} ${col.className || ""}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Embedded Pagination */}
      {pagination}
    </div>
  );
}
