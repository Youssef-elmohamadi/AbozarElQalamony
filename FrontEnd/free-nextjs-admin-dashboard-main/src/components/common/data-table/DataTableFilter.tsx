"use client";

import React from "react";
import { FilterField, FilterOption } from "./types";

interface DataTableFilterProps {
  title?: string;
  fields: FilterField[];
  values: Record<string, string>;
  totalCount: number;
  itemUnitName?: string;
  isFetching?: boolean;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function DataTableFilter({
  title = "بحث وتصفية",
  fields,
  values,
  totalCount,
  itemUnitName = "عنصر",
  isFetching = false,
  onChange,
  onReset,
}: DataTableFilterProps) {
  // Check if any filter is active (not empty and not 'all')
  const hasActiveFilters = Object.entries(values).some(([key, val]) => {
    if (!val) return false;
    if (val === "all") return false;
    return true;
  });

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      {/* Header with Title & Reset Button */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-brand-500 dark:text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="font-semibold text-gray-800 dark:text-white text-base">
            {title}
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            disabled={isFetching}
            className="text-xs text-[#C0673F] hover:underline font-medium disabled:opacity-50 transition-opacity cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Grid of Filter Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key} className={field.className}>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              {field.label}
            </label>

            {field.type === "search" ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder={field.placeholder || "ابحث..."}
                  value={values[field.key] || ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-[#FAFAF5] px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-800/60 dark:text-white"
                />
              </div>
            ) : field.type === "select" ? (
              <div className="relative">
                <select
                  value={values[field.key] ?? "all"}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  disabled={isFetching}
                  className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-[#FAFAF5] px-4 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-800/60 dark:text-white disabled:opacity-60 cursor-pointer"
                >
                  {(() => {
                    const opts = field.options || [];
                    const hasGroups = opts.some((o) => !!o.group);
                    if (!hasGroups) {
                      return opts.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          disabled={opt.disabled}
                        >
                          {opt.label}
                        </option>
                      ));
                    }

                    const ungrouped = opts.filter((o) => !o.group);
                    const groupNames: string[] = [];
                    const groupedMap = new Map<string, FilterOption[]>();
                    opts.forEach((o) => {
                      if (o.group) {
                        if (!groupedMap.has(o.group)) {
                          groupedMap.set(o.group, []);
                          groupNames.push(o.group);
                        }
                        groupedMap.get(o.group)!.push(o);
                      }
                    });

                    return (
                      <>
                        {ungrouped.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                          >
                            {opt.label}
                          </option>
                        ))}
                        {groupNames.map((grp) => (
                          <optgroup key={grp} label={grp} className="font-semibold text-gray-700 dark:text-gray-300">
                            {groupedMap.get(grp)!.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                disabled={opt.disabled}
                                className="font-normal"
                              >
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </>
                    );
                  })()}
                </select>
                <div className="pointer-events-none absolute inset-y-0 start-auto end-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {/* Quick Stats Box */}
        <div className="flex items-end">
          <div className="w-full h-11 px-4 rounded-xl bg-[#EEF0E6]/60 dark:bg-white/5 border border-brand-200/50 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              إجمالي النتائج:
            </span>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              {isFetching && (
                <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin inline-block" />
              )}
              <span>
                {totalCount} {itemUnitName}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
