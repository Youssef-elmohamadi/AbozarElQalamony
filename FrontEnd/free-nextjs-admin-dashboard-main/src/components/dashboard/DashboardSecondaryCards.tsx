"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/types/dashboard";
import { FolderIcon, BellIcon, CalenderIcon, CheckCircleIcon, AlertIcon } from "@/icons";

interface DashboardSecondaryCardsProps {
  stats: DashboardStats;
}

export default function DashboardSecondaryCards({ stats }: DashboardSecondaryCardsProps) {
  const hasEmptyCategories = stats.emptyCategories > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {/* 1. Categories Card */}
      <Link
        href="/admin/categories"
        className="group flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-[#3F4A2B]/40 transition-all dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            أقسام وتصنيفات المنصة
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7]">
            <FolderIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="my-3">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {stats.totalCategories.toLocaleString("ar-EG")}
          </span>
          <span className="text-xs text-gray-400 me-1.5 font-medium">تصنيف</span>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          {hasEmptyCategories ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              <AlertIcon className="w-3.5 h-3.5 shrink-0 fill-current" />
              <span>{stats.emptyCategories} تصنيفات فارغة</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>جميع التصنيفات ممتلئة</span>
            </span>
          )}
        </div>
      </Link>

      {/* 2. Added This Month */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            محتوى مضاف هذا الشهر
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>

        <div className="my-3">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {stats.contentAddedThisMonth.toLocaleString("ar-EG")}
          </span>
          <span className="text-xs text-gray-400 me-1.5 font-medium">مادة مضافة</span>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            معدل تحديث المحتوى للشهر الحالي
          </span>
        </div>
      </div>

      {/* 3. Scheduled Content */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            محتوى مجدول للنشر
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <CalenderIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="my-3">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {stats.scheduledContent.toLocaleString("ar-EG")}
          </span>
          <span className="text-xs text-gray-400 me-1.5 font-medium">مادة مجدولة</span>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            تنشر تلقائياً في مواعيدها المحددة
          </span>
        </div>
      </div>

      {/* 4. Active Site Alerts */}
      <Link
        href="/admin/site-alerts"
        className="group flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/40 transition-all dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            تنبيهات وإعلانات الموقع
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <BellIcon className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="my-3">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {stats.totalActiveAlerts.toLocaleString("ar-EG")}
          </span>
          <span className="text-xs text-gray-400 me-1.5 font-medium">تنبيه نشط</span>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            معروضة للزوار في واجهة الموقع
          </span>
        </div>
      </Link>
    </div>
  );
}
