import React from "react";
import { Metadata } from "next";
import { getQurans, QuranItem } from "@/api/admin/quran";
import { getAllCategories } from "@/api/admin/categories";
import QuranTable, { CategoryOption } from "@/components/quran/QuranTable";

export const metadata: Metadata = {
  title: "القرآن الكريم والتلاوات | لوحة التحكم",
  description: "عرض والبحث وإدارة تسجيلات وتلاوات القرآن الكريم ومجالس التدبر",
};

interface QuranPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    categoryId?: string;
    search?: string;
    title?: string;
    name?: string;
    sort?: string;
  }>;
}

export default async function QuranPage({ searchParams }: QuranPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const categoryId =
    params.categoryId && params.categoryId !== "all"
      ? parseInt(params.categoryId, 10)
      : null;
  const search = params.search || params.title || params.name || null;
  const sort = params.sort || "latest";

  let qurans: QuranItem[] = [];
  let totalCount = 0;
  let categories: CategoryOption[] = [];

  try {
    const [quranRes, categoriesRes] = await Promise.allSettled([
      getQurans(page, pageSize, categoryId, null, search, search, sort),
      getAllCategories(4), // 4 = Quran categories
    ]);

    if (quranRes.status === "fulfilled" && quranRes.value) {
      const res = quranRes.value;
      if (res?.data?.items && Array.isArray(res.data.items)) {
        qurans = res.data.items;
        totalCount = res.data.totalCount;
      } else if (res?.data && Array.isArray(res.data)) {
        qurans = res.data;
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
    console.error("Error loading quran page data:", error);
  }

  return (
    <div className="py-2">
      <QuranTable
        initialQurans={qurans}
        initialTotalCount={totalCount}
        initialPage={page}
        initialPageSize={pageSize}
        initialCategoryId={categoryId ? String(categoryId) : "all"}
        initialSearch={search || ""}
        initialSort={sort}
        initialCategories={categories}
      />
    </div>
  );
}
