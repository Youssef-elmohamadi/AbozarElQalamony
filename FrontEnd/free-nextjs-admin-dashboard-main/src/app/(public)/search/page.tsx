import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublicLessons,
  getPublicSermons,
  getPublicBooks,
  getPublicArticles,
} from "@/api/public/content";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  return {
    title: query
      ? `نتائج البحث عن "${query}" | منصة الشيخ أبو ذر القلموني`
      : "البحث في المحتوى | منصة الشيخ أبو ذر القلموني",
    description: `نتائج البحث عن ${query} في خطب ودروس ومؤلفات فضيلة الشيخ أبي ذر القلموني.`,
    robots: {
      index: false, // Don't index search result pages to prevent duplicate content
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const [lessons, sermons, books, articles] = await Promise.all([
    query ? getPublicLessons({ search: query, pageSize: 12 }) : { items: [] },
    query ? getPublicSermons({ search: query, pageSize: 12 }) : { items: [] },
    query ? getPublicBooks({ search: query, pageSize: 8 }) : { items: [] },
    query ? getPublicArticles({ search: query, pageSize: 8 }) : { items: [] },
  ]);

  const totalResults =
    lessons.items.length +
    sermons.items.length +
    books.items.length +
    articles.items.length;

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= SEARCH HEADER ================= */}
        <div className="bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-8 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-black text-brand-950 font-serif">
            {query ? `نتائج البحث عن: «${query}»` : "البحث في المنصة"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {query
              ? `تم العثور على ${totalResults} مادة علمية مطابقة`
              : "يرجى كتابة كلمة البحث في الحقل أعلاه للبحث في الدروس والخطب والكتب"}
          </p>
        </div>

        {/* ================= RESULTS LISTING ================= */}
        {query && totalResults === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 p-8 text-gray-500 text-sm">
            لم يتم العثور على نتائج تطابق كلمة «{query}». جرب استخدام كلمات بحث
            أخرى أو تصفح الأقسام مباشرة.
          </div>
        ) : (
          <div className="space-y-10">
            {/* Lessons Results */}
            {lessons.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-brand-600 pr-3">
                  الدروس العلمية ({lessons.items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-brand-200 p-4 shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        {item.categoryName || "درس"}
                      </span>
                      <h3 className="text-sm font-extrabold text-brand-900 mt-2 mb-1">
                        {item.title}
                      </h3>
                      {item.audioFilePath && (
                        <a
                          href={item.audioFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-brand-600 hover:underline block mt-2"
                        >
                          استماع للمادة &larr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sermons Results */}
            {sermons.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-accent-600 pr-3">
                  خطب الجمعة ({sermons.items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sermons.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-brand-200 p-4 shadow-xs"
                    >
                      <span className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] px-2 py-0.5 rounded-md">
                        {item.categoryName || "خطبة"}
                      </span>
                      <h3 className="text-sm font-extrabold text-brand-900 mt-2 mb-1">
                        {item.title}
                      </h3>
                      {item.audioFilePath && (
                        <a
                          href={item.audioFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-accent-600 hover:underline block mt-2"
                        >
                          استماع للخطبة &larr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Books Results */}
            {books.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-brand-600 pr-3">
                  الكتب والمؤلفات ({books.items.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {books.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-brand-200 p-4 shadow-xs"
                    >
                      <h3 className="text-sm font-extrabold text-brand-900">
                        {item.title}
                      </h3>
                      {item.pdfFilePath && (
                        <a
                          href={item.pdfFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-brand-600 hover:underline block mt-3"
                        >
                          تحميل PDF &larr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Articles Results */}
            {articles.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-brand-600 pr-3">
                  المقالات ({articles.items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-brand-200 p-4 shadow-xs"
                    >
                      <h3 className="text-sm font-extrabold text-brand-900">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {item.summary}
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
