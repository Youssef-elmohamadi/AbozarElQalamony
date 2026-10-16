"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBookAction, revalidateBooksCacheAction } from "@/actions/admin/books";
import { getAllCategoriesAction } from "@/actions/admin/categories";
import {
  FolderIcon,
  FileIcon,
  DocsIcon,
  UserIcon,
  CalenderIcon,
  CheckCircleIcon,
  AlertIcon,
  TrashBinIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@/icons";

interface CategoryOption {
  id: number;
  name: string;
  parentId?: number | null;
}

export default function CreateBookForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("فضيلة الشيخ أبو ذر القلموني");
  const [categoryId, setCategoryId] = useState<string>("");
  const [publishDate, setPublishDate] = useState<string>("");
  const [description, setDescription] = useState("");

  // Files & Previews
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const publishDateInputRef = useRef<HTMLInputElement | null>(null);

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

  const setPublishToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setPublishDate(`${yyyy}-${mm}-${dd}`);
  };

  const setPublishYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setPublishDate(`${yyyy}-${mm}-${dd}`);
  };

  // Categories Dropdown State (Type = 1 for Books)
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

  // Direct upload with XHR progress support
  const uploadWithProgress = (
    url: string,
    formData: FormData,
    token: string,
    onProgress: (p: number) => void
  ): Promise<{ success: boolean; message?: string; errors?: any; data?: any }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
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
          resolve({
            success: true,
            message: data?.message || "تمت إضافة الكتاب بنجاح",
            data: data?.data,
          });
        } else if (xhr.status === 413) {
          resolve({
            success: false,
            message: "حجم الملف كبير جداً (413 Payload Too Large). يرجى التأكد من أن حجم الملف مناسب.",
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

  // Fetch Book Categories (Type = 1)
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);
    getAllCategoriesAction(1)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          const list: CategoryOption[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            parentId: c.parentId ?? null,
          }));
          setCategories(list);
          const parentIds = new Set(list.filter((c) => c.parentId).map((c) => c.parentId!));
          const selectable = list.filter((c) => !parentIds.has(c.id));
          if (selectable.length > 0) {
            setCategoryId(String(selectable[0].id));
          }
        }
      })
      .catch((err) => console.error("Error loading book categories:", err))
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cover image change handler
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "يجب اختيار صورة بصيغة صالحة (JPG, PNG, WEBP)",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "الحد الأقصى لحجم غلاف الكتاب هو 10 ميجابايت",
      }));
      return;
    }

    setErrors((prev) => {
      const u = { ...prev };
      delete u.coverImage;
      return u;
    });

    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // PDF file change handler
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrors((prev) => ({
        ...prev,
        pdf: "يجب اختيار ملف كتاب بصيغة PDF صالحة (.pdf)",
      }));
      return;
    }

    setErrors((prev) => {
      const u = { ...prev };
      delete u.pdf;
      return u;
    });

    setPdfFile(file);
  };

  const removePdf = () => {
    setPdfFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  // Validate form before submission
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "عنوان الكتاب مطلوب";
    } else if (title.trim().length > 500) {
      newErrors.title = "عنوان الكتاب لا يمكن أن يتجاوز 500 حرف";
    }

    if (!authorName.trim()) {
      newErrors.authorName = "اسم المؤلف مطلوب";
    } else if (authorName.trim().length > 300) {
      newErrors.authorName = "اسم المؤلف لا يمكن أن يتجاوز 300 حرف";
    }

    if (!categoryId || Number(categoryId) <= 0) {
      newErrors.categoryId = "يجب اختيار تصنيف للكتاب";
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
    formData.append("AuthorName", authorName.trim());
    formData.append("CategoryId", categoryId);

    if (description.trim()) {
      formData.append("Description", description.trim());
    }

    if (publishDate) {
      formData.append("PublishDate", new Date(`${publishDate}T00:00:00`).toISOString());
    }

    if (coverImageFile) {
      formData.append("CoverImageFile", coverImageFile);
    }

    if (pdfFile) {
      formData.append("PdfFile", pdfFile);
    }

    setIsUploading(true);
    setUploadProgress(1);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
    const token = getToken();

    const executeSubmission = async () => {
      try {
        let res: any;
        try {
          res = await uploadWithProgress(
            `${baseUrl}/api/admin/books`,
            formData,
            token,
            (pct) => setUploadProgress(pct)
          );
        } catch (directErr) {
          console.warn("Direct upload failed on primary URL, trying HTTP port 5188:", directErr);
          try {
            res = await uploadWithProgress(
              `http://localhost:5188/api/admin/books`,
              formData,
              token,
              (pct) => setUploadProgress(pct)
            );
          } catch (httpErr) {
            console.warn("Direct HTTP upload also failed, falling back to Server Action:", httpErr);
            res = await createBookAction(formData);
          }
        }

        if (res?.success) {
          setUploadProgress(100);
          setServerSuccess("تم إضافة الكتاب بنجاح! جاري تحديث البيانات والتحويل...");
          try {
            await revalidateBooksCacheAction(res?.data?.id);
          } catch (e) {
            console.warn("Revalidation warning:", e);
          }
          setTimeout(() => {
            router.push("/admin/books");
            router.refresh();
          }, 800);
        } else {
          setServerError(res?.message || "فشل إضافة الكتاب، يرجى مراجعة البيانات المدخلة.");
          if (res?.errors) {
            const formatted: Record<string, string> = {};
            Object.entries(res.errors).forEach(([k, msgs]: [string, any]) => {
              formatted[k.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : String(msgs);
            });
            setErrors((prev) => ({ ...prev, ...formatted }));
          }
        }
      } catch (err: any) {
        setServerError(err?.message || "حدث خطأ غير متوقع أثناء إرسال البيانات.");
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
            <Link href="/admin/books" className="hover:text-brand-600 transition-colors">
              الكتب والمؤلفات
            </Link>
            <span>/</span>
            <span>إضافة كتاب جديد</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DocsIcon className="w-6 h-6 text-brand-600" />
            <span>إضافة كتاب جديد</span>
          </h2>
        </div>

        <Link
          href="/admin/books"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
        >
          <span>العودة للقائمة</span>
        </Link>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>جاري رفع ملفات الكتاب والوسائط إلى السيرفر...</span>
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
            يرجى الانتظار وعدم إغلاق الصفحة أثناء رفع ملف الكتاب الكبير...
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
              عنوان أو اسم الكتاب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ففروا إلى الله"
              maxLength={500}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200/50"
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Author Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                اسم المؤلف <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthorName("فضيلة الشيخ أبو ذر القلموني")}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 hover:bg-brand-50 text-gray-700 hover:text-brand-600 dark:bg-gray-800 dark:hover:bg-brand-950/40 dark:text-gray-300 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                title="تحديد الشيخ أبو ذر القلموني كمؤلف"
              >
                الشيخ أبو ذر
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="مثال: فضيلة الشيخ أبو ذر القلموني"
                maxLength={300}
                className={`w-full px-4 py-2.5 pe-10 rounded-xl border text-sm transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.authorName
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200/50"
                }`}
              />
              <UserIcon className="w-4 h-4 text-gray-400 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.authorName && <p className="text-xs text-red-600 mt-1">{errors.authorName}</p>}
          </div>

          {/* Category Dropdown (Type = 1) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              التصنيف <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className={`w-full appearance-none px-4 py-2.5 pe-10 rounded-xl border text-sm transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.categoryId
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-200/50"
                }`}
              >
                {loadingCategories ? (
                  <option value="">جاري تحميل تصنيفات الكتب...</option>
                ) : categories.length === 0 ? (
                  <option value="">لا توجد تصنيفات كتب متاحة</option>
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

          {/* Publish Date (Optional) */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                تاريخ النشر أو الطبعة (اختياري)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={setPublishToday}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-brand-50 text-gray-700 hover:text-brand-600 dark:bg-gray-800 dark:hover:bg-brand-950/40 dark:text-gray-300 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  اليوم
                </button>
                <button
                  type="button"
                  onClick={setPublishYesterday}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-brand-50 text-gray-700 hover:text-brand-600 dark:bg-gray-800 dark:hover:bg-brand-950/40 dark:text-gray-300 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  أمس
                </button>
                {publishDate && (
                  <button
                    type="button"
                    onClick={() => setPublishDate("")}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                ref={publishDateInputRef}
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                onClick={() => {
                  try {
                    publishDateInputRef.current?.showPicker?.();
                  } catch {}
                }}
                className="w-full px-4 py-2.5 pe-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200/50 cursor-pointer transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    publishDateInputRef.current?.showPicker?.();
                  } catch {}
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
                  <span>تاريخ النشر المحدد: <strong>{formatArabicDate(publishDate)}</strong></span>
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
                💡 إذا تركته فارغاً، سيتم اعتماد تاريخ اليوم تلقائياً عند الإضافة.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              نبذة ووصف عن الكتاب (اختياري)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة أو ملخصاً عن موضوع الكتاب ومحتواه وأبرز فصوله ومباحثه..."
              maxLength={4000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200/50 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Files & Media */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
          الملفات والوسائط
        </h3>

        {/* 1. Cover Image Upload */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            صورة غلاف الكتاب (اختياري)
          </label>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            onChange={handleCoverChange}
            className="hidden"
          />

          {coverImagePreview ? (
            <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5">
              <img
                src={coverImagePreview}
                alt="غلاف الكتاب"
                className="w-full h-52 object-contain rounded-lg bg-gray-100 dark:bg-gray-900"
              />
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                <span className="text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                  {coverImageFile?.name}
                </span>
                <button
                  type="button"
                  onClick={removeCover}
                  className="text-red-600 hover:text-red-700 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <TrashBinIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>إزالة الغلاف</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="w-full sm:max-w-md p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 bg-gray-50/50 dark:bg-gray-800/40 text-center transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <PlusIcon className="w-6 h-6 fill-current" />
              </div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                اضغط لاختيار صورة غلاف الكتاب
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                صيغ مدعومة: JPG, PNG, WEBP (حتى 10MB)
              </p>
            </button>
          )}
          {errors.coverImage && <p className="text-xs text-red-600 mt-1">{errors.coverImage}</p>}
        </div>

        {/* 2. PDF File Upload */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <FileIcon className="w-4 h-4 text-rose-600" />
            <span>ملف الكتاب الإلكتروني (PDF - اختياري)</span>
          </label>

          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfChange}
            className="hidden"
          />

          {pdfFile ? (
            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 truncate max-w-sm">
                  <FileIcon className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="truncate">{pdfFile.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px] shrink-0">
                    ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removePdf}
                  className="text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                >
                  <TrashBinIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>إزالة الملف</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="w-full sm:max-w-md p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-rose-500 bg-gray-50/50 dark:bg-gray-800/40 text-center transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <FileIcon className="w-5 h-5 fill-current" />
              </div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                اضغط لرفع ملف الكتاب بصيغة PDF
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                صيغة مدعومة: PDF
              </p>
            </button>
          )}
          {errors.pdf && <p className="text-xs text-red-600 mt-1">{errors.pdf}</p>}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-800">
        <Link
          href="/admin/books"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          إلغاء
        </Link>

        <button
          type="submit"
          disabled={isPending || isUploading}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3F4A2B] hover:bg-[#343e23] disabled:opacity-50 shadow-md shadow-[#3F4A2B]/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري رفع الملفات ({uploadProgress}%)...</span>
            </>
          ) : isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري حفظ الكتاب...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>حفظ وإضافة الكتاب</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
