import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSermonById, SermonItem } from "@/api/admin/sermons";
import {
  FolderIcon,
  VideoIcon,
  AudioIcon,
  CalenderIcon,
  PencilIcon,
} from "@/icons";

interface SermonDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SermonDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const sermon = await getSermonById(id);
    if (sermon) {
      return {
        title: `${sermon.title} | لوحة التحكم`,
        description: sermon.description || "معاينة تفاصيل الخطبة",
      };
    }
  } catch { }
  return {
    title: "معاينة الخطبة | لوحة التحكم",
  };
}

export default async function SermonDetailsPage({ params }: SermonDetailsPageProps) {
  const { id } = await params;
  let sermon: SermonItem | null = null;

  try {
    sermon = await getSermonById(id);
  } catch (error) {
    console.error("Error fetching sermon:", error);
  }

  if (!sermon) {
    notFound();
  }

  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const videoUrl = getMediaUrl(sermon.videoFilePath);
  const audioUrl = getMediaUrl(sermon.audioFilePath);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin/sermons" className="hover:text-brand-600 transition-colors">
              الخطب
            </Link>
            <span>/</span>
            <span>تفاصيل الخطبة #{sermon.id}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {sermon.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/sermons/${sermon.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current" />
            <span>تعديل الخطبة</span>
          </Link>
          <Link
            href="/admin/sermons"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>العودة للقائمة</span>
          </Link>
        </div>
      </div>

      {/* Main Showcase Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        {/* Meta badges */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="font-mono font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
            المعرف: #{sermon.id}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7]">
            <FolderIcon className="w-3.5 h-3.5 fill-current" />
            <span>{sermon.categoryName || "بدون تصنيف"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
            <CalenderIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>إلقاء الخطبة: {formatDate(sermon.khutbahDate)}</span>
          </span>
          {sermon.publishDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <CalenderIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>النشر: {formatDate(sermon.publishDate)}</span>
            </span>
          )}
        </div>

        {/* Video Player */}
        {videoUrl && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-purple-600" />
              <span>فيديو الخطبة (تسجيل مرئي)</span>
            </h3>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-md border border-gray-200 dark:border-gray-800">
              <video
                controls
                src={videoUrl}
                className="w-full h-full object-contain"
              >
                متصفحك لا يدعم تشغيل هذا الفيديو.
              </video>
            </div>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
              <span className="flex items-center gap-2">
                <AudioIcon className="w-5 h-5 text-blue-600" />
                <span>التسجيل الصوتي الكامل للخطبة</span>
              </span>
            </div>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {!videoUrl && !audioUrl && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-center text-xs text-gray-500">
            لا توجد وسائط صوتية أو مرئية مرفقة بهذه الخطبة.
          </div>
        )}

        {/* Description */}
        <div className="p-5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
            تفاصيل ومحاور الخطبة:
          </h3>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {sermon.description || "لا يوجد وصف مدخل لهذه الخطبة."}
          </p>
        </div>
      </div>
    </div>
  );
}
