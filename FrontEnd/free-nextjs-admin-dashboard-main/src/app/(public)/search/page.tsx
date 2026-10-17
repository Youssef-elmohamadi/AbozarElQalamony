import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getGlobalSearch } from "@/api/public/content";
import Image from "next/image";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; section?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  return {
    title: query
      ? `نتائج البحث الشامل عن "${query}" | منصة الشيخ أبو ذر القلموني`
      : "البحث العام في المنصة | منصة الشيخ أبو ذر القلموني",
    description: `نتائج البحث الشامل عن ${query} في التصنيفات، الدروس، الخطب، الكتب، القرآن الكريم، المقالات، والتنبيهات.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, sort: rawSort, section = "all" } = await searchParams;
  const query = q?.trim() || "";
  const sort = rawSort === "oldest" ? "oldest" : "latest";

  const searchData = query
    ? await getGlobalSearch({ q: query, sort, section, limitPerSection: 12 })
    : {
        query: "",
        sort: "latest",
        totalResults: 0,
        categories: [],
        lessons: [],
        sermons: [],
        books: [],
        quran: [],
        articles: [],
        alerts: [],
      };

  const {
    categories = [],
    lessons = [],
    sermons = [],
    books = [],
    quran = [],
    articles = [],
    alerts = [],
    totalResults = 0,
  } = searchData;

  const getCategoryTargetUrl = (type: number, id: number) => {
    switch (type) {
      case 1:
        return `/books?categoryId=${id}`;
      case 2:
        return `/lessons?categoryId=${id}`;
      case 3:
        return `/sermons?categoryId=${id}`;
      case 4:
        return `/quran?categoryId=${id}`;
      default:
        return `/categories/${id}`;
    }
  };

  const getCategoryTypeName = (type: number) => {
    switch (type) {
      case 1:
        return "كتب ومؤلفات";
      case 2:
        return "دروس علمية";
      case 3:
        return "خطب الجمعة";
      case 4:
        return "القرآن الكريم";
      default:
        return "تصنيف عام";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return "";
    }
  };

  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <div className="py-10 sm:py-14 bg-[#F8F9F5]/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= SEARCH HEADER ================= */}
        <div className="bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold mb-3 border border-brand-100">
                <svg className="w-3.5 h-3.5 text-[#3F4A2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>البحث الشامل في المنصة</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-950 font-serif">
                {query ? `نتائج البحث عن: «${query}»` : "البحث في جميع محتويات المنصة"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {query
                  ? `تم العثور على ${totalResults} نتيجة مطابقة في التصنيفات، الدروس، الخطب، الكتب، القرآن، المقالات والتنبيهات`
                  : "يرجى كتابة كلمة البحث في شريط البحث بالأعلى للبحث في كافة أقسام المنصة العلمية"}
              </p>
            </div>

            {/* Quick Filter Counts Badges in Brand Identity Colors */}
            {query && totalResults > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                {categories.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F1] text-[#3F4A2B] border border-[#DFE5D7]">
                    تصنيفات ({categories.length})
                  </span>
                )}
                {lessons.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF3EF] text-[#864024] border border-[#F5E3D8]">
                    دروس ({lessons.length})
                  </span>
                )}
                {sermons.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F1] text-[#3F4A2B] border border-[#DFE5D7]">
                    خطب ({sermons.length})
                  </span>
                )}
                {books.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF3EF] text-[#864024] border border-[#F5E3D8]">
                    كتب ({books.length})
                  </span>
                )}
                {quran.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F1] text-[#3F4A2B] border border-[#DFE5D7]">
                    قرآن وتدبر ({quran.length})
                  </span>
                )}
                {articles.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF3EF] text-[#864024] border border-[#F5E3D8]">
                    مقالات ({articles.length})
                  </span>
                )}
                {alerts.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF3EF] text-[#C0673F] border border-[#F5E3D8]">
                    تنبيهات ({alerts.length})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sort selector for search results */}
          {query && totalResults > 0 && (
            <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[#DFE5D7] flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E2616]">
                <svg
                  className="w-4 h-4 text-[#C0673F]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <span>ترتيب النتائج حسب التاريخ:</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=latest${section !== "all" ? `&section=${section}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sort === "latest"
                      ? "bg-[#273318] text-[#FAFAF5] shadow-xs"
                      : "bg-[#EEF0E6] text-[#3F4A2B] hover:bg-[#E4E7DA]"
                  }`}
                >
                  الأحدث أولاً
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&sort=oldest${section !== "all" ? `&section=${section}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sort === "oldest"
                      ? "bg-[#273318] text-[#FAFAF5] shadow-xs"
                      : "bg-[#EEF0E6] text-[#3F4A2B] hover:bg-[#E4E7DA]"
                  }`}
                >
                  الأقدم أولاً
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ================= RESULTS LISTING ================= */}
        {query && totalResults === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-brand-100 p-8 text-gray-500 text-sm shadow-xs">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-bold text-base text-gray-800 mb-1">لم يتم العثور على أي نتائج مطابقة</p>
            <p className="text-xs text-gray-500">
              لم نعثر على أي مواد مطابقة لكلمة «{query}». جرب استخدام كلمات بحث أخرى أو تصفح المكتبات مباشرة.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. Categories Results */}
            {categories.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#3F4A2B] pr-3 flex items-center gap-2">
                    <span>التصنيفات العلمية</span>
                    <span className="text-xs font-normal text-[#78826B]">({categories.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={getCategoryTargetUrl(cat.type, cat.id)}
                      className="group bg-white rounded-2xl border border-[#DFE5D7] hover:border-[#3F4A2B]/60 p-4 shadow-xs transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] border border-[#F5E3D8] px-2 py-0.5 rounded-md inline-block mb-1">
                          {getCategoryTypeName(cat.type)}
                        </span>
                        <h3 className="text-sm font-bold text-[#1E2616] group-hover:text-[#3F4A2B] transition-colors line-clamp-1">
                          {cat.name}
                        </h3>
                      </div>
                      <svg className="w-4 h-4 text-[#8E987B] group-hover:text-[#3F4A2B] group-hover:-translate-x-1 transition-all rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Quran Results */}
            {quran.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#C0673F] pr-3 flex items-center gap-2">
                    <span>القرآن الكريم ومجالس التدبر</span>
                    <span className="text-xs font-normal text-[#78826B]">({quran.length})</span>
                  </h2>
                  <Link href="/quran" className="text-xs font-bold text-[#C0673F] hover:underline">
                    المكتبة القرآنية &larr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quran.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#DFE5D7] p-4 shadow-xs flex flex-col justify-between hover:border-[#C0673F]/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-[#3F4A2B] bg-[#FAF7F1] border border-[#DFE5D7] px-2 py-0.5 rounded-md">
                            {item.categoryName || "القرآن الكريم"}
                          </span>
                          {item.surahName && (
                            <span className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] border border-[#F5E3D8] px-2 py-0.5 rounded-md">
                              سورة {item.surahName}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-[#1E2616] mb-1 line-clamp-2">
                          <Link href="/quran" className="hover:text-[#C0673F] transition-colors">
                            {item.title}
                          </Link>
                        </h3>
                        {item.description && (
                          <p className="text-xs text-[#555E46] line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#78826B]">
                        <span>{item.durationInMinutes ? `${item.durationInMinutes} دقيقة` : formatDate(item.publishDate)}</span>
                        {item.audioFilePath && (
                          <a
                            href={getMediaUrl(item.audioFilePath)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#864024] hover:underline flex items-center gap-1"
                          >
                            <span>استماع</span>
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Lessons Results */}
            {lessons.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#3F4A2B] pr-3 flex items-center gap-2">
                    <span>الدروس العلمية</span>
                    <span className="text-xs font-normal text-[#78826B]">({lessons.length})</span>
                  </h2>
                  <Link href="/lessons" className="text-xs font-bold text-[#3F4A2B] hover:underline">
                    مكتبة الدروس &larr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#DFE5D7] p-4 shadow-xs flex flex-col justify-between hover:border-[#3F4A2B]/60 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] border border-[#F5E3D8] px-2 py-0.5 rounded-md inline-block mb-2">
                          {item.categoryName || "درس علمي"}
                        </span>
                        <h3 className="text-sm font-extrabold text-[#1E2616] mb-1 line-clamp-2">
                          <Link href={`/lessons/${item.id}`} className="hover:text-[#3F4A2B] transition-colors">
                            {item.title}
                          </Link>
                        </h3>
                        {item.description && (
                          <p className="text-xs text-[#555E46] line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#78826B]">
                        <span>{item.durationInMinutes ? `${item.durationInMinutes} دقيقة` : formatDate(item.publishDate)}</span>
                        <Link
                          href={`/lessons/${item.id}`}
                          className="font-bold text-[#3F4A2B] hover:underline flex items-center gap-1"
                        >
                          <span>استماع وتفاصيل</span>
                          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Sermons Results */}
            {sermons.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#C0673F] pr-3 flex items-center gap-2">
                    <span>خطب الجمعة</span>
                    <span className="text-xs font-normal text-[#78826B]">({sermons.length})</span>
                  </h2>
                  <Link href="/sermons" className="text-xs font-bold text-[#C0673F] hover:underline">
                    مكتبة الخطب &larr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sermons.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#DFE5D7] p-4 shadow-xs flex flex-col justify-between hover:border-[#C0673F]/60 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#3F4A2B] bg-[#FAF7F1] border border-[#DFE5D7] px-2 py-0.5 rounded-md inline-block mb-2">
                          {item.categoryName || "خطبة جمعة"}
                        </span>
                        <h3 className="text-sm font-extrabold text-[#1E2616] mb-1 line-clamp-2">
                          <Link href={`/sermons/${item.id}`} className="hover:text-[#C0673F] transition-colors">
                            {item.title}
                          </Link>
                        </h3>
                        {item.description && (
                          <p className="text-xs text-[#555E46] line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#78826B]">
                        <span>{formatDate(item.publishDate || (item as any).khutbahDate)}</span>
                        <Link
                          href={`/sermons/${item.id}`}
                          className="font-bold text-[#864024] hover:underline flex items-center gap-1"
                        >
                          <span>استماع للخطبة</span>
                          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Books Results */}
            {books.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#3F4A2B] pr-3 flex items-center gap-2">
                    <span>الكتب والمؤلفات</span>
                    <span className="text-xs font-normal text-[#78826B]">({books.length})</span>
                  </h2>
                  <Link href="/books" className="text-xs font-bold text-[#3F4A2B] hover:underline">
                    مكتبة الكتب &larr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {books.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#DFE5D7] p-4 shadow-xs flex flex-col justify-between hover:border-[#3F4A2B]/60 transition-colors"
                    >
                      <div>
                        {item.coverImagePath && (
                          <div className="w-full h-36 relative mb-3 rounded-xl overflow-hidden bg-[#FAF7F1] border border-[#DFE5D7]">
                            <Image
                              src={getMediaUrl(item.coverImagePath)!}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] border border-[#F5E3D8] px-2 py-0.5 rounded-md inline-block mb-1">
                          {item.categoryName || "كتاب"}
                        </span>
                        <h3 className="text-sm font-extrabold text-[#1E2616] mb-1 line-clamp-2">
                          <Link href={`/books/${item.id}`} className="hover:text-[#3F4A2B] transition-colors">
                            {item.title}
                          </Link>
                        </h3>
                        {item.description && (
                          <p className="text-xs text-[#555E46] line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#78826B]">
                        <span>{item.pagesCount ? `${item.pagesCount} صفحة` : "كتاب إلكتروني"}</span>
                        <Link
                          href={`/books/${item.id}`}
                          className="font-bold text-[#3F4A2B] hover:underline flex items-center gap-1"
                        >
                          <span>قراءة</span>
                          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Articles Results */}
            {articles.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#C0673F] pr-3 flex items-center gap-2">
                    <span>المقالات والرسائل الدعوية</span>
                    <span className="text-xs font-normal text-[#78826B]">({articles.length})</span>
                  </h2>
                  <Link href="/articles" className="text-xs font-bold text-[#C0673F] hover:underline">
                    مكتبة المقالات &larr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#DFE5D7] p-4 shadow-xs flex flex-col justify-between hover:border-[#C0673F]/60 transition-colors"
                    >
                      <div>
                        <div className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] border border-[#F5E3D8] px-2 py-0.5 rounded-md inline-block mb-2">
                          مقال دعوي
                        </div>
                        <h3 className="text-sm font-extrabold text-[#1E2616] mb-1">
                          <Link href={`/articles/${item.id}`} className="hover:text-[#C0673F] transition-colors">
                            {item.title}
                          </Link>
                        </h3>
                        {item.description && (
                          <p className="text-xs text-[#555E46] line-clamp-3 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EAE6DB] flex items-center justify-between text-xs text-[#78826B]">
                        <span>{formatDate(item.publishDate)}</span>
                        <Link
                          href={`/articles/${item.id}`}
                          className="font-bold text-[#864024] hover:underline flex items-center gap-1"
                        >
                          <span>قراءة المقال كامل</span>
                          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Alerts Results */}
            {alerts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-[#1E2616] border-r-4 border-[#C0673F] pr-3 flex items-center gap-2">
                    <span>تنبيهات وإعلانات الموقع</span>
                    <span className="text-xs font-normal text-[#78826B]">({alerts.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alerts.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#DFE5D7] p-4 shadow-xs"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#C0673F] animate-ping"></span>
                        <span className="text-[10px] font-bold text-[#864024] bg-[#FAF3EF] border border-[#F5E3D8] px-2 py-0.5 rounded-md">
                          تنبيه رسمي
                        </span>
                        <span className="text-xs text-[#78826B] mr-auto">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#1E2616] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#555E46] leading-relaxed">
                        {item.content}
                      </p>
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
