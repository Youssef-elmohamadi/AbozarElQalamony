import React from "react";
import type { Metadata } from "next";
import { getPublicCategories, Category } from "@/api/public/categories";
import { getPublicLessons, PublicLesson } from "@/api/public/content";
import MarhabanDiscClient from "./MarhabanDiscClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "اسطوانة مرحبا بالتائبين | فضيلة الشيخ أبو ذر القلموني",
  description:
    "اسطوانة مرحبا بالتائبين لفضيلة الشيخ أبي ذر القلموني - السلسلة الإيمانية والوعظية المؤثرة في التوبة والإنابة والفرار إلى الله تعالى. استماع وتحميل مجاني.",
  keywords: [
    "اسطوانة مرحبا بالتائبين",
    "الشيخ أبو ذر القلموني مرحبا بالتائبين",
    "توبة التائبين",
    "ففروا إلى الله",
    "رقائق الشيخ أبو ذر",
    "مواعظ التوبة",
  ],
  alternates: {
    canonical: "/marhaban-bi-al-taebeen",
  },
};

export default async function MarhabanBiAlTaebeenPage() {
  const CATEGORY_ID = 38;

  // 1. Fetch categories and subcategories
  const allCategories: Category[] = await getPublicCategories();
  const mainCategory = allCategories.find((c) => c.id === CATEGORY_ID) || {
    id: CATEGORY_ID,
    name: "مرحبا بالتائبين",
    type: 2,
    parentId: null,
  };

  // Get direct children of Category 38
  const childCategories = allCategories.filter((c) => c.parentId === CATEGORY_ID);

  // 2. Fetch lessons for category 38
  const lessonsRes = await getPublicLessons({
    categoryId: CATEGORY_ID,
    pageSize: 100,
  });

  const lessons: PublicLesson[] = lessonsRes.items || [];

  // 3. For each child category, fetch its sub-children and its lessons
  const childCategoriesWithData = await Promise.all(
    childCategories.map(async (child) => {
      // Find sub-children (grandchildren of 38)
      const subChildren = allCategories.filter((c) => c.parentId === child.id);

      // Fetch lessons for this child category
      const childLessonsRes = await getPublicLessons({
        categoryId: child.id,
        pageSize: 50,
      });

      return {
        ...child,
        subCategories: subChildren,
        lessons: childLessonsRes.items || [],
        lessonsCount: childLessonsRes.totalCount || (childLessonsRes.items?.length ?? 0),
      };
    })
  );

  return (
    <MarhabanDiscClient
      mainCategory={mainCategory}
      subCategories={childCategoriesWithData}
      lessons={lessons}
      totalCount={lessonsRes.totalCount || lessons.length}
    />
  );
}
