import type { Metadata } from "next";
import React from "react";
import { getDashboardStats } from "@/api/admin/dashboard";
import { DashboardStats } from "@/types/dashboard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import DashboardSecondaryCards from "@/components/dashboard/DashboardSecondaryCards";
import MediaDistributionCard from "@/components/dashboard/MediaDistributionCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";

export const metadata: Metadata = {
  title: "لوحة التحكم | منصة الشيخ أبو ذر القلموني",
  description: "الإحصائيات العامة والمؤشرات الشاملة لمنصة الشيخ أبو ذر القلموني",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats: DashboardStats = {
    totalCategories: 0,
    emptyCategories: 0,
    totalBooks: 0,
    totalLessons: 0,
    totalSermons: 0,
    totalArticles: 0,
    contentAddedThisMonth: 0,
    scheduledContent: 0,
    mediaStats: {
      videoLessons: 0,
      audioOnlyLessons: 0,
    },
    totalActiveAlerts: 0,
  };

  try {
    const data = await getDashboardStats();
    if (data && typeof data === "object") {
      stats = { ...stats, ...data };
    }
  } catch (error) {
    console.error("Error loading dashboard stats in page:", error);
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <WelcomeBanner stats={stats} />

      {/* 2. Primary Metrics (Lessons, Sermons, Books, Articles) */}
      <DashboardMetrics stats={stats} />

      {/* 3. Secondary Metrics (Categories, This Month, Scheduled, Alerts) */}
      <DashboardSecondaryCards stats={stats} />

      {/* 4. Two-Column Section: Media Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <MediaDistributionCard
            mediaStats={stats.mediaStats}
            totalLessons={stats.totalLessons}
          />
        </div>
        <div className="lg:col-span-6">
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
