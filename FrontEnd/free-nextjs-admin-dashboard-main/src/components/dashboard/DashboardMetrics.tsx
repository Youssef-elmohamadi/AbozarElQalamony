"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/types/dashboard";
import { VideoIcon, AudioIcon, DocsIcon, PageIcon } from "@/icons";

interface DashboardMetricsProps {
  stats: DashboardStats;
}

export default function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const cards = [
    {
      title: "الدروس العلمية",
      value: stats.totalLessons,
      subText: `${stats.mediaStats?.videoLessons ?? 0} درس مرئي • ${stats.mediaStats?.audioOnlyLessons ?? 0} صوتي`,
      href: "/admin/lessons",
      icon: <VideoIcon className="w-6 h-6" />,
      accentColor: "from-[#3F4A2B] to-[#2E3620]",
      badgeBg: "bg-[#3F4A2B]/10 dark:bg-[#3F4A2B]/20 text-[#3F4A2B] dark:text-[#DFE5D7]",
      borderHover: "hover:border-[#3F4A2B]/50",
    },
    {
      title: "الخطب المنبرية",
      value: stats.totalSermons,
      subText: "تسجيلات وخطب الجمعة المنبرية",
      href: "/admin/sermons",
      icon: <AudioIcon className="w-6 h-6" />,
      accentColor: "from-[#C0673F] to-[#9E512F]",
      badgeBg: "bg-[#C0673F]/10 dark:bg-[#C0673F]/20 text-[#C0673F] dark:text-[#E89975]",
      borderHover: "hover:border-[#C0673F]/50",
    },
    {
      title: "الكتب والمؤلفات",
      value: stats.totalBooks,
      subText: "مؤلفات ومصنفات فضيلة الشيخ",
      href: "/admin/books",
      icon: <DocsIcon className="w-6 h-6" />,
      accentColor: "from-[#2A5C8A] to-[#1D4263]",
      badgeBg: "bg-[#2A5C8A]/10 dark:bg-[#2A5C8A]/20 text-[#2A5C8A] dark:text-[#90BFE8]",
      borderHover: "hover:border-[#2A5C8A]/50",
    },
    {
      title: "المقالات والبحوث",
      value: stats.totalArticles,
      subText: "مقالات فكرية وتوجيهية منشورة",
      href: "/admin/articles",
      icon: <PageIcon className="w-6 h-6" />,
      accentColor: "from-[#2E7D32] to-[#1B5E20]",
      badgeBg: "bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#81C784]",
      borderHover: "hover:border-[#2E7D32]/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {cards.map((card, idx) => (
        <Link
          key={idx}
          href={card.href}
          className={`group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${card.borderHover}`}
        >
          {/* Top Row: Title & Icon */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {card.title}
            </span>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${card.badgeBg}`}
            >
              {card.icon}
            </div>
          </div>

          {/* Metric Value */}
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {card.value.toLocaleString("ar-EG")}
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {card.subText}
            </p>
          </div>

          {/* Bottom Accent Line */}
          <div
            className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${card.accentColor} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
          />
        </Link>
      ))}
    </div>
  );
}
