"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { SiteAlert } from "@/api/public/home";

interface AlertsTickerProps {
  alerts: SiteAlert[];
}

export default function AlertsTicker({ alerts = [] }: AlertsTickerProps) {
  // Filter active alerts and non-expired alerts
  const validAlerts = alerts.filter((a) => {
    if (!a.isActive) return false;
    if (a.expiresAt) {
      const exp = new Date(a.expiresAt);
      if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
        return false;
      }
    }
    return true;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const total = validAlerts.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentAlert = validAlerts[currentIndex] || null;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setIsManual(true);
    setAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setAnimating(false), 300);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setIsManual(true);
    setAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setAnimating(false), 300);
  }, [total]);

  // Auto rotation every 5.5 seconds unless paused or modal is open
  useEffect(() => {
    if (total <= 1 || isPaused || modalOpen) return;

    const interval = setInterval(() => {
      setAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % total);
      setTimeout(() => setAnimating(false), 300);
    }, 5500);

    return () => clearInterval(interval);
  }, [total, isPaused, modalOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  // إيقاف التمرير في الصفحة الخلفية عند فتح المودال
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  if (!currentAlert || total === 0) return null;

  const isUrgent = Boolean(
    currentAlert.isUrgent ||
    currentAlert.priority === "urgent" ||
    currentAlert.priority === "high" ||
    currentAlert.title.includes("عاجل")
  );

  return (
    <>
      {/* ================= SCHOLAR ALERT CARD (IDENTITY COLORS) ================= */}
      <section
        ref={containerRef}
        aria-label="شريط تنبيهات وإعلانات الموقع"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className={`relative w-full rounded-2xl border p-4 sm:p-5 transition-all select-none shadow-xs ${isUrgent
            ? "bg-[#FAF1EC] border-[#E8D0C2] text-[#6D2F17]"
            : "bg-[#FAF6EE] border-[#DFD7C5] text-[#2A341E]"
          }`}
      >
        {/* Top Header Row: Megaphone + Badge + Title + Controls */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#ECE4D4]/90">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0 flex-1">
            {/* Megaphone Icon */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUrgent
                  ? "bg-[#C0673F] text-white"
                  : "bg-[#2A341E] text-[#FAFAF5]"
                }`}
              aria-hidden="true"
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
                  strokeWidth={1.9}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>

            {/* Badge: "تنبيه من فضيلة الشيخ" */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 shadow-2xs ${isUrgent
                  ? "bg-[#C0673F] text-white"
                  : "bg-[#2A341E] text-[#FAFAF5]"
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B59D]" />
              <span>تنبيه من فضيلة الشيخ</span>
            </span>

            {/* Alert Title */}
            <h3
              className="text-sm sm:text-base font-extrabold text-[#2A341E] line-clamp-1 truncate tracking-tight"
              title={currentAlert.title}
            >
              {currentAlert.title}
            </h3>
          </div>

          {/* Navigation Controls: Counter + Prev/Next buttons (only when multiple alerts) */}
          {total > 1 && (
            <div className="flex items-center gap-1 shrink-0 bg-white/90 border border-[#DFD7C5] rounded-xl px-2 py-1 shadow-2xs text-xs">
              <span className="text-[11px] text-[#556345] font-bold select-none px-1 tracking-tight">
                {currentIndex + 1} / {total}
              </span>

              {/* Prev Button (In RTL, Prev navigates right) */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="التنبيه السابق"
                className="w-6 h-6 rounded-md hover:bg-[#FAF6EE] text-[#2A341E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Next Button (In RTL, Next navigates left) */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="التنبيه التالي"
                className="w-6 h-6 rounded-md hover:bg-[#FAF6EE] text-[#2A341E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content Row: Showing 2 lines of the alert body with "عرض المزيد" */}
        <div
          className={`pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right transition-all duration-300 ${animating ? "opacity-30 translate-x-1" : "opacity-100 translate-x-0"
            }`}
          aria-live={isManual ? "polite" : "off"}
        >
          <p className="text-xs sm:text-[13.5px] text-[#4B533E] leading-relaxed line-clamp-2 flex-1">
            {currentAlert.content}
          </p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DFD7C5] hover:border-[#C0673F] text-xs font-bold text-[#C0673F] hover:text-[#9E4F2C] shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            <span>عرض التفاصيل الكاملة</span>
            <span aria-hidden="true">&larr;</span>
          </button>
        </div>
      </section>

      {/* ================= DETAILS POPUP MODAL (PORTAL TO DOCUMENT.BODY) ================= */}
      {/* Rendered via createPortal directly on document.body to ensure 100% full-screen coverage with no gaps */}
      {modalOpen &&
        mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-modal-title"
            className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen bg-black/35 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-[#FAF7F1] rounded-2xl border border-[#D5DAC8] shadow-2xl overflow-hidden text-right p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150 relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#E3DAC8]/90 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUrgent
                        ? "bg-[#C0673F] text-white"
                        : "bg-[#2A341E] text-[#FAFAF5]"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.9}
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-bold ${isUrgent
                          ? "bg-[#C0673F] text-white"
                          : "bg-[#2A341E] text-white"
                        }`}
                    >
                      تنبيه من فضيلة الشيخ
                    </span>
                    <h3
                      id="alert-modal-title"
                      className="text-base sm:text-lg font-black text-brand-950 mt-1 leading-snug"
                    >
                      {currentAlert.title}
                    </h3>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#EDECE5] hover:bg-[#E2E0D8] text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="إغلاق النافذة"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body: Full Content */}
              <div className="py-2 text-sm sm:text-[14.5px] text-[#2F3724] leading-relaxed whitespace-pre-line font-medium">
                {currentAlert.content}
              </div>

              {/* Modal Footer: Date & Close */}
              <div className="pt-3 border-t border-[#E3DAC8]/90 flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-[#7A836D]">
                  {currentAlert.createdAt
                    ? new Date(currentAlert.createdAt).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "تنبيه رسمي"}
                </span>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  حسناً، فهمت
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
