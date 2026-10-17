import React from "react";
import type { Metadata } from "next";
import { getPublicCategories } from "@/api/public/categories";
import { getPublicLessons } from "@/api/public/content";
import LessonsLibrary from "@/components/public/lessons/LessonsLibrary";

interface LessonsPageProps {
  searchParams?: Promise<{ sort?: string; categoryId?: string }>;
}

export async function generateMetadata({
  searchParams,
}: LessonsPageProps): Promise<Metadata> {
  const params = (await searchParams) || {};
  const catId = params.categoryId ? Number(params.categoryId) : undefined;

  // جلب التصنيفات (مخزنة في كاش Next.js تلقائياً)
  const categories = await getPublicCategories();
  const lessonCategories = categories.filter((c) => c.type === 2);

  let pageTitle = "مكتبة الدروس العلمية";
  let pageDesc = "";

  if (catId) {
    // 1. في حال اختيار تصنيف محدد
    const matchedCategory = lessonCategories.find((c) => c.id === catId);
    if (matchedCategory) {
      pageTitle = `دروس ${matchedCategory.name}`;
      pageDesc = `استمع وتصفح دروس ${matchedCategory.name} لفضيلة الشيخ أبي ذر القلموني حفظه الله. استماع مباشر وتحميل بجودة عالية.`;
    } else {
      pageDesc = "استمع وحمّل الدروس العلمية والسلاسل الإيمانية لفضيلة الشيخ أبي ذر القلموني حفظه الله.";
    }
  } else {
    // 2. في الصفحة العامة: دمج أسماء تصنيفات وسلاسل الدروس في الوصف لتعزيز الـ SEO
    const categoryNames = lessonCategories.map((c) => c.name).slice(0, 5).join("، ");
    pageDesc = categoryNames
      ? `تصفح واستمع إلى مكتبة الدروس العلمية لفضيلة الشيخ أبي ذر القلموني حفظه الله، وتضم سلاسل: (${categoryNames}) وغيرها الكثير بجودة عالية.`
      : "تصفح واستمع إلى مكتبة الدروس العلمية والسلاسل الإيمانية لفضيلة الشيخ أبي ذر القلموني حفظه الله.";
  }

  const canonicalUrl = catId ? `/lessons?categoryId=${catId}` : "/lessons";

  return {
    title: `${pageTitle} | فضيلة الشيخ أبو ذر القلموني`,
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageTitle} | فضيلة الشيخ أبو ذر القلموني`,
      description: pageDesc,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const params = (await searchParams) || {};
  const sort = params.sort === "oldest" ? "oldest" : "latest";
  const initialCategoryId = params.categoryId ? Number(params.categoryId) : undefined;

  // Next.js يشارك الكاش تلقائياً لـ getPublicCategories بين generateMetadata والصفحة
  const [allCategories, initialLessonsData] = await Promise.all([
    getPublicCategories(),
    getPublicLessons({ page: 1, pageSize: 12, sort, categoryId: initialCategoryId }),
  ]);

  // Filter categories by type 2 (الدروس العلمية)
  const lessonCategories = allCategories.filter((c) => c.type === 2);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LessonsLibrary
          initialLessons={initialLessonsData.items}
          initialTotalCount={initialLessonsData.totalCount}
          initialTotalPages={initialLessonsData.totalPages}
          categories={lessonCategories}
          initialSort={sort}
          initialCategoryId={initialCategoryId ?? null}
        />
      </div>
    </div>
  );
}
