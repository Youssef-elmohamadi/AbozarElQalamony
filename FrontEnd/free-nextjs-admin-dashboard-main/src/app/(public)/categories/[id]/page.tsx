import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCategories } from "@/api/public/categories";
import {
  getPublicLessons,
  getPublicSermons,
  getPublicBooks,
  getPublicArticles,
} from "@/api/public/content";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sort?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const categories = await getPublicCategories();
  const category = categories.find((c) => String(c.id) === id);

  if (!category) {
    return {
      title: "التصنيف | الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني",
    };
  }

  return {
    title: `${category.name} | الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني`,
    description: `تصفح كافة الدروس والخطب والكتب والمقالات المتعلقة بتصنيف ${category.name} لفضيلة الشيخ أبي ذر القلموني.`,
    alternates: {
      canonical: `/categories/${id}`,
    },
    openGraph: {
      title: `${category.name} | منصة الشيخ أبو ذر القلموني`,
      description: `تصفح المواد العلمية والدعوية في قسم ${category.name}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { id } = await params;
  const sParams = (await searchParams) || {};
  const sort = sParams.sort === "oldest" ? "oldest" : "latest";
  const numId = Number(id);

  const categories = await getPublicCategories();
  const category = categories.find((c) => String(c.id) === id);

  if (!category) {
    notFound();
  }

  // Fetch all content for this category in parallel with sort
  const [lessons, sermons, books, articles] = await Promise.all([
    getPublicLessons({ categoryId: numId, pageSize: 30, sort }),
    getPublicSermons({ categoryId: numId, pageSize: 30, sort }),
    getPublicBooks({ categoryId: numId, pageSize: 30, sort }),
    getPublicArticles({ categoryId: numId, pageSize: 30, sort }),
  ]);

  const totalItems =
    lessons.items.length +
    sermons.items.length +
    books.items.length +
    articles.items.length;

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= BREADCRUMBS & HEADER ================= */}
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
            <Link href="/" className="hover:text-brand-600">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-gray-400">الأقسام</span>
            <span>/</span>
            <span className="text-brand-700">{category.name}</span>
          </nav>

          <div className="rounded-3xl bg-gradient-to-r from-[#3F4A2B] to-[#202615] text-white p-6 sm:p-10 shadow-lg border border-[#6F8354]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DFE5D7]">
                تصنيف المحتوى
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-serif">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#DFE5D7]/80">
                إجمالي المواد المتاحة: {totalItems} مادة دعوية وعلمية
              </p>
            </div>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              &rarr; تصفح كل الأقسام
            </Link>
          </div>
        </div>

        {/* ================= SORT BAR ================= */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-brand-200/80 p-3.5 px-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
              <svg className="w-4 h-4 text-[#3F4A2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>ترتيب المواد:</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/categories/${id}?sort=latest`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  sort === "latest"
                    ? "bg-[#3F4A2B] text-white shadow-xs"
                    : "bg-[#EEF0E6] text-brand-900 hover:bg-[#E2E6D8]"
                }`}
              >
                الأحدث أولاً
              </Link>
              <Link
                href={`/categories/${id}?sort=oldest`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  sort === "oldest"
                    ? "bg-[#3F4A2B] text-white shadow-xs"
                    : "bg-[#EEF0E6] text-brand-900 hover:bg-[#E2E6D8]"
                }`}
              >
                الأقدم أولاً
              </Link>
            </div>
          </div>
        )}

        {/* ================= CONTENT GRIDS ================= */}
        {totalItems === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-brand-100 p-8 text-gray-500 text-sm">
            لا توجد مواد منشورة حالياً في هذا القسم. سيتم إضافة المزيد قريباً إن
            شاء الله.
          </div>
        ) : (
          <div className="space-y-12">
            {/* Lessons */}
            {lessons.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-brand-950 flex items-center gap-2 border-b border-brand-200 pb-2">
                  <span className="w-2 h-5 rounded-full bg-[#3F4A2B]" />
                  <span>الدروس العلمية في هذا القسم ({lessons.items.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.items.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-2xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-extrabold text-brand-900 mb-1">
                          <Link href={`/lessons/${lesson.id}`} className="hover:text-brand-600 transition-colors">
                            {lesson.title}
                          </Link>
                        </h3>
                        {lesson.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {lesson.durationInMinutes || 45} دقيقة
                        </span>
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="font-bold text-[#3F4A2B] hover:text-[#C0673F] flex items-center gap-1"
                        >
                          <span>استماع وتفاصيل</span>
                          <span>&larr;</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sermons */}
            {sermons.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-brand-950 flex items-center gap-2 border-b border-brand-200 pb-2">
                  <span className="w-2 h-5 rounded-full bg-[#C0673F]" />
                  <span>الخطب المنبرية ({sermons.items.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sermons.items.map((sermon) => (
                    <div
                      key={sermon.id}
                      className="bg-white rounded-2xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-extrabold text-brand-900 mb-1">
                          {sermon.title}
                        </h3>
                        {sermon.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {sermon.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400">خطبة جمعة</span>
                        {sermon.audioFilePath && (
                          <a
                            href={sermon.audioFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#C0673F] hover:text-[#864024]"
                          >
                            استماع للخطبة &larr;
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Books */}
            {books.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-brand-950 flex items-center gap-2 border-b border-brand-200 pb-2">
                  <span className="w-2 h-5 rounded-full bg-[#3F4A2B]" />
                  <span>الكتب والمؤلفات ({books.items.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.items.map((book) => (
                    <div
                      key={book.id}
                      className="bg-white rounded-2xl border border-brand-200 p-4 shadow-xs"
                    >
                      <h3 className="text-sm font-extrabold text-brand-900 mb-2">
                        {book.title}
                      </h3>
                      {book.pdfFilePath && (
                        <a
                          href={book.pdfFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#3F4A2B] hover:underline"
                        >
                          تحميل نسخة PDF &larr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Articles */}
            {articles.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-brand-950 flex items-center gap-2 border-b border-brand-200 pb-2">
                  <span className="w-2 h-5 rounded-full bg-[#3F4A2B]" />
                  <span>المقالات ({articles.items.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.items.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white rounded-2xl border border-brand-200 p-5 shadow-xs"
                    >
                      <h3 className="text-sm font-extrabold text-brand-900 mb-1">
                        {art.title}
                      </h3>
                      {art.summary && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {art.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
