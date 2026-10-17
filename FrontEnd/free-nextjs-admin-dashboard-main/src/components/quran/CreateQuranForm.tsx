"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createQuranAction } from "@/actions/admin/quran";
import { getAllCategoriesAction } from "@/actions/admin/categories";
import {
  FolderIcon,
  VideoIcon,
  AudioIcon,
  TimeIcon,
  CalenderIcon,
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  TrashBinIcon,
  PlusIcon,
} from "@/icons";

interface CategoryOption {
  id: number;
  name: string;
  parentId?: number | null;
}

export default function CreateQuranForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [title, setTitle] = useState("");
  const [surahName, setSurahName] = useState("");
  const [surahNumber, setSurahNumber] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [durationInMinutes, setDurationInMinutes] = useState<string>("");
  const [publishDate, setPublishDate] = useState<string>("");

  // Files & Previews
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Categories list
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    errors?: Record<string, string[]> | null;
  } | null>(null);

  useEffect(() => {
    getAllCategoriesAction(4)
      .then((res) => {
        if (res && Array.isArray(res)) {
          setCategories(
            res.map((c: any) => ({
              id: c.id,
              name: c.name,
              parentId: c.parentId ?? null,
            }))
          );
        }
      })
      .finally(() => setIsLoadingCats(false));
  }, []);

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({
        type: "error",
        message: "يرجى إدخال عنوان التلاوة أو المقطع القرآني",
      });
      return;
    }

    if (!categoryId) {
      setFeedback({
        type: "error",
        message: "يرجى اختيار التصنيف القرآني المناسب",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("categoryId", categoryId);

    if (surahName.trim()) formData.append("surahName", surahName.trim());
    if (surahNumber.trim()) formData.append("surahNumber", surahNumber.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (durationInMinutes.trim()) formData.append("durationInMinutes", durationInMinutes.trim());
    if (publishDate.trim()) formData.append("publishDate", publishDate.trim());

    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    if (audioFile) formData.append("audioFile", audioFile);
    if (videoFile) formData.append("videoFile", videoFile);

    startTransition(async () => {
      try {
        const res = await createQuranAction(formData);
        if (res.success) {
          setFeedback({
            type: "success",
            message: "تم حفظ ونشر مقطع القرآن بنجاح! جاري الانتقال للقائمة...",
          });
          setTimeout(() => {
            router.push("/admin/quran");
          }, 1200);
        } else {
          setFeedback({
            type: "error",
            message: res.message || "فشل حفظ المقطع القرآني",
            errors: res.errors,
          });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "حدث خطأ غير متوقع",
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إضافة تسجيل قرآن وتدبر جديد
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إدخال بيانات السورة، التسجيل الصوتي أو المرئي، وتحديد التصنيف المناسب
          </p>
        </div>
        <Link
          href="/admin/quran"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition-colors"
        >
          العودة للقائمة
        </Link>
      </div>

      {/* Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
            ) : (
              <AlertIcon className="w-5 h-5 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          {feedback.errors && (
            <ul className="mt-2 list-disc list-inside text-sm space-y-1">
              {Object.entries(feedback.errors).map(([key, msgs]) => (
                <li key={key}>{msgs.join(", ")}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              عنوان التلاوة / الدرس القرآني <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تلاوة عطرة مع وقفات تدبرية من سورة النحل"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              التصنيف القرآني <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isLoadingCats}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm"
            >
              <option value="">-- اختر التصنيف --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم السورة
            </label>
            <input
              type="text"
              value={surahName}
              onChange={(e) => setSurahName(e.target.value)}
              placeholder="مثال: الكهف أو مريم أو جزء عم"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              رقم السورة في المصحف (1 - 114)
            </label>
            <input
              type="number"
              min="1"
              max="114"
              value={surahNumber}
              onChange={(e) => setSurahNumber(e.target.value)}
              placeholder="مثال: 18"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المدة التقديرية (بالدقائق)
            </label>
            <input
              type="number"
              min="1"
              value={durationInMinutes}
              onChange={(e) => setDurationInMinutes(e.target.value)}
              placeholder="مثال: 25"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تاريخ التسجيل أو النشر
            </label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              وصف أو وقفات تدبرية حول المقطع
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة توضيحية أو معاني مستفادة من الآيات الكريمة..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-hidden text-sm resize-none"
            />
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            ملفات الوسائط والصور
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Audio Upload */}
            <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <AudioIcon className="w-4 h-4 text-emerald-600" />
                الملف الصوتي (MP3)
              </label>
              <input
                type="file"
                accept="audio/*"
                ref={audioInputRef}
                onChange={handleAudioChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 text-center font-medium transition-colors"
              >
                {audioFile ? audioFile.name : "اختر ملف صوتي..."}
              </button>
              {audioPreview && (
                <div className="mt-3">
                  <audio controls className="w-full h-8" src={audioPreview} />
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <VideoIcon className="w-4 h-4 text-purple-600" />
                المقطع المرئي (MP4)
              </label>
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={handleVideoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 text-center font-medium transition-colors"
              >
                {videoFile ? videoFile.name : "اختر ملف فيديو..."}
              </button>
              {videoPreview && (
                <div className="mt-3">
                  <video controls className="w-full h-24 rounded object-cover bg-black" src={videoPreview} />
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                صورة الغلاف / المعاينة
              </label>
              <input
                type="file"
                accept="image/*"
                ref={thumbInputRef}
                onChange={handleThumbChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 text-center font-medium transition-colors"
              >
                {thumbnailFile ? thumbnailFile.name : "اختر صورة غلاف..."}
              </button>
              {thumbnailPreview && (
                <div className="mt-3 flex justify-center">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-20 h-20 rounded-lg object-cover border" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
          <Link
            href="/admin/quran"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>جاري الحفظ والرفع...</span>
              </>
            ) : (
              <span>حفظ ونشر التلاوة</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
