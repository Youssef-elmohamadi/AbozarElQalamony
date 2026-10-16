import React from "react";
import { Metadata } from "next";
import { getSermons, SermonItem } from "@/api/admin/sermons";
import { getAllCategories } from "@/api/admin/categories";
import SermonsTable, { CategoryOption } from "@/components/sermons/SermonsTable";

export const metadata: Metadata = {
  title: "إدارة الخطب | لوحة التحكم",
  description: "عرض والبحث وإدارة خطب الجمعة والمحاضرات المنبرية وتصنيفاتها",
};

interface SermonsPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    categoryId?: string;
    search?: string;
    title?: string;
    name?: string;
  }>;
}

export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const categoryId =
    params.categoryId && params.categoryId !== "all"
      ? parseInt(params.categoryId, 10)
      : null;
  const search = params.search || params.title || params.name || null;

  let sermons: SermonItem[] = [];
  let totalCount = 0;
  let categories: CategoryOption[] = [];

  try {
    const [sermonsRes, categoriesRes] = await Promise.allSettled([
      getSermons(page, pageSize, categoryId, null, search, search),
      getAllCategories(3), // 3 = Sermon categories
    ]);

    if (sermonsRes.status === "fulfilled" && sermonsRes.value) {
      const res = sermonsRes.value;
      if (res?.data?.items && Array.isArray(res.data.items)) {
        sermons = res.data.items;
        totalCount = res.data.totalCount;
      } else if (res?.data && Array.isArray(res.data)) {
        sermons = res.data;
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
    console.error("Error loading sermons page data:", error);
  }

  return (
    <div className="py-2">
      <SermonsTable
        initialSermons={sermons}
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
