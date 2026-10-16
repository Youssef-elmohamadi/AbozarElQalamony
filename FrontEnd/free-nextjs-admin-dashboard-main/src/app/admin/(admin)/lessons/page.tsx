import React from "react";
import { Metadata } from "next";
import { getLessons, LessonItem } from "@/api/admin/lessons";
import { getAllCategories } from "@/api/admin/categories";
import LessonsTable, { CategoryOption } from "@/components/lessons/LessonsTable";

export const metadata: Metadata = {
  title: "إدارة الدروس | لوحة التحكم",
  description: "عرض والبحث وإدارة الدروس والمحاضرات الصوتية والمرئية وتصنيفاتها",
};

interface LessonsPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    categoryId?: string;
    search?: string;
    title?: string;
    name?: string;
  }>;
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const categoryId =
    params.categoryId && params.categoryId !== "all"
      ? parseInt(params.categoryId, 10)
      : null;
  const search = params.search || params.title || params.name || null;

  let lessons: LessonItem[] = [];
  let totalCount = 0;
  let categories: CategoryOption[] = [];

  try {
    const [lessonsRes, categoriesRes] = await Promise.allSettled([
      getLessons(page, pageSize, categoryId, null, search, search),
      getAllCategories(2), // 2 = Lesson categories
    ]);

    if (lessonsRes.status === "fulfilled" && lessonsRes.value) {
      const res = lessonsRes.value;
      if (res?.data?.items && Array.isArray(res.data.items)) {
        lessons = res.data.items;
        totalCount = res.data.totalCount;
      } else if (res?.data && Array.isArray(res.data)) {
        lessons = res.data;
        totalCount = res.data.length;
      }
    }

    if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
      categories = categoriesRes.value.map((c: any) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId ?? null,
      }));
    }
  } catch (error) {
    console.error("Error loading lessons page data:", error);
  }

  return (
    <div className="py-2">
      <LessonsTable
        initialLessons={lessons}
        initialTotalCount={totalCount}
        initialPage={page}
        initialPageSize={pageSize}
        initialCategoryId={categoryId ? String(categoryId) : "all"}
        initialSearch={search || ""}
        initialCategories={categories}
      />
    </div>
  );
}
