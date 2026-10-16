"use client";

import React from "react";
import Link from "next/link";
import { PlusIcon, VideoIcon, AudioIcon, DocsIcon, PageIcon, BellIcon, FolderIcon } from "@/icons";

export default function QuickActionsCard() {
  const actions = [
    {
      title: "إضافة درس جديد",
      desc: "تسجيل أو رفع درس علمي",
      href: "/admin/lessons",
      icon: <VideoIcon className="w-5 h-5" />,
      color: "bg-[#3F4A2B] text-white hover:bg-[#323b22]",
    },
    {
      title: "إضافة خطبة جديدة",
      desc: "خطبة جمعة أو محاضرة",
      href: "/admin/sermons",
      icon: <AudioIcon className="w-5 h-5" />,
      color: "bg-[#C0673F] text-white hover:bg-[#a65531]",
    },
    {
      title: "إضافة مقال جديد",
      desc: "كتابة ونشر مقال علمي",
      href: "/admin/articles/create",
      icon: <PageIcon className="w-5 h-5" />,
      color: "bg-[#2E7D32] text-white hover:bg-[#256628]",
    },
    {
      title: "إضافة كتاب جديد",
      desc: "رفع مصنف أو كتاب PDF",
      href: "/admin/books",
      icon: <DocsIcon className="w-5 h-5" />,
      color: "bg-[#2A5C8A] text-white hover:bg-[#20476b]",
    },
    {
      title: "إضافة تنبيه للموقع",
      desc: "إعلان أو إشعار للزوار",
      href: "/admin/site-alerts",
      icon: <BellIcon className="w-5 h-5 fill-current" />,
      color: "bg-[#B8860B] text-white hover:bg-[#996f09]",
    },
    {
      title: "إدارة التصنيفات",
      desc: "إضافة أو تعديل الأقسام",
      href: "/admin/categories",
      icon: <FolderIcon className="w-5 h-5" />,
      color: "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          إجراءات سريعة لإدارة المحتوى
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          روابط مباشرة للإضافة الفورية والتنقل بين أقسام المنصة
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
        {actions.map((act, i) => (
          <Link
            key={i}
            href={act.href}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-all group"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105 ${act.color}`}
            >
              {act.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#3F4A2B] dark:group-hover:text-[#DFE5D7] transition-colors truncate">
                {act.title}
              </span>
              <span className="block text-xs text-gray-400 truncate">
                {act.desc}
              </span>
            </div>
            <PlusIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
