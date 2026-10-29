"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateLessonAction, revalidateLessonsCacheAction } from "@/actions/admin/lessons";
import { getAllCategoriesAction } from "@/actions/admin/categories";
import { LessonItem } from "@/api/admin/lessons";
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
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
} from "@/icons";

interface CategoryOption {
  id: number;
  name: string;
  parentId?: number | null;
}

interface EditLessonFormProps {
  lesson: LessonItem;
}

export default function EditLessonForm({ lesson }: EditLessonFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Helper for media URLs
  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Helper for initial date formatting
  const getInitialDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return dateStr.split("T")[0];
    } catch {
      return "";
    }
  };

  // Form Fields
  const [title, setTitle] = useState(lesson.title || "");
  const [categoryId, setCategoryId] = useState<string>(String(lesson.categoryId || ""));
  const [description, setDescription] = useState(lesson.description || "");
  const [durationInMinutes, setDurationInMinutes] = useState<string>(
    lesson.durationInMinutes != null ? String(lesson.durationInMinutes) : ""
  );
  const [publishDate, setPublishDate] = useState<string>(getInitialDate(lesson.publishDate));

  // Files & Previews
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    getMediaUrl(lesson.thumbnailPath)
  );

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(
    getMediaUrl(lesson.audioFilePath)
  );

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(
    getMediaUrl(lesson.videoFilePath)
  );

  // File Input Refs
  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Helper functions for date
  const formatArabicDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const setTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setPublishDate(`${yyyy}-${mm}-${dd}`);
  };

  const setYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setPublishDate(`${yyyy}-${mm}-${dd}`);
  };

  // Categories Dropdown State
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Feedback & Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Helper to extract token on client
  const getToken = () => {
    if (typeof window === "undefined") return "";
    let token = localStorage.getItem("admin_token") || "";
    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/);
      token = match ? decodeURIComponent(match[1]) : "";
    }
    return token;
  };

  // Direct upload with XHR progress support (PUT for edit)
  const uploadWithProgress = (
    url: string,
    formData: FormData,
    token: string,
    onProgress: (p: number) => void
  ): Promise<{ success: boolean; message?: string; errors?: any; data?: any }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        let data: any = null;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = null;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true, message: data?.message || "تم حفظ التعديلات بنجاح", data: data?.data });
        } else if (xhr.status === 413) {
          resolve({
            success: false,
            message: "حجم الملف كبير جداً (413 Payload Too Large). يرجى التأكد من إعادة تشغيل الـ API لتفعيل حد الـ 2 جيجابايت.",
            errors: data?.errors,
          });
        } else {
          resolve({
            success: false,
            message: data?.message || `خطأ من السيرفر (${xhr.status})`,
            errors: data?.errors,
          });
        }
      };

      xhr.onerror = () => {
        reject(new Error("تعذر الاتصال بالسيرفر مباشرة أو رفض السيرفر الاتصال."));
      };

      xhr.send(formData);
    });
  };

  // Fetch Lesson Categories (Type = 2)
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);
    getAllCategoriesAction(2)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCategories(
            data.map((c: any) => ({
              id: c.id,
              name: c.name,
              parentId: c.parentId ?? null,
            }))
          );
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Thumbnail change handler
  // const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  //   if (!validTypes.includes(file.type)) {
  //     setErrors((prev) => ({
  //       ...prev,
  //       thumbnail: "يجب اختيار صورة بصيغة صالحة (JPG, PNG, WEBP)",
  //     }));
  //     return;
  //   }

  //   if (file.size > 10 * 1024 * 1024) {
  //     setErrors((prev) => ({
  //       ...prev,
  //       thumbnail: "الحد الأقصى لحجم الصورة هو 10 ميجابايت",
  //     }));
  //     return;
  //   }

  //   setErrors((prev) => {
  //     const u = { ...prev };
  //     delete u.thumbnail;
  //     return u;
  //   });

  //   setThumbnailFile(file);
  //   setThumbnailPreview(URL.createObjectURL(file));
  // };

  // Audio change handler
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setErrors((prev) => ({
        ...prev,
        audio: "يجب اختيار ملف صوتي صالح (MP3, WAV, M4A, OGG)",
      }));
      return;
    }

    setErrors((prev) => {
      const u = { ...prev };
      delete u.audio;
      return u;
    });

    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  // Video change handler
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mkv|mov)$/i)) {
      setErrors((prev) => ({
        ...prev,
        video: "يجب اختيار ملف فيديو صالح (MP4, WEBM, MKV)",
      }));
      return;
    }

    setErrors((prev) => {
      const u = { ...prev };
      delete u.video;
      return u;
    });

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "عنوان الدرس مطلوب";
    } else if (title.trim().length > 500) {
      newErrors.title = "عنوان الدرس لا يمكن أن يتجاوز 500 حرف";
    }

    if (!categoryId || Number(categoryId) <= 0) {
      newErrors.categoryId = "يجب اختيار تصنيف للدرس";
    }

    if (durationInMinutes && (isNaN(Number(durationInMinutes)) || Number(durationInMinutes) < 0)) {
      newErrors.duration = "مدة الدرس يجب أن تكون رقماً موجباً";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validate()) return;

    const formData = new FormData();
    formData.append("Title", title.trim());
    formData.append("CategoryId", categoryId);

    if (description.trim()) {
      formData.append("Description", description.trim());
    }

    if (durationInMinutes) {
      formData.append("DurationInMinutes", String(parseInt(durationInMinutes, 10)));
    }

    if (publishDate) {
      formData.append("PublishDate", new Date(publishDate).toISOString());
    }

    if (thumbnailFile) {
      formData.append("ThumbnailFile", thumbnailFile);
    }

    if (audioFile) {
      formData.append("AudioFile", audioFile);
    }

    if (videoFile) {
      formData.append("VideoFile", videoFile);
    }

    setIsUploading(true);
    setUploadProgress(1);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
    const token = getToken();

    const executeSubmission = async () => {
      try {
        let res: any;
        try {
          res = await uploadWithProgress(
            `${baseUrl}/api/admin/lessons/${lesson.id}`,
            formData,
            token,
            (pct) => setUploadProgress(pct)
          );
        } catch (directErr) {
          console.warn("Direct upload failed on primary URL, trying HTTP port 5188:", directErr);
          try {
            res = await uploadWithProgress(
              `http://localhost:5188/api/admin/lessons/${lesson.id}`,
              formData,
              token,
              (pct) => setUploadProgress(pct)
            );
          } catch (httpErr) {
            console.warn("Direct HTTP upload also failed, falling back to Server Action:", httpErr);
            res = await updateLessonAction(lesson.id, formData);
          }
        }

        if (res?.success) {
          setUploadProgress(100);
          setServerSuccess("تم حفظ التعديلات بنجاح! جاري تحديث البيانات والتحويل...");
          try {
            await revalidateLessonsCacheAction(lesson.id);
          } catch (e) {
            console.warn("Revalidation warning:", e);
          }
          setTimeout(() => {
            router.push("/admin/lessons");
            router.refresh();
          }, 800);
        } else {
          setServerError(res?.message || "فشل تعديل الدرس، يرجى مراجعة البيانات.");
          if (res?.errors) {
            const formatted: Record<string, string> = {};
            Object.entries(res.errors).forEach(([k, msgs]: [string, any]) => {
              formatted[k.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : String(msgs);
            });
            setErrors((prev) => ({ ...prev, ...formatted }));
          }
        }
      } catch (err: any) {
        setServerError(err?.message || "حدث خطأ غير متوقع أثناء تعديل الدرس.");
      } finally {
        setIsUploading(false);
      }
    };

    executeSubmission();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin/lessons" className="hover:text-brand-600 transition-colors">
              الدروس
            </Link>
            <span>/</span>
            <span>تعديل الدرس #{lesson.id}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PencilIcon className="w-5 h-5 text-brand-600 fill-current" />
            <span>تعديل بيانات الدرس: {lesson.title}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/lessons/${lesson.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>معاينة الدرس</span>
          </Link>
          <Link
            href="/admin/lessons"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>العودة للقائمة</span>
          </Link>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>جاري رفع ملفات الدرس والتعديلات إلى السيرفر...</span>
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-blue-200/60 dark:bg-blue-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-300">
            يرجى الانتظار وعدم إغلاق الصفحة أثناء رفع الملفات الكبيرة...
          </p>
        </div>
      )}

      {/* Success Banner */}
      {serverSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 flex items-center gap-3 animate-in fade-in">
          <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold">{serverSuccess}</p>
        </div>
      )}

      {/* Error Banner */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 flex items-center gap-3 animate-in fade-in">
          <AlertIcon className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-semibold">{serverError}</p>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
          المعلومات الأساسية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              عنوان أو اسم الدرس <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الدرس..."
              maxLength={500}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.title
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200/50"
                }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              التصنيف <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className={`w-full appearance-none px-4 py-2.5 pe-10 rounded-xl border text-sm transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors.categoryId
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200/50"
                  }`}
              >
                {loadingCategories ? (
                  <option value="">جاري تحميل التصنيفات...</option>
                ) : (() => {
                  const parentIds = new Set(categories.filter((c) => c.parentId).map((c) => c.parentId!));
                  const parentMap = new Map<number, string>();
                  categories.forEach((c) => {
                    if (parentIds.has(c.id)) parentMap.set(c.id, c.name);
                  });

                  const groups = new Map<string, CategoryOption[]>();
                  const standalone: CategoryOption[] = [];

                  categories.forEach((c) => {
                    if (parentIds.has(c.id)) {
                      return;
                    }
                    if (c.parentId && parentMap.has(c.parentId)) {
                      const pName = parentMap.get(c.parentId)!;
                      if (!groups.has(pName)) groups.set(pName, []);
                      groups.get(pName)!.push(c);
                    } else {
                      standalone.push(c);
                    }
                  });

                  return (
                    <>
                      {standalone.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      {Array.from(groups.entries()).map(([groupName, items]) => (
                        <optgroup key={groupName} label={groupName}>
                          {items.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </>
                  );
                })()}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>}
          </div>

          {/* Duration in Minutes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              المدة بالدقائق (اختياري)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="10000"
                value={durationInMinutes}
                onChange={(e) => setDurationInMinutes(e.target.value)}
                placeholder="مثال: 45"
                className="w-full px-4 py-2.5 pe-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200/50"
              />
              <TimeIcon className="w-4 h-4 text-gray-400 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.duration && <p className="text-xs text-red-600 mt-1">{errors.duration}</p>}
          </div>

          {/* Publish Date */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                تاريخ النشر (اختياري)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={setTodayDate}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 hover:bg-brand-50 text-gray-700 hover:text-brand-600 dark:bg-gray-800 dark:hover:bg-brand-950/40 dark:text-gray-300 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                >
                  اليوم
                </button>
                <button
                  type="button"
                  onClick={setYesterdayDate}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 hover:bg-brand-50 text-gray-700 hover:text-brand-600 dark:bg-gray-800 dark:hover:bg-brand-950/40 dark:text-gray-300 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                >
                  أمس
                </button>
                {publishDate && (
                  <button
                    type="button"
                    onClick={() => setPublishDate("")}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.();
                  } catch { }
                }}
                className="w-full px-4 py-2.5 pe-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200/50 cursor-pointer transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.();
                  } catch { }
                }}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                title="فتح التقويم"
              >
                <CalenderIcon className="w-4 h-4" />
              </button>
            </div>

            {publishDate ? (
              <div className="mt-2 flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-brand-50/70 dark:bg-brand-950/20 border border-brand-200/70 dark:border-brand-800/40 text-brand-700 dark:text-brand-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>التاريخ المحدد: <strong>{formatArabicDate(publishDate)}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setPublishDate("")}
                  className="text-[11px] text-gray-500 hover:text-red-600 transition-colors cursor-pointer underline"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                💡 إذا تركته فارغاً، سيتم اعتماد تاريخ اليوم تلقائياً عند النشر.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              وصف وتفاصيل الدرس (اختياري)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ملخص الدرس ومحاوره..."
              maxLength={4000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200/50 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Media Files */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
          الملفات والوسائط
        </h3>

        {/* 1. Thumbnail Image Upload */}
        {/* <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            الصورة المصغرة (Thumbnail)
          </label>

          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />

          {thumbnailPreview ? (
            <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="w-full h-44 object-cover rounded-lg"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                  {thumbnailFile ? thumbnailFile.name : "الصورة الحالية"}
                </span>
                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <PencilIcon className="w-3.5 h-3.5 fill-current" />
                  <span>تغيير الصورة</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="w-full sm:max-w-md p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-500 bg-gray-50/50 dark:bg-gray-800/40 text-center transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <PlusIcon className="w-6 h-6 fill-current" />
              </div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                اضغط لاختيار صورة مصغرة جديدة
              </p>
            </button>
          )}
          {errors.thumbnail && <p className="text-xs text-red-600 mt-1">{errors.thumbnail}</p>}
        </div> */}

        {/* 2. Audio File Upload */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <AudioIcon className="w-4 h-4 text-blue-600" />
            <span>التسجيل الصوتي (Audio File)</span>
          </label>

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
            onChange={handleAudioChange}
            className="hidden"
          />

          {audioPreview ? (
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-900 dark:text-blue-300 truncate max-w-sm">
                  {audioFile ? audioFile.name : "الملف الصوتي الحالي المسجل"}
                </span>
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <PencilIcon className="w-3.5 h-3.5 fill-current" />
                  <span>تغيير الملف الصوتي</span>
                </button>
              </div>
              <audio controls src={audioPreview} className="w-full mt-2" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="w-full sm:max-w-md p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-gray-50/50 dark:bg-gray-800/40 text-center transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <AudioIcon className="w-5 h-5 fill-current" />
              </div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                اضغط لرفع ملف صوتي جديد
              </p>
            </button>
          )}
          {errors.audio && <p className="text-xs text-red-600 mt-1">{errors.audio}</p>}
        </div>

        {/* 3. Video File Upload */}
        {/* <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <VideoIcon className="w-4 h-4 text-purple-600" />
            <span>ملف الفيديو (Video File)</span>
          </label>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*,.mp4,.webm,.mkv,.mov"
            onChange={handleVideoChange}
            className="hidden"
          />

          {videoPreview ? (
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-purple-900 dark:text-purple-300 truncate max-w-sm">
                  {videoFile ? videoFile.name : "فيديو الدرس الحالي"}
                </span>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <PencilIcon className="w-3.5 h-3.5 fill-current" />
                  <span>تغيير الفيديو</span>
                </button>
              </div>
              <div className="max-w-md aspect-video rounded-lg overflow-hidden bg-black">
                <video controls src={videoPreview} className="w-full h-full object-contain" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full sm:max-w-md p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 bg-gray-50/50 dark:bg-gray-800/40 text-center transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <VideoIcon className="w-5 h-5 fill-current" />
              </div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                اضغط لرفع فيديو جديد للدرس
              </p>
            </button>
          )}
          {errors.video && <p className="text-xs text-red-600 mt-1">{errors.video}</p>}
        </div> */}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <Link
          href="/admin/lessons"
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          إلغاء
        </Link>

        <button
          type="submit"
          disabled={isPending || isUploading}
          className="px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3F4A2B] hover:bg-[#343e23] disabled:opacity-50 shadow-md shadow-[#3F4A2B]/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري رفع الملفات ({uploadProgress}%)...</span>
            </>
          ) : isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري حفظ التعديلات...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
