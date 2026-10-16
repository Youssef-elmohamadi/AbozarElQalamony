import React from "react";
import { Metadata } from "next";
import { getCategories } from "@/api/admin/categories";
import CategoriesTable, {
  CategoryItem,
} from "@/components/categories/CategoriesTable";

export const metadata: Metadata = {
  title: "إدارة التصنيفات | لوحة التحكم",
  description: "إدارة وتصفح تصنيفات الكتب، الدروس، الخطب، والقرآن الكريم",
};

interface CategoriesPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    type?: string;
    name?: string;
  }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const type =
    params.type && params.type !== "all" ? parseInt(params.type, 10) : null;
  const name = params.name || null;

  let categories: CategoryItem[] = [];
  let totalCount = 0;

  try {
    const res = await getCategories(page, pageSize, type, name);
    if (res?.data?.items && Array.isArray(res.data.items)) {
      categories = res.data.items;
      totalCount = res.data.totalCount;
    } else if (res?.data && Array.isArray(res.data)) {
      categories = res.data;
      totalCount = res.data.length;
    }
  } catch (error) {
    console.error("Error loading categories page:", error);
  }

  return (
    <div className="py-2">
      <CategoriesTable
        initialCategories={categories}
        initialTotalCount={totalCount}
        initialPage={page}
        initialPageSize={pageSize}
        initialType={type ? String(type) : "all"}
        initialSearch={name || ""}
      />
    </div>
  );
}
