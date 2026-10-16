import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCategoryById } from "@/api/admin/categories";
import EditCategoryForm from "@/components/categories/EditCategoryForm";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditCategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `تعديل التصنيف #${id} | لوحة التحكم`,
    description: "تعديل بيانات ونوع والتصنيف الأب في النظام",
  };
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  let category = null;

  try {
    category = await getCategoryById(id);
  } catch (error) {
    console.warn(`Could not load category with ID: ${id}`, error);
  }

  if (!category) {
    return (
      <div className="py-12">
        <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            التصنيف غير موجود
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            تعذر العثور على التصنيف بالمعرف #{id} أو قد تم حذفه مسبقاً.
          </p>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F4A2B] text-white text-sm font-semibold hover:bg-[#323b22] transition-colors"
          >
            العودة لقائمة التصنيفات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <EditCategoryForm category={category} />
    </div>
  );
}
