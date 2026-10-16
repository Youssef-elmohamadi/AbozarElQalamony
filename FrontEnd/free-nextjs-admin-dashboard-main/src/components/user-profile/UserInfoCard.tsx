"use client";

import React from "react";
import { UserProfile } from "@/types/user";
import { UserIcon, EnvelopeIcon, LockIcon, PencilIcon, CheckCircleIcon } from "@/icons";

interface UserInfoCardProps {
  user: UserProfile | null;
  loading?: boolean;
  onEditClick: () => void;
}

export default function UserInfoCard({
  user,
  loading = false,
  onEditClick,
}: UserInfoCardProps) {
  if (loading) {
    return (
      <div className="p-6 md:p-8 rounded-3xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs animate-pulse">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 rounded-3xl border border-gray-200/90 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            البيانات الشخصية
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            تفاصيل حسابك الشخصي في لوحة تحكم المنصة
          </p>
        </div>

        <button
          onClick={onEditClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <PencilIcon className="w-3.5 h-3.5 fill-current" />
          <span>تعديل</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7] flex items-center justify-center shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-400">الاسم الكامل</span>
            <span className="block text-sm font-bold text-gray-800 dark:text-white mt-1">
              {user?.name || "—"}
            </span>
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7] flex items-center justify-center shrink-0">
            <EnvelopeIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-400">البريد الإلكتروني</span>
            <span
              dir="ltr"
              className="block text-sm font-bold text-gray-800 dark:text-white mt-1 text-start"
            >
              {user?.email || "—"}
            </span>
          </div>
        </div>

        {/* Role Name */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/25 dark:text-[#DFE5D7] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M10 2a4 4 0 00-4 4v1H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs text-gray-400">الدور والصلاحية</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-gray-800 dark:text-white">
                {user?.roleName || "مسؤول"}
              </span>
              {user?.roleId && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  ID: {user.roleId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-400">حالة التحقق والأمان</span>
            <span className="block text-sm font-bold text-green-600 dark:text-green-400 mt-1">
              حساب مفعل وموثق
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
