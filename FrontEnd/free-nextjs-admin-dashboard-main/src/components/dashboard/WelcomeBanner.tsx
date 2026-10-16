"use client";

import React from "react";
import Image from "next/image";
import { DashboardStats } from "@/types/dashboard";

interface WelcomeBannerProps {
  stats: DashboardStats;
}

export default function WelcomeBanner({ stats }: WelcomeBannerProps) {
  const totalContent =
    (stats.totalLessons || 0) +
    (stats.totalSermons || 0) +
    (stats.totalBooks || 0) +
    (stats.totalArticles || 0);

  const todayDate = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3F4A2B] via-[#4D5A34] to-[#2E3620] p-6 sm:p-8 text-white shadow-md">
      {/* Background Islamic / Geometric Accents */}
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      <div className="absolute right-1/3 -top-12 w-64 h-64 rounded-full bg-[#C0673F]/15 pointer-events-none blur-3xl" />

      <div className="relative z-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-xs border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{todayDate}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
            لوحة تحكم منصة الشيخ أبو ذر القلموني
          </h1>

          <p className="text-sm text-white/80 leading-relaxed">
            متابعة فورية وإحصائيات شاملة لمحتوى المنصة من دروس علمية، خطب، كتب، ومقالات، وإدارة تنبيهات وأقسام الموقع.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
          <Image
            src="/logo-qalamuni-1.svg"
            alt="شعار الشيخ أبو ذر"
            width={48}
            height={48}
            className="rounded-xl shadow-xs shrink-0"
          />
          <div>
            <span className="block text-xs text-white/70 font-medium">
              إجمالي المحتوى المنشور
            </span>
            <span className="block text-2xl font-black text-white">
              {totalContent.toLocaleString("ar-EG")}{" "}
              <span className="text-xs font-normal text-white/80">مادة علمية</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
