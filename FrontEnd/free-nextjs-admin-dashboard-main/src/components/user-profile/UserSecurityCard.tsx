"use client";

import React from "react";
import { LockIcon, PencilIcon, CheckCircleIcon } from "@/icons";

interface UserSecurityCardProps {
  onEditPasswordClick: () => void;
}

export default function UserSecurityCard({
  onEditPasswordClick,
}: UserSecurityCardProps) {
  return (
    <div className="p-6 md:p-8 rounded-3xl border border-gray-200/90 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            الأمان وكلمة المرور
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            إدارة كلمة المرور وتأمين حساب المسؤول
          </p>
        </div>

        <button
          onClick={onEditPasswordClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PencilIcon className="w-3.5 h-3.5 fill-current" />
          <span>تغيير كلمة المرور</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-center shrink-0">
            <LockIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-400">حالة كلمة المرور</span>
            <span className="block text-sm font-bold text-gray-800 dark:text-white mt-1">
              •••••••••••• (مشفرة ومحمية)
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-400">توصية أمنية</span>
            <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
              ينصح باستخدام كلمة مرور معقدة تحتوي على أحرف وأرقام ورموز
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
