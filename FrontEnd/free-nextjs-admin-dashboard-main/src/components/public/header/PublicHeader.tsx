"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/api/public/categories";

interface PublicHeaderProps {
  categories: Category[];
  youtubeUrl?: string;
}

const getCategoryTypeLabel = (type?: number | null) => {
  switch (type) {
    case 1:
      return "كتب ومصنفات";
    case 2:
      return "دروس علمية";
    case 3:
      return "خطب ومواعظ";
    case 4:
      return "تدبر وقرآن";
    default:
      return "قسم دعوي";
  }
};

const normalizeCategoryName = (name: string) => {
  if (name.trim() === "دروس") return "الدروس العلمية";
  return name;
};

const getCategoryHref = (cat: Category) => {
  switch (cat.type) {
    case 1:
      return `/books?categoryId=${cat.id}`;
    case 2:
      return `/lessons?categoryId=${cat.id}`;
    case 3:
      return `/sermons?categoryId=${cat.id}`;
    case 4:
      return `/quran?categoryId=${cat.id}`;
    default:
      return `/lessons?categoryId=${cat.id}`;
  }
};

export default function PublicHeader({
  categories = [],
  youtubeUrl = "https://www.youtube.com/@AboZarAlqalamoni",
}: PublicHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [hijriDate, setHijriDate] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setHijriDate(formatter.format(new Date()));
    } catch {
      setHijriDate("");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
    };

    if (moreDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreDropdownOpen]);

  // منع التمرير في الصفحة الخلفية عند فتح القائمة على الموبايل
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentType = searchParams?.get("type");
  const isHomeActive = pathname === "/" && !currentType;
  const isLessonsActive = pathname === "/lessons" || (pathname.startsWith("/content") && currentType === "lessons");
  const isSermonsActive = pathname === "/sermons" || (pathname.startsWith("/content") && currentType === "sermons");
  const isBooksActive = pathname === "/books" || (pathname.startsWith("/content") && currentType === "books");
  const isArticlesActive = pathname === "/articles" || (pathname.startsWith("/content") && currentType === "articles");
  const isQuranActive = pathname.startsWith("/quran") || (pathname.startsWith("/content") && currentType === "quran");
  const isCategoriesActive = pathname.startsWith("/categories") || moreDropdownOpen;

  const NAV_LINKS = [
    { label: "الرئيسية", href: "/", isActive: isHomeActive },
    { label: "مكتبة الدروس", href: "/lessons", isActive: isLessonsActive },
    { label: "مكتبة الخطب", href: "/sermons", isActive: isSermonsActive },
    { label: "مكتبة الكتب", href: "/books", isActive: isBooksActive },
    { label: "مكتبة المقالات", href: "/articles", isActive: isArticlesActive },
    { label: "مكتبة القرآن الكريم", href: "/quran", isActive: isQuranActive },
  ];

  return (
    <header className="w-full bg-white border-b border-brand-100/70 sticky top-0 z-50 shadow-xs backdrop-blur-md bg-white/95">
      {/* ================= TOP BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Right: Site Logo & Official Scholar Name */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group select-none transition-transform duration-200"
            aria-label="الصفحة الرئيسية - الشيخ أبي ذر القلموني"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 bg-brand-50/70 border border-brand-200/60 shadow-xs flex items-center justify-center">
              <Image
                src="/logo-qalamuni-1.svg"
                alt="شعار الشيخ أبي ذر القلموني"
                width={50}
                height={50}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[11px] sm:text-xs font-semibold text-accent-600 tracking-wide">
                الموقع الرسمي لفضيلة الشيخ
              </span>
              <span className="text-lg sm:text-xl font-black text-brand-900 tracking-tight font-serif">
                أبي ذر القلموني
              </span>
            </div>
          </Link>

          {/* Left/Center: Search Bar & YouTube Channel Only */}
          <div className="flex items-center gap-3">
            {/* Search Input - Pill Shape */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:flex items-center"
              role="search"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أكتب كلمة البحث..."
                className="w-56 md:w-72 lg:w-80 py-2.5 pr-10 pl-4 rounded-full text-xs md:text-sm bg-white/95 border border-gray-200/90 text-brand-950 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200/50 transition-all shadow-inner"
              />
              <button
                type="submit"
                aria-label="بحث"
                className="absolute right-3 text-gray-500 hover:text-brand-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 md:w-4.5 md:h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>

            {/* YouTube Social Icon (Only YouTube as requested) */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="قناة الشيخ الرسمية على اليوتيوب"
              title="قناة الشيخ الرسمية على اليوتيوب"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#3F4A2B] text-white hover:bg-[#C0673F] hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs"
            >
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-brand-900 hover:bg-brand-50 border border-brand-200/50 transition-colors"
              aria-label="القائمة الرئيسية"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Visible only on small screens) */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative mt-3 sm:hidden"
          role="search"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="أكتب كلمة البحث..."
            className="w-full py-2.5 pr-10 pl-4 rounded-full text-xs bg-[#F5F7F8] border border-gray-200 text-brand-950 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:bg-white shadow-inner"
          />
          <button
            type="submit"
            aria-label="بحث"
            className="absolute right-3 top-2.5 text-gray-500 hover:text-brand-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* ================= NAVIGATION BAR ================= */}
      {/* Warm cream background separating it distinctly from the white header */}
      <nav
        className="w-full bg-[#EEF0E6] border-t border-b border-[#D5DAC8]/70"
        aria-label="التنقل الرئيسي"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Nav: items on right, Hijri date on left */}
          <div className="hidden lg:flex items-center justify-between py-1 gap-4">
            {/* Right: Nav items with compact spacing */}
            <div className="flex items-center gap-0.5">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                className={`relative px-4 py-2.5 text-sm font-bold transition-all duration-150 rounded-lg whitespace-nowrap ${
                    item.isActive
                      ? "text-brand-800 font-semibold"
                      : "text-brand-950/80 font-medium hover:text-brand-700 hover:bg-brand-100/35"
                  }`}
                >
                  {item.label}
                  {item.isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-brand-600 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              ))}

              {/* أقسام الموقع (Dropdown with all categories) */}
              {categories.length > 0 && (
                <div ref={dropdownRef} className="relative inline-block text-right">
                  <button
                    type="button"
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className={`px-3.5 py-2 text-sm rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      isCategoriesActive
                        ? "text-brand-800 font-semibold bg-brand-100/40"
                        : "text-brand-950/80 font-medium hover:text-brand-700 hover:bg-brand-100/35"
                    }`}
                    aria-expanded={moreDropdownOpen}
                  >
                    <span>أقسام الموقع</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 text-brand-700/70 ${
                        moreDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute ltr:right-0 rtl:left-0 rtl:right-auto mt-2 w-[540px] sm:w-[580px] max-w-[90vw] rounded-[14px] bg-[#faf7f1] shadow-2xl border border-[#DFE5D7] p-2.5 z-50 text-right animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Header in Earthy Terracotta Color */}
                      <div className="px-3.5 py-2 border-b border-[#E4E7DA]/70 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C0673F] tracking-wide">
                          ❖ تصفح كافة أقسام وتصنيفات الموقع
                        </span>
                        <span className="text-[11px] text-[#8E987B] font-medium">
                          {categories.length} أقسام متاحة
                        </span>
                      </div>

                      {/* 2-Column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 max-h-84 overflow-y-auto">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={getCategoryHref(cat)}
                            onClick={() => setMoreDropdownOpen(false)}
                            className="group block p-3 rounded-xl hover:bg-[#F2F4ED] transition-all duration-150 text-right border border-transparent hover:border-[#D5DAC8]"
                          >
                            {/* Category Type Above */}
                            <span className="block text-[11px] font-bold text-[#C0673F] group-hover:text-[#A65330] mb-0.5">
                              {getCategoryTypeLabel(cat.type)}
                            </span>
                            {/* Normalized Name in 15px font */}
                            <span className="block text-[15px] font-semibold text-brand-950 group-hover:text-brand-800 leading-snug">
                              {normalizeCategoryName(cat.name)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Left: Hijri Date Badge */}
            {hijriDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#D5DAC8] text-xs text-[#3E4732] font-medium shadow-2xs shrink-0 select-none">
                <svg className="w-3.5 h-3.5 text-[#C0673F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="tracking-tight">{hijriDate}</span>
              </div>
            )}
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-brand-200/50 space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto overscroll-contain menu-scrollbar pl-1.5">
              {/* Mobile Hijri Date */}
              {hijriDate && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D5DAC8]/80 text-xs text-[#4B533E] font-medium mb-2">
                  <svg className="w-3.5 h-3.5 text-[#C0673F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{hijriDate}</span>
                </div>
              )}

              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm ${
                    item.isActive
                      ? "bg-brand-500 text-white font-semibold"
                      : "text-brand-900 font-medium hover:bg-brand-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {categories.length > 0 && (
                <div className="pt-3 border-t border-brand-200/40">
                  <span className="block px-3 py-1.5 text-xs font-bold text-[#C0673F]">
                    أقسام الموقع
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1 bg-[#faf7f1] p-2 rounded-[14px] border border-[#DFE5D7]">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={getCategoryHref(cat)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-2.5 rounded-xl hover:bg-[#F2F4ED] text-right transition-colors"
                      >
                        <span className="block text-[11px] font-bold text-[#C0673F]">
                          {getCategoryTypeLabel(cat.type)}
                        </span>
                        <span className="block text-[15px] font-semibold text-brand-950">
                          {normalizeCategoryName(cat.name)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
