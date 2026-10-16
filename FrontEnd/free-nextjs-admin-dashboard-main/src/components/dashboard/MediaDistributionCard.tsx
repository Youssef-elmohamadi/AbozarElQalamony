"use client";

import React from "react";
import { MediaStats } from "@/types/dashboard";
import { VideoIcon, AudioIcon } from "@/icons";

interface MediaDistributionCardProps {
  mediaStats: MediaStats;
  totalLessons: number;
}

export default function MediaDistributionCard({
  mediaStats,
  totalLessons,
}: MediaDistributionCardProps) {
  const videoCount = mediaStats?.videoLessons ?? 0;
  const audioCount = mediaStats?.audioOnlyLessons ?? 0;
  const total = videoCount + audioCount || totalLessons || 1;

  const videoPercentage = Math.round((videoCount / total) * 100);
  const audioPercentage = 100 - videoPercentage;

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            توزيع المحتوى الوسائطي للدروس
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            نسبة الدروس المرئية (فيديو) مقارنة بالدروس الصوتية فقط
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7]">
          {totalLessons} درس إجمالي
        </span>
      </div>

      {/* Progress Bar Split */}
      <div className="mt-6">
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            style={{ width: `${videoPercentage}%` }}
            className="h-full bg-gradient-to-r from-[#3F4A2B] to-[#5C6E3F] transition-all duration-500"
            title={`دروس مرئية: ${videoPercentage}%`}
          />
          <div
            style={{ width: `${audioPercentage}%` }}
            className="h-full bg-gradient-to-r from-[#C0673F] to-[#E0855C] transition-all duration-500"
            title={`دروس صوتية: ${audioPercentage}%`}
          />
        </div>

        {/* Legend / Metrics Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Video Lessons */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#FAFAF5] dark:bg-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3F4A2B]/15 text-[#3F4A2B] dark:bg-[#3F4A2B]/30 dark:text-[#DFE5D7]">
                <VideoIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900 dark:text-white">
                  دروس مرئية (فيديو)
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  تشمل تسجيلات ومجالس مصورة
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-lg font-extrabold text-[#3F4A2B] dark:text-[#DFE5D7]">
                {videoCount}
              </span>
              <span className="block text-[11px] font-semibold text-gray-400">
                {videoPercentage}%
              </span>
            </div>
          </div>

          {/* Audio Lessons */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#FAFAF5] dark:bg-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C0673F]/15 text-[#C0673F] dark:bg-[#C0673F]/30 dark:text-[#E89975]">
                <AudioIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900 dark:text-white">
                  دروس صوتية فقط
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  تسجيلات صوتية مفرغة ونقية
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-lg font-extrabold text-[#C0673F] dark:text-[#E89975]">
                {audioCount}
              </span>
              <span className="block text-[11px] font-semibold text-gray-400">
                {audioPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
