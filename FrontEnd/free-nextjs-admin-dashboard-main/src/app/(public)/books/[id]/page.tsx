import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBookById, getPublicBooks } from "@/api/public/content";
import BookDetailView from "@/components/public/books/BookDetailView";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getPublicBookById(id);

  if (!book) {
    return {
      title: "الكتاب غير موجود | فضيلة الشيخ أبو ذر القلموني",
    };
  }

  return {
    title: `${book.title} | مكتبة الكتب | فضيلة الشيخ أبو ذر القلموني`,
    description:
      book.description ||
      `تحميل وقراءة كتاب "${book.title}" لفضيلة الشيخ أبي ذر القلموني حفظه الله.`,
    alternates: {
      canonical: `/books/${book.id}`,
    },
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  const book = await getPublicBookById(id);

  if (!book) {
    notFound();
  }

  // Fetch related books from the same category or general list
  const relatedResponse = await getPublicBooks({
    page: 1,
    pageSize: 6,
    categoryId: book.categoryId,
  });

  const relatedBooks = (relatedResponse.items || []).filter(
    (b) => b.id !== book.id
  );

  return (
    <BookDetailView
      book={book}
      relatedBooks={relatedBooks}
    />
  );
}
