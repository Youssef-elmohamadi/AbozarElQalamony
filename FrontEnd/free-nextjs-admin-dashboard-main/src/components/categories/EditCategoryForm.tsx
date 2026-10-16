"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCategoryAction, getAllCategoriesAction } from "@/actions/admin/categories";
import {
  FolderIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  ChevronDownIcon,
} from "@/icons";

export interface CategoryData {
  id: number;
  name: string;
  type: number;
  parentId?: number | null;
}

interface ParentCategoryOption {
  id: number;
  name: string;
  type: number;
}

interface EditCategoryFormProps {
  category: CategoryData;
}

export default function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form fields initialized with category data
  const [name, setName] = useState(category.name || "");
  const [type, setType] = useState<number>(category.type || 1);
  const [parentId, setParentId] = useState<string>(
    category.parentId ? String(category.parentId) : "none"
  );

  // Parent categories options
  const [parentOptions, setParentOptions] = useState<ParentCategoryOption[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  // Validation & feedback state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  // Category types
  const categoryTypes = [
    { id: 1, label: "كتب", desc: "تصنيفات الكتب والمصنفات العلمية" },
    { id: 2, label: "دروس", desc: "تصنيفات الدروس العلمية والدورات" },
    { id: 3, label: "خطب", desc: "تصنيفات الخطب المنبرية والمحاضرات" },
    { id: 4, label: "قرآن كريم", desc: "تصنيفات التلاوات والتفاسير وعلوم القرآن" },
  ];

  // Fetch parent categories matching the selected type, excluding self
  useEffect(() => {
    let isMounted = true;
    const fetchParents = async () => {
      setLoadingParents(true);
      try {
        const data = await getAllCategoriesAction(type);
        if (isMounted) {
          // Exclude this category itself to prevent cycles
          const validParents = (Array.isArray(data) ? data : []).filter(
            (c) => c.id !== category.id
          );
          setParentOptions(validParents);
        }
      } catch (err) {
        console.error("Error loading parent categories:", err);
      } finally {
        if (isMounted) setLoadingParents(false);
      }
    };

    fetchParents();

    return () => {
      isMounted = false;
    };
  }, [type, category.id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "اسم التصنيف مطلوب";
    } else if (name.trim().length > 300) {
      newErrors.name = "اسم التصنيف يجب ألا يتجاوز 300 حرف";
    }

    if (!type || ![1, 2, 3, 4].includes(type)) {
      newErrors.type = "يرجى تحديد نوع التصنيف بشكل صحيح";
    }

    if (parentId !== "none" && Number(parentId) === category.id) {
      newErrors.parentId = "لا يمكن للتصنيف أن يكون تصنيفاً رئيسياً لنفسه";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validateForm()) return;

    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          type: Number(type),
          parentId: parentId !== "none" ? Number(parentId) : null,
        };

        const res = await updateCategoryAction(category.id, payload);

        if (res.success) {
          setServerSuccess("تم تحديث بيانات التصنيف بنجاح! جاري التوجيه...");
          setTimeout(() => {
            router.push("/admin/categories");
            router.refresh();
          }, 1200);
        } else {
          setServerError(res.message || "فشل تحديث التصنيف، يرجى مراجعة البيانات.");
          if (res.errors) {
            const mappedErrors: Record<string, string> = {};
            for (const [key, val] of Object.entries(res.errors)) {
              if (Array.isArray(val) && val.length > 0) {
                mappedErrors[key.toLowerCase()] = val[0];
              } else if (typeof val === "string") {
                mappedErrors[key.toLowerCase()] = val;
              }
            }
            setErrors((prev) => ({ ...prev, ...mappedErrors }));
          }
        }
      } catch (err: any) {
        setServerError(err?.message || "حدث خطأ غير متوقع أثناء الحفظ");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            تعديل التصنيف #{category.id}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            تعديل اسم التصنيف أو نوعه أو تغيير التصنيف الأب المرتبط به
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
                href="/admin/categories"
                className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                التصنيفات
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li className="font-medium text-brand-600 dark:text-brand-400">
              تعديل التصنيف #{category.id}
            </li>
          </ol>
        </nav>
      </div>

      {/* Success Alert */}
      {serverSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 animate-in fade-in">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm font-semibold">{serverSuccess}</p>
        </div>
      )}

      {/* Error Alert */}
      {serverError && (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm font-semibold">{serverError}</p>
          </div>
          <button
            onClick={() => setServerError(null)}
            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6"
      >
        {/* Name input */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            اسم التصنيف <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
              <FolderIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="مثال: خطب الجمعة، فقه المعاملات..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`w-full h-12 ps-12 pe-4 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:outline-hidden text-start dark:bg-gray-800/60 dark:text-white ${
                errors.name
                  ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                  : "border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] focus:ring-2 focus:ring-[#3F4A2B]/15 dark:border-gray-800"
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Type selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            نوع المحتوى التابع له <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {categoryTypes.map((item) => {
              const isSelected = type === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setType(item.id);
                    if (errors.type) setErrors((prev) => ({ ...prev, type: "" }));
                  }}
                  className={`p-4 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#3F4A2B] bg-[#3F4A2B]/5 ring-2 ring-[#3F4A2B]/20 dark:border-brand-500 dark:bg-brand-500/10"
                      : "border-gray-200 bg-[#FAFAF5] hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-[#3F4A2B] bg-[#3F4A2B] text-white"
                          : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
              <span>{errors.type}</span>
            </p>
          )}
        </div>

        {/* Parent Category selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
              التصنيف الرئيسي (الأب)
            </label>
            <span className="text-xs text-gray-400">
              اختياري (اتركه فارغاً لجعله تصنيفاً رئيسياً)
            </span>
          </div>

          <div className="relative">
            <select
              value={parentId}
              onChange={(e) => {
                setParentId(e.target.value);
                if (errors.parentId) setErrors((prev) => ({ ...prev, parentId: "" }));
              }}
              disabled={loadingParents}
              className="w-full h-12 appearance-none px-4 pe-10 rounded-xl border text-sm text-gray-800 focus:outline-hidden transition-colors border-gray-200 bg-[#FAFAF5] focus:border-[#3F4A2B] focus:ring-2 focus:ring-[#3F4A2B]/15 dark:border-gray-800 dark:bg-gray-800/60 dark:text-white cursor-pointer disabled:opacity-60"
            >
              <option value="none">بدون (تصنيف رئيسي)</option>
              {parentOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  #{opt.id} - {opt.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
          {errors.parentId && (
            <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
              <span>{errors.parentId}</span>
            </p>
          )}
          {loadingParents && (
            <p className="text-xs text-gray-400 mt-1">جاري تحميل التصنيفات التابعة لهذا النوع...</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/admin/categories"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3F4A2B] hover:bg-[#323b22] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <span>حفظ التعديلات</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
