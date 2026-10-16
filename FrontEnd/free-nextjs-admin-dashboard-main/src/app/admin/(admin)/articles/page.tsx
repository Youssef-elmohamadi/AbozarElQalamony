import React from "react";
import { Metadata } from "next";
import { getArticles } from "@/api/admin/articles";
import { ArticleItem } from "@/types/article";
import ArticlesTable from "@/components/articles/ArticlesTable";

export const metadata: Metadata = {
  title: "إدارة المقالات | لوحة التحكم",
  description: "عرض والبحث وإدارة مقالات ومؤلفات الشيخ أبو ذر",
};

interface ArticlesPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    title?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) || {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const search = params.search || params.title || null;

  let articles: ArticleItem[] = [];
  let totalCount = 0;

  try {
    const res = await getArticles(page, pageSize, search);
    if (res?.data?.items && Array.isArray(res.data.items)) {
      articles = res.data.items;
      totalCount = res.data.totalCount;
    } else if (res?.data && Array.isArray(res.data)) {
      articles = res.data;
      totalCount = res.data.length;
    }
  } catch (error) {
    console.error("Error loading articles page data:", error);
  }

  return (
    <div className="py-2">
      <ArticlesTable
        initialArticles={articles}
        initialTotalCount={totalCount}
        initialPage={page}
        initialPageSize={pageSize}
        initialSearch={search || ""}
      />
    </div>
  );
}
