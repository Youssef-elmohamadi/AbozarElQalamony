import React from "react";
import type { Metadata } from "next";
import { getPublicCategories } from "@/api/public/categories";
import { getPublicQuran } from "@/api/public/content";
import QuranLibrary from "@/components/public/quran/QuranLibrary";

export const metadata: Metadata = {
  title: "مكتبة القرآن الكريم | فضيلة الشيخ أبو ذر القلموني",
  description:
    "استمع إلى مجالس تدبر القرآن العظيم وتفسير آياته وهداياته الإيمانية لفضيلة الشيخ أبي ذر القلموني حفظه الله.",
  alternates: {
    canonical: "/quran",
  },
};

interface QuranPageProps {
  searchParams?: Promise<{ sort?: string; categoryId?: string }>;
}

export default async function QuranPage({ searchParams }: QuranPageProps) {
  const params = (await searchParams) || {};
  const sort = params.sort === "oldest" ? "oldest" : "latest";
  const initialCategoryId = params.categoryId ? Number(params.categoryId) : undefined;

  // SSR fetch categories & initial Quran data from /api/quran
  const [allCategories, initialQuranData] = await Promise.all([
    getPublicCategories(),
    getPublicQuran({
      page: 1,
      pageSize: 12,
      sort,
      categoryId: initialCategoryId,
    }),
  ]);

  // Filter categories by type 4 (القرآن الكريم والتفسير)
  const quranCategories = allCategories.filter((c) => c.type === 4);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuranLibrary
          initialItems={initialQuranData.items}
          initialTotalCount={initialQuranData.totalCount}
          initialTotalPages={initialQuranData.totalPages}
          categories={quranCategories}
          initialSort={sort}
          initialCategoryId={initialCategoryId ?? null}
        />
      </div>
    </div>
  );
}

