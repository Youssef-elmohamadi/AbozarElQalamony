import React from "react";
import type { Metadata } from "next";
import { getPublicArticles } from "@/api/public/content";
import ArticlesLibrary from "@/components/public/articles/ArticlesLibrary";

export const metadata: Metadata = {
  title: "مكتبة المقالات والرسائل الدعوية | فضيلة الشيخ أبو ذر القلموني",
  description:
    "تصفح واقرأ مقالات وبحوث ورسائل فضيلة الشيخ أبي ذر القلموني حفظه الله في التزكية والرقائق والعقيدة والتربية الإيمانية ومفاهيم السلوك.",
  alternates: {
    canonical: "/articles",
  },
};

interface ArticlesPageProps {
  searchParams?: Promise<{ sort?: string; search?: string; q?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) || {};
  const sort = params.sort === "oldest" ? "oldest" : "latest";
  const search = params.search || params.q || "";

  const initialArticlesData = await getPublicArticles({ page: 1, pageSize: 12, sort, search });

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArticlesLibrary
          initialArticles={initialArticlesData.items}
          initialTotalCount={initialArticlesData.totalCount}
          initialTotalPages={initialArticlesData.totalPages}
          initialSort={sort}
          initialSearch={search}
        />
      </div>
    </div>
  );
}
