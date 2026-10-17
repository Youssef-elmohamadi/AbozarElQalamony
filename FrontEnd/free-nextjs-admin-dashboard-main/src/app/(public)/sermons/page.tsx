import React from "react";
import type { Metadata } from "next";
import { getPublicCategories } from "@/api/public/categories";
import { getPublicSermons } from "@/api/public/content";
import SermonsLibrary from "@/components/public/sermons/SermonsLibrary";

export const metadata: Metadata = {
  title: "مكتبة الخطب المنبرية | فضيلة الشيخ أبو ذر القلموني",
  description:
    "استمع وحمّل خطب الجمعة والمواسم الفاضلة ومواعظ التوبة والرقائق لفضيلة الشيخ أبي ذر القلموني حفظه الله.",
  alternates: {
    canonical: "/sermons",
  },
};

interface SermonsPageProps {
  searchParams?: Promise<{ sort?: string; categoryId?: string }>;
}

export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const params = (await searchParams) || {};
  const sort = params.sort === "oldest" ? "oldest" : "latest";
  const initialCategoryId = params.categoryId ? Number(params.categoryId) : undefined;

  const [allCategories, initialSermonsData] = await Promise.all([
    getPublicCategories(),
    getPublicSermons({ page: 1, pageSize: 12, sort, categoryId: initialCategoryId }),
  ]);

  // Filter categories by type 3 (خطب ومواعظ)
  const sermonCategories = allCategories.filter((c) => c.type === 3);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SermonsLibrary
          initialSermons={initialSermonsData.items}
          initialTotalCount={initialSermonsData.totalCount}
          initialTotalPages={initialSermonsData.totalPages}
          categories={sermonCategories}
          initialSort={sort}
          initialCategoryId={initialCategoryId ?? null}
        />
      </div>
    </div>
  );
}
