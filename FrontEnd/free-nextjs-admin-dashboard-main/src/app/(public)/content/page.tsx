import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicCategories } from "@/api/public/categories";
import {
  getPublicLessons,
  getPublicSermons,
  getPublicBooks,
  getPublicArticles,
} from "@/api/public/content";
import ContentFilter from "@/components/public/filter/ContentFilter";

interface ContentPageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    q?: string;
    page?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ContentPageProps): Promise<Metadata> {
  const { type } = await searchParams;

  const titles: Record<string, string> = {
    lessons: "الدروس العلمية والسلاسل",
    sermons: "خطب الجمعة المنبرية",
    books: "الكتب والمؤلفات",
    articles: "المقالات والرسائل الدعوية",
    quran: "مجالس تدبر القرآن الكريم والتفسير",
    all: "كافة المواد والمحتوى العلمي",
  };

  const pageTitle = titles[type || "all"] || "مكتبة المحتوى الدعوي";

  return {
    title: `${pageTitle} | منصة الشيخ أبو ذر القلموني`,
    description: `استمع وتصفح ${pageTitle} لفضيلة الشيخ أبي ذر القلموني حفظه الله. تحميل واستماع مباشر بجودة عالية.`,
    alternates: {
      canonical: `/content?type=${type || "all"}`,
    },
  };
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return null;
  }
};

