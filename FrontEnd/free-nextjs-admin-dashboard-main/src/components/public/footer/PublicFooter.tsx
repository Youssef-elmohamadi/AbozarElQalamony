"use client";

import React from "react";
import Link from "next/link";

interface PublicFooterProps {
  youtubeUrl?: string;
}

export default function PublicFooter({
  youtubeUrl = "https://www.youtube.com/@AboZarAlqalamoni",
}: PublicFooterProps) {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#222B18] text-[#FAFAF5] pt-12 pb-8 border-t border-[#313C25] text-right">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= 4 COLUMNS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8">
          {/* Column 1: Scholar Branding & Bio (Rightmost in RTL) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              {/* Arch & Book Emblem Icon matching screenshot */}
              <div className="w-7 h-7 flex items-center justify-center text-[#FAFAF5] shrink-0">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 21V11a7 7 0 0 1 14 0v10" />
                  <path d="M12 14v5" />
                  <path d="M12 14c-1.5-.8-3-.8-4.5-.4v5c1.5-.4 3-.4 4.5.4" />
                  <path d="M12 14c1.5-.8 3-.8 4.5-.4v5c-1.5-.4-3-.4-4.5.4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-[22px] font-bold font-ruqaa text-[#FAFAF5] tracking-wide">
                أبو ذر القلموني
              </h3>
            </div>

            <p className="text-[13px] text-[#A6B29C] leading-[1.65]">
              البوابة الرسمية لدروس ومؤلفات فضيلة الشيخ عبد المنعم (أبو ذر القلموني) حفظه الله، في التزكية والسلوك والرقائق وتدبر كتاب الله.
            </p>
          </div>

          {/* Column 2: روابط رئيسية */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[15px] font-bold text-[#FAFAF5]">
              روابط رئيسية
            </h4>
            <ul className="space-y-2 text-[13px] text-[#A6B29C]">
              <li>
                <Link href="/" className="hover:text-[#FAFAF5] transition-colors">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#FAFAF5] transition-colors">
                  فهرس الأقسام والتصنيفات
                </Link>
              </li>
              <li>
                <Link href="/marhaban-bi-al-taebeen" className="hover:text-[#FAFAF5] transition-colors">
                  اسطوانة مرحبا بالتائبين
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#FAFAF5] transition-colors">
                  البحث في المحتوى
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: المكتبة */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[15px] font-bold text-[#FAFAF5]">
              المكتبة
            </h4>
            <ul className="space-y-2 text-[13px] text-[#A6B29C]">
              <li>
                <Link href="/content?type=lessons" className="hover:text-[#FAFAF5] transition-colors">
                  الدروس العلمية
                </Link>
              </li>
              <li>
                <Link href="/content?type=sermons" className="hover:text-[#FAFAF5] transition-colors">
                  خطب الجمعة
                </Link>
              </li>
              <li>
                <Link href="/content?type=books" className="hover:text-[#FAFAF5] transition-colors">
                  الكتب والمؤلفات
                </Link>
              </li>
              <li>
                <Link href="/content?type=articles" className="hover:text-[#FAFAF5] transition-colors">
                  المقالات والرسائل
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: القناة الرسمية (Leftmost in RTL) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[15px] font-bold text-[#FAFAF5]">
              القناة الرسمية
            </h4>
            <p className="text-[13px] text-[#A6B29C] leading-relaxed">
              البث المباشر للدروس والمجالس والخطب على يوتيوب.
            </p>
            <div className="pt-1">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#C0673F] hover:bg-[#A85530] text-white text-[13px] font-semibold transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>اشترك في القناة</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#313C25] my-6" />

        {/* Middle Notice: إشعار النشر */}
        <div className="pb-6">
          <p className="text-[13px] text-[#A6B29C] leading-relaxed text-right">
            <strong className="text-[#C5D0BC] font-bold">إشعار النشر:</strong>{" "}
            المواد متاحة لكل مسلم لنشر الخير والدعوة إلى الله، مع الحفاظ على نصها وعزوها لأهل العلم.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#8E9B84] pt-2">
          <p className="text-right">
            © {currentYear} الموقع العلمي والدعوي الرسمي لفضيلة الشيخ أبي ذر القلموني
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#8E9B84] hover:text-[#FAFAF5] transition-colors cursor-pointer"
            aria-label="العودة إلى أعلى الصفحة"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 14l7-7 7 7"
              />
            </svg>
            <span>العودة للأعلى</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
