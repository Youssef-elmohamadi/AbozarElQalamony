import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonById, LessonItem } from "@/api/admin/lessons";
import {
  FolderIcon,
  VideoIcon,
  AudioIcon,
  TimeIcon,
  CalenderIcon,
  PencilIcon,
} from "@/icons";

interface LessonDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LessonDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const lesson = await getLessonById(id);
    if (lesson) {
      return {
        title: `${lesson.title} | لوحة التحكم`,
        description: lesson.description || "معاينة تفاصيل الدرس",
      };
    }
  } catch {}
  return {
    title: "معاينة الدرس | لوحة التحكم",
  };
}

export default async function LessonDetailsPage({ params }: LessonDetailsPageProps) {
  const { id } = await params;
  let lesson: LessonItem | null = null;

  try {
    lesson = await getLessonById(id);
  } catch (error) {
    console.error("Error fetching lesson:", error);
  }

  if (!lesson) {
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
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const videoUrl = getMediaUrl(lesson.videoFilePath);
  const audioUrl = getMediaUrl(lesson.audioFilePath);
  const thumbUrl = getMediaUrl(lesson.thumbnailPath);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin/lessons" className="hover:text-brand-600 transition-colors">
              الدروس
            </Link>
            <span>/</span>
            <span>تفاصيل الدرس #{lesson.id}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {lesson.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/lessons/${lesson.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PencilIcon className="w-3.5 h-3.5 fill-current" />
            <span>تعديل الدرس</span>
          </Link>
          <Link
            href="/admin/lessons"
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
            المعرف: #{lesson.id}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold bg-[#3F4A2B]/10 text-[#3F4A2B] dark:bg-[#3F4A2B]/20 dark:text-[#DFE5D7]">
            <FolderIcon className="w-3.5 h-3.5 fill-current" />
            <span>{lesson.categoryName}</span>
          </span>
          {lesson.durationInMinutes && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <TimeIcon className="w-3.5 h-3.5" />
              <span>{lesson.durationInMinutes} دقيقة</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <CalenderIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(lesson.publishDate || lesson.createdAt)}</span>
          </span>
        </div>

        {/* Video Player */}
        {videoUrl && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-purple-600" />
              <span>فيديو الدرس</span>
            </h3>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-md border border-gray-200 dark:border-gray-800">
              <video
                controls
                src={videoUrl}
                poster={thumbUrl || undefined}
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
                <span>التسجيل الصوتي الكامل للدرس</span>
              </span>
              {lesson.durationInMinutes && (
                <span>المدة: {lesson.durationInMinutes} دقيقة</span>
              )}
            </div>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {/* Thumbnail if no video */}
        {!videoUrl && thumbUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-96 bg-gray-100 dark:bg-gray-800">
            <img src={thumbUrl} alt={lesson.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        <div className="p-5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
            تفاصيل ومحاور الدرس:
          </h3>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {lesson.description || "لا يوجد وصف مدخل لهذا الدرس."}
          </p>
        </div>
      </div>
    </div>
  );
}
