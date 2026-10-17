import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicSermonById, getPublicSermons } from "@/api/public/content";
import SermonDetailView from "@/components/public/sermons/SermonDetailView";

interface SermonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SermonPageProps): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getPublicSermonById(id);

  if (!sermon) {
    return {
      title: "الخطبة غير موجودة | منصة الشيخ أبو ذر القلموني",
    };
  }

  const cleanDesc = sermon.description
    ? sermon.description.replace(/<[^>]*>?/gm, "").trim().slice(0, 160)
    : `استمع إلى ${sermon.title} لفضيلة الشيخ أبي ذر القلموني حفظه الله.`;

  return {
    title: `${sermon.title} | فضيلة الشيخ أبو ذر القلموني`,
    description: cleanDesc,
    alternates: {
      canonical: `/sermons/${id}`,
    },
    openGraph: {
      title: sermon.title,
      description: cleanDesc,
      type: "music.song",
    },
  };
}

export default async function SingleSermonPage({ params }: SermonPageProps) {
  const { id } = await params;
  const sermon = await getPublicSermonById(id);

  if (!sermon) {
    notFound();
  }

  // Fetch sermons from same category
  const relatedResult = await getPublicSermons({
    categoryId: sermon.categoryId,
    pageSize: 15,
  });

  const categorySermons = relatedResult.items || [];
  const currentIndex = categorySermons.findIndex((s) => s.id === sermon.id);

  const prevSermon = currentIndex > 0 ? categorySermons[currentIndex - 1] : null;
  const nextSermon =
    currentIndex >= 0 && currentIndex < categorySermons.length - 1
      ? categorySermons[currentIndex + 1]
      : null;

  const sidebarSermons = categorySermons.filter((s) => s.id !== sermon.id).slice(0, 6);

  return (
    <SermonDetailView
      sermon={sermon}
      relatedSermons={sidebarSermons}
      prevSermon={prevSermon}
      nextSermon={nextSermon}
    />
  );
}