const sortItems = <T extends Record<string, any>>(
  items: T[],
  sort: "latest" | "oldest"
): T[] => {
  const isOldest = sort === "oldest";
  return [...items].sort((a, b) => {
    const timeA = new Date(
      a.publishDate || a.khutbahDate || a.deliveryDate || a.createdAt || 0
    ).getTime();
    const timeB = new Date(
      b.publishDate || b.khutbahDate || b.deliveryDate || b.createdAt || 0
    ).getTime();
    return isOldest ? timeA - timeB : timeB - timeA;
  });
};

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  const activeType = params.type || "lessons";
  const categoryId = params.category ? Number(params.category) : undefined;
  const searchQuery = params.q || "";
  const page = Number(params.page || 1);
  const activeSort = params.sort === "oldest" ? "oldest" : "latest";

  const categories = await getPublicCategories();

  // If type is Quran, categories of type 4
  const quranCategoryIds = categories
    .filter((c) => c.type === 4)
    .map((c) => c.id);

  // Fetch relevant content based on type
  const [lessonsData, sermonsData, booksData, articlesData] = await Promise.all([
    activeType === "lessons" || activeType === "all"
      ? getPublicLessons({
          page,
          pageSize: 12,
          categoryId,
          search: searchQuery,
          sort: activeSort,
        })
      : activeType === "quran"
      ? (async () => {
          if (categoryId) {
            return getPublicLessons({
              page,
              pageSize: 12,
              categoryId,
              search: searchQuery,
              sort: activeSort,
            });
          }
          if (quranCategoryIds.length === 1) {
            return getPublicLessons({
              page,
              pageSize: 12,
              categoryId: quranCategoryIds[0],
              search: searchQuery,
              sort: activeSort,
            });
          }
          if (quranCategoryIds.length > 1) {
            const results = await Promise.all(
              quranCategoryIds.map((cId) =>
                getPublicLessons({
                  page: 1,
                  pageSize: 24,
                  categoryId: cId,
                  search: searchQuery,
                  sort: activeSort,
                })
              )
            );
            const allItems = Array.from(
              new Map(
                results.flatMap((r) => r.items).map((i) => [i.id, i])
              ).values()
            );
            return {
              items: allItems,
              totalCount: allItems.length,
              pageNumber: 1,
              pageSize: allItems.length,
              totalPages: 1,
            };
          }
          return { items: [], totalCount: 0, totalPages: 1, pageNumber: 1, pageSize: 12 };
        })()
      : { items: [], totalCount: 0, totalPages: 1, pageNumber: 1, pageSize: 12 },
    activeType === "sermons" || activeType === "all"
      ? getPublicSermons({
          page,
          pageSize: 12,
          categoryId,
          search: searchQuery,
          sort: activeSort,
        })
      : { items: [], totalCount: 0, totalPages: 1, pageNumber: 1, pageSize: 12 },
    activeType === "books" || activeType === "all"
      ? getPublicBooks({
          page,
          pageSize: 12,
          categoryId,
          search: searchQuery,
          sort: activeSort,
        })
      : { items: [], totalCount: 0, totalPages: 1, pageNumber: 1, pageSize: 12 },
    activeType === "articles" || activeType === "all"
      ? getPublicArticles({
          page,
          pageSize: 12,
          categoryId,
          search: searchQuery,
          sort: activeSort,
        })
      : { items: [], totalCount: 0, totalPages: 1, pageNumber: 1, pageSize: 12 },
  ]);

  const sortedLessons = sortItems(lessonsData.items, activeSort);
  const sortedSermons = sortItems(sermonsData.items, activeSort);
  const sortedBooks = sortItems(booksData.items, activeSort);
  const sortedArticles = sortItems(articlesData.items, activeSort);

  const SECTION_TITLES: Record<
    string,
    { title: string; subtitle: string; color: string }
  > = {
    lessons: {
      title: "الدروس العلمية والسلاسل",
      subtitle:
        "دروس الإيمان، التزكية، الفقه، السيرة النبوية، ومقامات السائرين إلى الله",
      color: "#3F4A2B",
    },
    sermons: {
      title: "خطب الجمعة والمواسم",
      subtitle:
        "خطب منبرية مؤثرة في الرقائق، التوبة، مواسم الطاعات، والدار الآخرة",
      color: "#C0673F",
    },
    books: {
      title: "مؤلفات وكتب فضيلة الشيخ",
      subtitle:
        "كتب ورسائل علمية وتربوية متاحة للقراءة والتحميل مجاناً لوجه الله",
      color: "#3F4A2B",
    },
    articles: {
      title: "المقالات والرسائل الدعوية",
      subtitle: "مقالات فكرية وتزكوية، وتوجيهات قلبية للشباب والأسرة المسلمة",
      color: "#3F4A2B",
    },
    quran: {
      title: "مجالس تدبر القرآن الكريم",
      subtitle:
        "سلاسل تفسير وتدبر آيات القرآن العظيم، وأسرار سورة الكهف وجزء عم",
      color: "#3F4A2B",
    },
    all: {
      title: "مكتبة المحتوى الشاملة",
      subtitle: "تصفح كافة الدروس والخطب والكتب والمقالات المنشورة على المنصة",
      color: "#3F4A2B",
    },
  };

  const currentMeta = SECTION_TITLES[activeType] || SECTION_TITLES.lessons;

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= PAGE HEADER ================= */}
        <div className="rounded-3xl bg-gradient-to-r from-[#29351C] to-[#1E2118] text-white p-6 sm:p-10 shadow-lg border border-[#6F8354]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DFE5D7]">
              مكتبة المواد الصوتية والمقروءة
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold font-ruqaa text-white">
              {currentMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#DFE5D7]/85 max-w-2xl leading-relaxed">
              {currentMeta.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-xs text-[#DEA587] font-semibold bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
              « ففروا إلى الله »
            </div>
            <div className="text-[11px] text-[#DFE5D7]/75 font-medium bg-black/20 px-3 py-1 rounded-xl">
              الترتيب:{" "}
              <span className="text-white font-bold">
                {activeSort === "oldest" ? "الأقدم أولاً" : "الأحدث أولاً"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}
        <section aria-label="شريط تصفية المحتوى">
          <ContentFilter
            categories={categories}
            initialType={activeType}
            initialCategory={params.category || ""}
            initialSearch={searchQuery}
            initialSort={activeSort}
          />
        </section>

        {/* ================= CONTENT LISTINGS ================= */}
        <div className="space-y-12">
          {/* Lessons & Quran */}
          {(activeType === "lessons" ||
            activeType === "quran" ||
            activeType === "all") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-brand-600 pr-3 flex items-center gap-2">
                  <span>
                    {activeType === "quran"
                      ? "مجالس تدبر القرآن وتفسيره"
                      : "الدروس العلمية"}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100/80 text-brand-800">
                    {sortedLessons.length}
                  </span>
                </h2>
                <span className="text-xs text-brand-700/80 font-medium hidden sm:inline">
                  {activeSort === "oldest" ? "الأقدم أولاً" : "الأحدث أولاً"}
                </span>
              </div>

              {sortedLessons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-brand-100 p-8 text-gray-500 text-sm">
                  لا توجد دروس متطابقة مع هذا القسم حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedLessons.map((lesson) => {
                    const formattedDate = formatDate(
                      lesson.publishDate || lesson.createdAt
                    );
                    return (
                      <article
                        key={lesson.id}
                        className="group bg-white rounded-2xl border border-brand-200/80 p-5 shadow-xs hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            {lesson.categoryName && (
                              <span className="inline-block px-2.5 py-1 rounded-md bg-[#EEF0E6] text-brand-800 text-[11px] font-bold">
                                {lesson.categoryName}
                              </span>
                            )}
                            {formattedDate && (
                              <span className="text-[11px] text-gray-400 font-medium">
                                {formattedDate}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-extrabold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                            <Link href={`/lessons/${lesson.id}`} className="hover:text-brand-700 transition-colors">
                              {lesson.title}
                            </Link>
                          </h3>
                          {lesson.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-brand-100 flex items-center justify-between text-xs text-brand-800">
                          <span className="text-gray-400">
                            {lesson.durationInMinutes || 45} دقيقة
                          </span>
                          <Link
                            href={`/lessons/${lesson.id}`}
                            className="font-bold text-[#3F4A2B] hover:text-[#C0673F] flex items-center gap-1 cursor-pointer"
                          >
                            <span>استماع وتفاصيل</span>
                            <svg
                              className="w-3.5 h-3.5 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Sermons */}
          {(activeType === "sermons" || activeType === "all") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-accent-600 pr-3 flex items-center gap-2">
                  <span>خطب الجمعة والمواسم</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-100/80 text-accent-800">
                    {sortedSermons.length}
                  </span>
                </h2>
                <span className="text-xs text-accent-700/80 font-medium hidden sm:inline">
                  {activeSort === "oldest" ? "الأقدم أولاً" : "الأحدث أولاً"}
                </span>
              </div>

              {sortedSermons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-brand-100 p-8 text-gray-500 text-sm">
                  لا توجد خطب متطابقة مع هذا القسم حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedSermons.map((sermon) => {
                    const formattedDate = formatDate(
                      sermon.deliveryDate || sermon.publishDate || sermon.createdAt
                    );
                    return (
                      <article
                        key={sermon.id}
                        className="group bg-white rounded-2xl border border-brand-200/80 p-5 shadow-xs hover:border-accent-500 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            {sermon.categoryName && (
                              <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF3EF] text-[#864024] text-[11px] font-bold border border-[#F5E3D8]">
                                {sermon.categoryName}
                              </span>
                            )}
                            {formattedDate && (
                              <span className="text-[11px] text-gray-400 font-medium">
                                {formattedDate}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-extrabold text-brand-900 group-hover:text-accent-600 transition-colors line-clamp-2 leading-snug">
                            {sermon.title}
                          </h3>
                          {sermon.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {sermon.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-brand-100 flex items-center justify-between text-xs text-brand-800">
                          <span className="text-gray-400">خطبة منبرية</span>
                          {sermon.audioFilePath && (
                            <a
                              href={sermon.audioFilePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#C0673F] hover:text-[#864024] flex items-center gap-1 cursor-pointer"
                            >
                              <span>استماع للخطبة</span>
                              <svg
                                className="w-3.5 h-3.5 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Books */}
          {(activeType === "books" || activeType === "all") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-brand-600 pr-3 flex items-center gap-2">
                  <span>الكتب والمؤلفات</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100/80 text-brand-800">
                    {sortedBooks.length}
                  </span>
                </h2>
                <span className="text-xs text-brand-700/80 font-medium hidden sm:inline">
                  {activeSort === "oldest" ? "الأقدم أولاً" : "الأحدث أولاً"}
                </span>
              </div>

              {sortedBooks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-brand-100 p-8 text-gray-500 text-sm">
                  لا توجد كتب متطابقة حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {sortedBooks.map((book) => {
                    const formattedDate = formatDate(
                      book.publishDate || book.createdAt
                    );
                    return (
                      <article
                        key={book.id}
                        className="relative group bg-white rounded-2xl border border-brand-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <Link
                            href={`/books/${book.id}`}
                            className="block w-full h-44 rounded-xl bg-[#EAE8E1] border border-brand-100 flex items-center justify-center text-brand-600 overflow-hidden relative"
                          >
                            {book.coverImagePath ? (
                              <>
                                <div
                                  className="absolute inset-0 bg-cover bg-center filter blur-md opacity-35 scale-110 pointer-events-none"
                                  style={{ backgroundImage: `url(${book.coverImagePath})` }}
                                />
                                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                <div className="relative w-full h-full p-2 flex items-center justify-center">
                                  <Image
                                    src={book.coverImagePath}
                                    alt={book.title}
                                    fill
                                    unoptimized
                                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              </>
                            ) : (
                              <svg
                                className="w-12 h-12 text-brand-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            )}
                          </Link>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                            <span>
                              {book.pagesCount
                                ? `${book.pagesCount} صفحة`
                                : "كتاب إلكتروني"}
                            </span>
                            {formattedDate && <span>{formattedDate}</span>}
                          </div>
                          <h3 className="text-sm font-extrabold text-brand-900 group-hover:text-[#C0673F] transition-colors line-clamp-2">
                            <Link
                              href={`/books/${book.id}`}
                              className="hover:underline"
                            >
                              {book.title}
                            </Link>
                          </h3>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs relative z-10">
                          <span className="text-gray-400">
                            {book.author || "فضيلة الشيخ"}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/books/${book.id}`}
                              className="text-xs font-bold text-[#3F4A2B] hover:text-[#2A331D] flex items-center gap-1 transition-colors"
                            >
                              <span>تفاصيل وقراءة</span>
                              <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            {book.pdfFilePath && (
                              <a
                                href={book.pdfFilePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-md bg-[#3F4A2B] text-white font-bold hover:bg-[#343E23] transition-colors cursor-pointer"
                              >
                                تحميل PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Articles */}
          {(activeType === "articles" || activeType === "all") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
                <h2 className="text-base sm:text-lg font-black text-brand-900 border-r-4 border-brand-600 pr-3 flex items-center gap-2">
                  <span>المقالات والرسائل الدعوية</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100/80 text-brand-800">
                    {sortedArticles.length}
                  </span>
                </h2>
                <span className="text-xs text-brand-700/80 font-medium hidden sm:inline">
                  {activeSort === "oldest" ? "الأقدم أولاً" : "الأحدث أولاً"}
                </span>
              </div>

              {sortedArticles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-brand-100 p-8 text-gray-500 text-sm">
                  لا توجد مقالات متطابقة حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {sortedArticles.map((art) => {
                    const formattedDate = formatDate(
                      art.publishDate || art.createdAt
                    );
                    return (
                      <article
                        key={art.id}
                        className="bg-white rounded-2xl border border-brand-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {art.categoryName ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EEF0E6] text-brand-800 text-[11px] font-bold">
                                {art.categoryName}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-bold">
                                مقال دعوي
                              </span>
                            )}
                            {formattedDate && (
                              <span className="text-[11px] text-gray-400 font-medium">
                                {formattedDate}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-extrabold text-brand-900 line-clamp-2">
                            {art.title}
                          </h3>
                          {art.summary && (
                            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                              {art.summary}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <span className="text-gray-400">بقلم فضيلة الشيخ</span>
                          <span className="text-brand-600 font-bold hover:underline cursor-pointer">
                            قراءة المقال &larr;
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
