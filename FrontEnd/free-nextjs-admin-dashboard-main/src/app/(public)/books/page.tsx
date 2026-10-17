import React from "react";
import type { Metadata } from "next";
import { getPublicCategories } from "@/api/public/categories";
import { getPublicBooks } from "@/api/public/content";
import BooksLibrary from "@/components/public/books/BooksLibrary";

export const metadata: Metadata = {
  title: "مكتبة الكتب والمؤلفات | فضيلة الشيخ أبو ذر القلموني",
  description:
    "تصفح وحمّل مؤلفات وكتب ورسائل فضيلة الشيخ أبي ذر القلموني حفظه الله في التزكية والرقائق والهمة العالية والفقه بصيغة PDF.",
  alternates: {
    canonical: "/books",
  },
};

interface BooksPageProps {
  searchParams?: Promise<{ sort?: string; categoryId?: string }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = (await searchParams) || {};
  const sort = params.sort === "oldest" ? "oldest" : "latest";
  const initialCategoryId = params.categoryId ? Number(params.categoryId) : undefined;

  const [allCategories, initialBooksData] = await Promise.all([
    getPublicCategories(),
    getPublicBooks({ page: 1, pageSize: 12, sort, categoryId: initialCategoryId }),
  ]);

  // Filter categories by type 1 (كتب ومؤلفات)
  const bookCategories = allCategories.filter((c) => c.type === 1);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BooksLibrary
          initialBooks={initialBooksData.items}
          initialTotalCount={initialBooksData.totalCount}
          initialTotalPages={initialBooksData.totalPages}
          categories={bookCategories}
          initialSort={sort}
          initialCategoryId={initialCategoryId ?? null}
        />
      </div>
    </div>
  );
}
