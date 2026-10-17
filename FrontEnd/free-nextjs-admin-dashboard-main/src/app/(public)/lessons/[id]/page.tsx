import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLessonById, getPublicLessons } from "@/api/public/content";
import LessonDetailView from "@/components/public/lessons/LessonDetailView";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getPublicLessonById(id);

  if (!lesson) {
    return {
      title: "الدرس غير موجود | منصة الشيخ أبو ذر القلموني",
    };
  }

  const cleanDesc = lesson.description
    ? lesson.description.replace(/<[^>]*>?/gm, "").trim().slice(0, 160)
    : `استمع إلى ${lesson.title} لفضيلة الشيخ أبي ذر القلموني حفظه الله.`;

  return {
    title: `${lesson.title} | فضيلة الشيخ أبو ذر القلموني`,
    description: cleanDesc,
    alternates: {
      canonical: `/lessons/${id}`,
    },
    openGraph: {
      title: lesson.title,
      description: cleanDesc,
      type: "music.song",
    },
  };
}

export default async function SingleLessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = await getPublicLessonById(id);

  if (!lesson) {
    notFound();
  }

  // Fetch lessons from same category to show in sidebar & calculate prev/next
  const relatedResult = await getPublicLessons({
    categoryId: lesson.categoryId,
    pageSize: 15,
  });

  const categoryLessons = relatedResult.items || [];
  const currentIndex = categoryLessons.findIndex((l) => l.id === lesson.id);

  // Prev / Next based on list order
  const prevLesson = currentIndex > 0 ? categoryLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < categoryLessons.length - 1
      ? categoryLessons[currentIndex + 1]
      : null;

  // Filter out current lesson from sidebar list
  const sidebarLessons = categoryLessons.filter((l) => l.id !== lesson.id).slice(0, 6);

  return (
    <LessonDetailView
      lesson={lesson}
      relatedLessons={sidebarLessons}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
