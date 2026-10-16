"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createArticleAction } from "@/actions/admin/articles";
import { CloseIcon, AlertIcon, CheckCircleIcon } from "@/icons";

// Dynamic import with no SSR to avoid TinyMCE hydration issues
const EditorWrapper = dynamic(
  () => import("@/components/common/EditorWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-2xl border border-gray-200 bg-[#FAFAF5] dark:border-gray-800 dark:bg-gray-800/40 flex items-center justify-center text-sm text-gray-400 animate-pulse">
        جاري تحميل محرر المقالات...
      </div>
    ),
  }
);

export default function CreateArticleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "عنوان المقال مطلوب";
    } else if (title.trim().length > 500) {
      errs.title = "يجب ألا يتجاوز العنوان 500 حرف";
    }

    if (description && description.length > 4000) {
      errs.description = "يجب ألا يتجاوز الوصف 4000 حرف";
    }

    if (!body.trim() || body === "<p></p>" || body === "<div></div>") {
      errs.body = "محتوى المقال مطلوب";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validate()) return;

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          body: body.trim(),
          publishDate: publishDate
            ? new Date(publishDate).toISOString()
            : null,
        };

        const res = await createArticleAction(payload);

        if (res.success) {
          setServerSuccess(res.message || "تم إنشاء المقال بنجاح!");
          setTimeout(() => {
            router.push("/admin/articles");
            router.refresh();
          }, 1200);
        } else {
          setServerError(res.message || "حدث خطأ أثناء حفظ المقال");
          if (res.errors) {
            const fieldErrors: Record<string, string> = {};
            for (const [key, val] of Object.entries(res.errors)) {
              fieldErrors[key.toLowerCase()] = Array.isArray(val) ? val[0] : val;
            }
            setErrors(fieldErrors);
          }
        }
      } catch (err: any) {
        setServerError(err?.message || "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إضافة مقال جديد
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            كتابة ونشر مقال جديد مع تنسيق النصوص والعناوين والاقتباسات
          </p>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/admin"
                className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link
                href="/admin/articles"
                className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                المقالات
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li className="font-medium text-brand-600 dark:text-brand-400">
              إضافة مقال
            </li>
          </ol>
        </nav>
      </div>

      {/* Alerts */}
      {serverError && (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertIcon className="w-5 h-5 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {serverSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl border bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 text-sm font-medium">
          <CheckCircleIcon className="w-5 h-5 shrink-0 text-green-600" />
          <span>{serverSuccess} (جاري التحويل لجدول المقالات...)</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-gray-200/90 bg-white p-6 md:p-8 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            عنوان المقال <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="أدخل عنوان المقال الرئيسي..."
            className={`w-full h-12 px-4 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden text-right dark:bg-gray-800/60 dark:text-white transition-colors ${
              errors.title
                ? "border-red-400 bg-red-50/20 focus:border-red-500"
                : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] dark:border-gray-700"
            }`}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description & Publish Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              الوصف المختصر (نبذة عن المقال)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="اكتب نبذة مختصرة توجز فكرة ومحتوى المقال..."
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-[#FAFAF5] text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#3F4A2B] focus:outline-hidden text-right dark:border-gray-700 dark:bg-gray-800/60 dark:text-white transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              تاريخ النشر
            </label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAFAF5] text-sm text-gray-800 focus:border-[#3F4A2B] focus:outline-hidden text-right dark:border-gray-700 dark:bg-gray-800/60 dark:text-white transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              التاريخ الذي يظهر للزوار عند قراءة المقال
            </p>
          </div>
        </div>

        {/* TinyMCE Rich Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            محتوى المقال الكامل <span className="text-red-500">*</span>
          </label>
          <EditorWrapper
            value={body}
            onChange={(content) => {
              setBody(content);
              if (errors.body) setErrors((prev) => ({ ...prev, body: "" }));
            }}
            height={520}
            placeholder="ابدأ بكتابة المقال هنا... يمكنك إدراج عناوين رئيسية وفرعية، آيات قرآنية، أحاديث نبوية، جداول، واقتباسات."
          />
          {errors.body && (
            <p className="text-xs text-red-500 mt-2 font-medium">{errors.body}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/admin/articles"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            إلغاء والعودة
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#3F4A2B] text-white text-sm font-semibold hover:bg-[#323b22] active:bg-[#272e1a] disabled:opacity-50 transition-colors shadow-theme-xs cursor-pointer"
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            )}
            <span>{isPending ? "جاري الحفظ..." : "نشر المقال"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
