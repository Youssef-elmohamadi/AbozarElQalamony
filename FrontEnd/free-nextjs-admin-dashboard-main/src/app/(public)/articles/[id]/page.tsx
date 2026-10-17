import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicArticleById, getPublicArticles } from "@/api/public/content";
import ArticleDetailView from "@/components/public/articles/ArticleDetailView";

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getPublicArticleById(id);

  if (!article) {
    return {
      title: "المقال غير موجود | فضيلة الشيخ أبو ذر القلموني",
    };
  }

  const excerpt =
    article.description ||
    article.summary ||
    (article.body ? article.body.replace(/<[^>]*>?/gm, "").trim().slice(0, 150) : "") ||
    `قراءة مقال "${article.title}" لفضيلة الشيخ أبي ذر القلموني حفظه الله.`;

  return {
    title: `${article.title} | مكتبة المقالات | فضيلة الشيخ أبو ذر القلموني`,
    description: excerpt,
    alternates: {
      canonical: `/articles/${article.id}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = await params;
  const article = await getPublicArticleById(id);

  if (!article) {
    notFound();
  }

  // Fetch other articles for sidebar
  const relatedResponse = await getPublicArticles({
    page: 1,
    pageSize: 8,
  });

  const allRelated = (relatedResponse.items || []).filter(
    (a) => a.id !== article.id
  );

  const prevArticle = allRelated.length > 0 ? allRelated[0] : null;
  const nextArticle = allRelated.length > 1 ? allRelated[1] : null;

  return (
    <ArticleDetailView
      article={article}
      relatedArticles={allRelated}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
    />
  );
}
