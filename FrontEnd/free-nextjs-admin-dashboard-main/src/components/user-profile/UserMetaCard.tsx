"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserProfile } from "@/types/user";
import { PencilIcon, CopyIcon, CheckLineIcon, UserCircleIcon } from "@/icons";

interface UserMetaCardProps {
  user: UserProfile | null;
  loading?: boolean;
  onEditClick: () => void;
}

export default function UserMetaCard({
  user,
  loading = false,
  onEditClick,
}: UserMetaCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const avatarUrl = user?.profileImagePath
    ? user.profileImagePath.startsWith("http")
      ? user.profileImagePath
      : `${process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com"}${user.profileImagePath.startsWith("/") ? "" : "/"
      }${user.profileImagePath}`
    : null;

  const initials = user?.name ? user.name.trim().slice(0, 2) : "أد";

  if (loading) {
    return (
      <div className="p-6 md:p-8 rounded-3xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs animate-pulse">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
          <div className="flex-1 space-y-3 text-center md:text-start w-full">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mx-auto md:mx-0" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mx-auto md:mx-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs">
      {/* Decorative top pattern/gradient */}
      <div className="h-32 w-full bg-gradient-to-l from-[#3F4A2B] via-[#4d5b35] to-[#2b331d] relative">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="p-6 md:p-8 pt-0 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-14">
          {/* Avatar and Primary Details */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-start">
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-900 bg-[#3F4A2B]/10 dark:bg-[#3F4A2B]/25 shadow-md flex items-center justify-center font-bold text-2xl md:text-3xl text-[#3F4A2B] dark:text-[#DFE5D7] shrink-0">
                {avatarUrl && !imgError ? (
                  <Image
                    src={avatarUrl}
                    alt={user?.name || "المستخدم"}
                    width={128}
                    height={128}
                    unoptimized
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Status dot */}
              <span
                className="absolute bottom-2 end-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"
                title="الحساب نشط"
              />
            </div>

            <div className="space-y-1.5 pb-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name || "المسؤول"}
                </h2>
                {user?.id && (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/30 dark:text-[#DFE5D7]">
                    #{user.id}
                  </span>
                )}
                {user?.roleName && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    {user.roleName}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span dir="ltr">{user?.email || "—"}</span>
                {user?.email && (
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={copied ? "تم النسخ!" : "نسخ البريد"}
                  >
                    {copied ? (
                      <CheckLineIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <CopyIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Edit Button */}
          <div className="flex items-center justify-center md:justify-end">
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F4A2B] text-white text-sm font-semibold hover:bg-[#323b22] active:bg-[#272e1a] shadow-theme-xs transition-colors cursor-pointer"
            >
              <PencilIcon className="w-4 h-4 fill-current" />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>
        </div>

        {/* Quick highlight bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <span className="block text-xs text-gray-400">الصلاحية</span>
            <span className="block text-sm font-bold text-gray-800 dark:text-white mt-1">
              {user?.roleName || "مسؤول"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <span className="block text-xs text-gray-400">حالة الحساب</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              نشط ومفعل
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <span className="block text-xs text-gray-400">معرف المسؤول</span>
            <span className="block font-mono text-sm font-bold text-gray-800 dark:text-white mt-1">
              {user?.id ? `#${user.id}` : "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFAF5] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <span className="block text-xs text-gray-400">أمان الحساب</span>
            <span className="block text-sm font-bold text-[#3F4A2B] dark:text-[#DFE5D7] mt-1">
              محمي ومؤمن
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
