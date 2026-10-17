import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuranById, QuranItem } from "@/api/admin/quran";
import {
  FolderIcon,
  VideoIcon,
  AudioIcon,
  TimeIcon,
  CalenderIcon,
  PencilIcon,
} from "@/icons";

interface QuranDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: QuranDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getQuranById(id);
    if (item) {
      return {
        title: `${item.title} | القرآن الكريم | لوحة التحكم`,
        description: item.description || "معاينة تفاصيل التلاوة القرآنية",
      };
    }
  } catch {}
  return {
    title: "معاينة التلاوة القرآنية | لوحة التحكم",
  };
}

export default async function QuranDetailsPage({ params }: QuranDetailsPageProps) {
  const { id } = await params;
  let item: QuranItem | null = null;

  try {
    item = await getQuranById(id);
  } catch (error) {
    console.error("Error fetching quran item:", error);
  }

  if (!item) {
    notFound();
  }

  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/quran"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              القرآن الكريم والتلاوات
            </Link>
            <span className="text-gray-400 text-xs">/</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">تفاصيل المقطع</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {item.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/quran/${item.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-xs text-sm"
          >
            <PencilIcon className="w-4 h-4" />
            <span>تعديل</span>
          </Link>
          <Link
            href="/admin/quran"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition-colors"
          >
            العودة
          </Link>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/90 dark:border-gray-800 p-6 shadow-xs space-y-6">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-gray-100 dark:border-gray-800">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <FolderIcon className="w-3.5 h-3.5" />
            {item.categoryName}
          </span>

          {item.surahName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              سورة {item.surahName} {item.surahNumber ? `(رقم ${item.surahNumber})` : ""}
            </span>
          )}

          {item.durationInMinutes && item.durationInMinutes > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <TimeIcon className="w-3.5 h-3.5" />
              المدة: {item.durationInMinutes} دقيقة
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <CalenderIcon className="w-3.5 h-3.5" />
            تاريخ النشر: {formatDate(item.publishDate || item.createdAt)}
          </span>
        </div>

        {/* Thumbnail preview if any */}
        {item.thumbnailPath && (
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <img
              src={getMediaUrl(item.thumbnailPath)!}
              alt={item.title}
              className="max-h-80 w-auto object-contain"
            />
          </div>
        )}

        {/* Description / Tadabbur */}
        {item.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              البيان والوقفات التدبرية:
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              {item.description}
            </p>
          </div>
        )}

        {/* Audio Player */}
        {item.audioFilePath && (
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
              <AudioIcon className="w-4 h-4 text-emerald-600" />
              التسجيل الصوتي
            </h3>
            <audio controls className="w-full mt-2" src={getMediaUrl(item.audioFilePath)!} />
          </div>
        )}

        {/* Video Player */}
        {item.videoFilePath && (
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/40">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-purple-600" />
              التسجيل المرئي
            </h3>
            <video
              controls
              className="w-full max-h-96 rounded-lg bg-black mt-2"
              src={getMediaUrl(item.videoFilePath)!}
            />
          </div>
        )}
      </div>
    </div>
  );
}
