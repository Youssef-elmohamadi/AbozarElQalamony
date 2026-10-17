"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface InteractivePdfReaderProps {
  pdfUrl: string;
  bookTitle: string;
  authorName?: string | null;
  initialPage?: number;
  fallbackOutline?: { title: string; pageNumber?: number; page?: number }[];
  onPageChange?: (page: number) => void;
}

interface OutlineItem {
  title: string;
  pageNumber?: number;
  dest?: any;
}

export default function InteractivePdfReader({
  pdfUrl,
  bookTitle,
  authorName,
  initialPage = 1,
  fallbackOutline,
  onPageChange,
}: InteractivePdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const secondCanvasRef = useRef<HTMLCanvasElement>(null);

  // PDF Document State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Reader Controls State
  const [zoom, setZoom] = useState<number>(100);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"toc" | "pages">("toc");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Closed by default on start to give maximum width for 2-page spread
  const [isTwoPageMode, setIsTwoPageMode] = useState<boolean>(true); // Default to 2 pages (وجهين) as requested!
  const [pageInput, setPageInput] = useState<string>(String(initialPage));

  // Page flip animation direction ('next' | 'prev' | null)
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  // Keep track of current rendering tasks to prevent overlapping renders
  const renderTask1Ref = useRef<any>(null);
  const renderTask2Ref = useRef<any>(null);

  // Determine secondary page for Two-Page Spread (وجهين متقابلين)
  const secondaryPage = isTwoPageMode && currentPage + 1 <= totalPages ? currentPage + 1 : null;

  // Auto detect small screens on mount to fallback gracefully to 1 page if width is very narrow
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setIsTwoPageMode(false);
      }
    }
  }, []);

  // Update currentPage when initialPage changes (e.g. after localStorage loads)
  useEffect(() => {
    if (initialPage && initialPage > 0) {
      setCurrentPage(initialPage);
      setPageInput(String(initialPage));
    }
  }, [initialPage]);

  // 1. Load PDF.js library dynamically from public directory
  useEffect(() => {
    let isMounted = true;

    const initPdf = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);

        // Check if pdfjsLib already loaded
        let pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/pdfjs/pdf.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("فشل تحميل مشغل ملفات PDF"));
            document.head.appendChild(script);
          });
          pdfjs = (window as any).pdfjsLib;
        }

        if (!pdfjs) throw new Error("تعذر تهيئة مشغل PDF");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        // Load document
        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);

        // Extract Real Outline (Table of Contents) from PDF
        let hasOutline = false;
        try {
          const rawOutline = await doc.getOutline();
          if (rawOutline && Array.isArray(rawOutline) && rawOutline.length > 0) {
            const parsedItems: OutlineItem[] = [];

            for (const item of rawOutline) {
              let pageNum: number | undefined;
              if (typeof item.dest === "string") {
                const destIndex = await doc.getDestination(item.dest);
                if (destIndex) {
                  pageNum = (await doc.getPageIndex(destIndex[0])) + 1;
                }
              } else if (Array.isArray(item.dest)) {
                pageNum = (await doc.getPageIndex(item.dest[0])) + 1;
              }

              parsedItems.push({
                title: item.title,
                pageNumber: pageNum,
                dest: item.dest,
              });
            }

            if (parsedItems.length > 0) {
              setOutline(parsedItems);
              hasOutline = true;
            }
          }
        } catch (err) {
          console.warn("Could not extract outline from PDF:", err);
        }

        // If PDF itself doesn't have an embedded outline, check fallbackOutline from book record
        if (!hasOutline && fallbackOutline && fallbackOutline.length > 0) {
          setOutline(
            fallbackOutline.map((f) => ({
              title: f.title,
              pageNumber: f.pageNumber ?? f.page,
            }))
          );
          hasOutline = true;
        }

        // If no outline exists at all, activate pages grid tab by default
        if (!hasOutline) {
          setActiveTab("pages");
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("PDF load error:", err);
        setLoadingError("تعذر فتح ملف الكتاب، يرجى المحاولة لاحقاً أو تحميل الملف مباشرة.");
        setIsLoading(false);
      }
    };

    initPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, fallbackOutline]);

  // 2. Render Page / Two-Page Spread with Perfect Fit (no cut-offs!)
  const isRenderingRef = useRef<boolean>(false);
  const pendingRenderRef = useRef<{ page1: number; page2: number | null } | null>(null);

  const renderSpread = useCallback(
    async (pageNum1: number, pageNum2: number | null) => {
      if (!pdfDoc || !canvasRef.current || !stageRef.current) return;

      // If already rendering, store as pending and cancel ongoing tasks
      if (isRenderingRef.current) {
        pendingRenderRef.current = { page1: pageNum1, page2: pageNum2 };
        try {
          if (renderTask1Ref.current) renderTask1Ref.current.cancel();
          if (renderTask2Ref.current) renderTask2Ref.current.cancel();
        } catch {
          // ignore cancel error
        }
        return;
      }

      isRenderingRef.current = true;

      try {
        // Cancel and await previous tasks if any
        if (renderTask1Ref.current) {
          try {
            renderTask1Ref.current.cancel();
            await renderTask1Ref.current.promise;
          } catch {
            // ignore
          }
          renderTask1Ref.current = null;
        }

        if (renderTask2Ref.current) {
          try {
            renderTask2Ref.current.cancel();
            await renderTask2Ref.current.promise;
          } catch {
            // ignore
          }
          renderTask2Ref.current = null;
        }

        const stage = stageRef.current;
        if (!stage || !canvasRef.current) return;

        // Available space inside the reading stage
        const availableW = Math.max(stage.clientWidth - 40, 260);
        const availableH = Math.max(stage.clientHeight - 30, 360);

        const page1 = await pdfDoc.getPage(pageNum1);
        const unscaled1 = page1.getViewport({ scale: 1.0 });

        const isDual = Boolean(isTwoPageMode && pageNum2);
        // For two pages side-by-side, each page gets half the width minus central gap
        const maxPageW = isDual ? (availableW - 16) / 2 : availableW;
        const maxPageH = availableH;

        // Perfect Fit-to-View: minimum of width-ratio and height-ratio guarantees 0% cropping!
        const fitScale = Math.min(maxPageW / unscaled1.width, maxPageH / unscaled1.height);
        const effectiveScale = fitScale * (zoom / 100);

        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const viewport1 = page1.getViewport({ scale: effectiveScale * dpr });

        const canvas1 = canvasRef.current;
        const ctx1 = canvas1?.getContext("2d");
        if (canvas1 && ctx1) {
          canvas1.width = viewport1.width;
          canvas1.height = viewport1.height;
          canvas1.style.width = `${viewport1.width / dpr}px`;
          canvas1.style.height = `${viewport1.height / dpr}px`;

          const task1 = page1.render({
            canvasContext: ctx1,
            viewport: viewport1,
          });
          renderTask1Ref.current = task1;
          await task1.promise;
          renderTask1Ref.current = null;
        }

        // Secondary Page (Left Page in RTL spread)
        if (isDual && pageNum2 && secondCanvasRef.current) {
          const page2 = await pdfDoc.getPage(pageNum2);
          const viewport2 = page2.getViewport({ scale: effectiveScale * dpr });
          const canvas2 = secondCanvasRef.current;
          const ctx2 = canvas2?.getContext("2d");
          if (canvas2 && ctx2) {
            canvas2.width = viewport2.width;
            canvas2.height = viewport2.height;
            canvas2.style.width = `${viewport2.width / dpr}px`;
            canvas2.style.height = `${viewport2.height / dpr}px`;

            const task2 = page2.render({
              canvasContext: ctx2,
              viewport: viewport2,
            });
            renderTask2Ref.current = task2;
            await task2.promise;
            renderTask2Ref.current = null;
          }
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Spread render error:", err);
        }
      } finally {
        isRenderingRef.current = false;
        // If a new render request arrived while this one was running, execute it now
        if (pendingRenderRef.current) {
          const next = pendingRenderRef.current;
          pendingRenderRef.current = null;
          renderSpread(next.page1, next.page2);
        }
      }
    },
    [pdfDoc, zoom, isTwoPageMode]
  );

  // Re-render when page, mode, zoom, or doc changes
  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderSpread(currentPage, secondaryPage);
      setPageInput(secondaryPage ? `${currentPage} - ${secondaryPage}` : String(currentPage));
      onPageChange?.(currentPage);
    }
  }, [pdfDoc, currentPage, secondaryPage, renderSpread, onPageChange]);

  // Window resize observer with debounce to adapt spread dimensions smoothly
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (pdfDoc && currentPage) {
          renderSpread(currentPage, secondaryPage);
        }
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [pdfDoc, currentPage, secondaryPage, renderSpread]);

  // 3. Navigation Controls ("يقلب للجنب")
  const goToNextPage = () => {
    const step = isTwoPageMode ? 2 : 1;
    if (currentPage < totalPages) {
      setFlipDirection("next");
      setCurrentPage((p) => Math.min(p + step, totalPages));
      setTimeout(() => setFlipDirection(null), 250);
    }
  };

  const goToPrevPage = () => {
    const step = isTwoPageMode ? 2 : 1;
    if (currentPage > 1) {
      setFlipDirection("prev");
      setCurrentPage((p) => Math.max(p - step, 1));
      setTimeout(() => setFlipDirection(null), 250);
    }
  };

  const jumpToPage = (target: number) => {
    const valid = Math.max(1, Math.min(target, totalPages));
    setFlipDirection(valid > currentPage ? "next" : "prev");
    setCurrentPage(valid);
    setTimeout(() => setFlipDirection(null), 250);
  };

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft") {
        goToNextPage();
      } else if (e.key === "ArrowRight") {
        goToPrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-[#D5DAC8] shadow-lg flex flex-col select-none transition-colors duration-200 ${
        isFullscreen ? "h-screen rounded-none z-50 fixed inset-0" : "h-[760px] sm:h-[840px] lg:h-[880px]"
      } ${isDarkMode ? "bg-[#141A10] text-[#FAFAF5]" : "bg-[#EDE8DC] text-[#222B18]"}`}
      dir="rtl"
    >
      {/* ================= 1. TOP CONTROL BAR (Dark Olive matching reference design) ================= */}
      <div className="bg-[#242F1C] text-[#FAF8F2] px-4 py-2.5 flex items-center justify-between gap-4 border-b border-[#354329] z-20 shadow-md">
        {/* Right side in RTL: Title & Scholar Name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isSidebarOpen ? "bg-white/20 text-white" : "bg-white/10 hover:bg-white/15 text-[#D1DAC4]"
            }`}
            title={isSidebarOpen ? "إخفاء الفهرس" : "إظهار الفهرس"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-bold text-white truncate max-w-[190px] sm:max-w-xs leading-none">
              {bookTitle}
            </h3>
            <span className="text-xs text-[#7A8A68] hidden sm:inline">•</span>
            <span className="text-xs text-[#A8B598] hidden sm:inline truncate leading-none">
              {authorName || "فضيلة الشيخ أبو ذر القلموني"}
            </span>
          </div>
        </div>

        {/* Center: Two-Page Toggle + Page Controls + Zoom Controls */}
        <div className="flex items-center gap-2 sm:gap-3 select-none">
          {/* Mode Switcher: Two Pages (وجهين) vs Single Page (صفحة واحدة) */}
          <button
            type="button"
            onClick={() => setIsTwoPageMode(!isTwoPageMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              isTwoPageMode
                ? "bg-[#3D4C2B] text-white border-white/20 shadow-xs"
                : "bg-white/10 hover:bg-white/15 text-[#C6D2B8] border-transparent"
            }`}
            title={isTwoPageMode ? "التبديل إلى صفحة مفردة" : "التبديل إلى وجهين (كتاب مفتوح)"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="hidden sm:inline">
              {isTwoPageMode ? "وجهين" : "صفحة واحدة"}
            </span>
          </button>

          {/* Page Turn Box with Clean Horizontal Alignment */}
          <div className="flex items-center gap-1 bg-black/35 px-2.5 py-1 rounded-xl border border-white/15 text-xs text-white">
            {/* Prev Page Button (Right Arrow in RTL) */}
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="p-1 rounded-lg hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="الصفحة السابقة"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Editable Page Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = parseInt(pageInput, 10);
                if (!isNaN(p)) jumpToPage(p);
              }}
              className="flex items-center gap-1.5 px-1 font-mono"
            >
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => {
                  const p = parseInt(pageInput, 10);
                  if (!isNaN(p)) jumpToPage(p);
                  else setPageInput(secondaryPage ? `${currentPage} - ${secondaryPage}` : String(currentPage));
                }}
                className={`text-center text-xs font-bold bg-white/20 border border-white/20 rounded-md py-0.5 text-white focus:outline-hidden focus:bg-white/30 transition-all ${
                  secondaryPage ? "w-16" : "w-11"
                }`}
              />
              <span className="text-xs text-[#A8B598] font-bold">/</span>
              <span className="text-xs text-[#D1DAC4] font-bold">{totalPages}</span>
            </form>

            {/* Next Page Button (Left Arrow in RTL) */}
            <button
              type="button"
              onClick={goToNextPage}
              disabled={(isTwoPageMode ? currentPage + 1 >= totalPages : currentPage >= totalPages) || isLoading}
              className="p-1 rounded-lg hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="الصفحة التالية"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls (- 100% +) */}
          <div className="hidden md:flex items-center gap-1 bg-black/35 px-2 py-1 rounded-xl border border-white/15 text-xs text-white">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 15, 60))}
              disabled={zoom <= 60}
              className="w-6 h-6 rounded-md hover:bg-white/15 flex items-center justify-center font-bold text-sm disabled:opacity-25 transition-colors cursor-pointer"
              title="تصغير"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="w-12 text-center font-mono text-xs font-bold text-[#E0DBC8] hover:text-white transition-colors"
              title="إعادة ضبط الحجم"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 15, 200))}
              disabled={zoom >= 200}
              className="w-6 h-6 rounded-md hover:bg-white/15 flex items-center justify-center font-bold text-sm disabled:opacity-25 transition-colors cursor-pointer"
              title="تكبير"
            >
              +
            </button>
          </div>
        </div>

        {/* Left side in RTL: Mode, Fullscreen & Download */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark / Night Mode */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? "bg-amber-500/20 text-amber-300" : "bg-white/10 hover:bg-white/20 text-[#FAF8F2]"
            }`}
            title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF8F2] transition-colors cursor-pointer"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </button>

          {/* Download Button */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF8F2] transition-colors cursor-pointer"
            title="تحميل الكتاب PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* ================= 2. MAIN BODY (Side Panel on right + Reading Stage on left/center) ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================= SIDEBAR (الفهرس / الصفحات) ================= */}
        {isSidebarOpen && (
          <aside
            className={`w-60 sm:w-72 shrink-0 border-l border-[#DFD8C7] flex flex-col z-10 transition-colors duration-150 ${
              isDarkMode ? "bg-[#182013] border-[#2E3B21]" : "bg-[#FAF8F3] border-[#DFD8C7]"
            }`}
          >
            {/* Tabs Header */}
            <div className="flex items-center border-b border-[#E8E2D4] dark:border-[#2E3B21] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("toc")}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                  activeTab === "toc"
                    ? "border-[#C0673F] text-[#C0673F]"
                    : "border-transparent text-[#7A8569] hover:text-[#2A331D] dark:hover:text-[#FAFAF5]"
                }`}
              >
                الفهرس
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pages")}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                  activeTab === "pages"
                    ? "border-[#C0673F] text-[#C0673F]"
                    : "border-transparent text-[#7A8569] hover:text-[#2A331D] dark:hover:text-[#FAFAF5]"
                }`}
              >
                الصفحات
              </button>
            </div>

            {/* Tab 1: Table of Contents */}
            {activeTab === "toc" && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                {outline.length > 0 ? (
                  (() => {
                    const activeOutlineIdx = outline.reduce((bestIdx, item, idx) => {
                      if (item.pageNumber && item.pageNumber <= currentPage) {
                        return idx;
                      }
                      return bestIdx;
                    }, -1);

                    return outline.map((item, idx) => {
                      const isTargetActive = idx === activeOutlineIdx || item.pageNumber === currentPage;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (item.pageNumber) jumpToPage(item.pageNumber);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-right transition-colors cursor-pointer group ${
                            isTargetActive
                              ? "bg-[#D9E4CE] dark:bg-[#2B3B1E] text-[#1E2616] dark:text-[#FAFAF5] font-bold shadow-2xs"
                              : "hover:bg-[#F0ECE1] dark:hover:bg-[#222E1A] text-[#2C3620] dark:text-[#D1DAC4]"
                          }`}
                        >
                          <span className="truncate flex-1 pl-2">{item.title}</span>
                          {item.pageNumber && (
                            <span className="font-mono text-[11px] text-[#7A8569] dark:text-[#9EA98F] shrink-0 font-bold">
                              {item.pageNumber}
                            </span>
                          )}
                        </button>
                      );
                    });
                  })()
                ) : (
                  <div className="p-4 text-center text-[#7A8569] space-y-3">
                    <p className="text-xs leading-relaxed">
                      الكتاب لا يحتوي على فهرس مدمج بالملف، يمكنك التصفح السريع من تبويب «الصفحات».
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pages")}
                      className="px-3 py-1.5 rounded-lg bg-[#3F4A2B] text-white text-xs font-bold"
                    >
                      عرض الصفحات
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Pages Grid / List */}
            {activeTab === "pages" && (
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === currentPage || (isTwoPageMode && pNum === secondaryPage);
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => jumpToPage(pNum)}
                      className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isCurrent
                          ? "bg-[#3F4A2B] text-white border-[#3F4A2B] shadow-sm scale-105"
                          : "bg-white dark:bg-[#222E1A] border-[#E8E2D4] dark:border-[#2E3B21] text-[#2C3620] dark:text-[#D1DAC4] hover:border-[#3F4A2B]"
                      }`}
                    >
                      <span>{pNum}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
        )}

        {/* ================= CANVAS READING STAGE ("يقلب للجنب" + Fit to View) ================= */}
        <div
          ref={stageRef}
          className="flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4 relative"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/10 backdrop-blur-2xs gap-3">
              <div className="w-9 h-9 border-3 border-[#3F4A2B] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-[#2A351D] dark:text-[#FAFAF5]">
                جاري فتح صفحات الكتاب...
              </span>
            </div>
          )}

          {loadingError && (
            <div className="p-8 text-center space-y-3 bg-white dark:bg-[#1E2516] rounded-2xl border border-red-200 max-w-md shadow-md">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
                ✕
              </div>
              <h4 className="text-sm font-bold text-red-700">{loadingError}</h4>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-block px-4 py-2 rounded-xl bg-[#3F4A2B] text-white text-xs font-bold"
              >
                تحميل الكتاب مباشرة
              </a>
            </div>
          )}

          {/* Floating Side Flipping Buttons on the Canvas Stage */}
          {!isLoading && !loadingError && (
            <>
              {/* Prev Button (Right side in RTL) */}
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                aria-label="الصفحة السابقة"
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-black/70 border border-[#D5DAC8] dark:border-white/10 shadow-xl items-center justify-center text-[#2A351D] dark:text-white hover:scale-110 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Next Button (Left side in RTL) */}
              <button
                type="button"
                onClick={goToNextPage}
                disabled={(isTwoPageMode ? currentPage + 1 >= totalPages : currentPage >= totalPages)}
                aria-label="الصفحة التالية"
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-black/70 border border-[#D5DAC8] dark:border-white/10 shadow-xl items-center justify-center text-[#2A351D] dark:text-white hover:scale-110 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}

          {/* Centered Document Sheet (Two-Page Spread or Single-Page with Slide Flip Animation) */}
          <div
            className={`transition-all duration-200 ease-out flex items-center justify-center max-w-full max-h-full ${
              flipDirection === "next"
                ? "-translate-x-5 opacity-90 scale-[0.99]"
                : flipDirection === "prev"
                ? "translate-x-5 opacity-90 scale-[0.99]"
                : "translate-x-0 opacity-100 scale-100"
            }`}
          >
            {/* Real Book Spread Frame */}
            <div className="flex items-center justify-center shadow-2xl rounded-sm overflow-hidden border border-[#D5DAC8]/70 bg-white dark:bg-[#1E2516]">
              {/* Primary Page: Right Page in RTL */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className={`block transition-all duration-200 ${
                    isDarkMode ? "filter invert-[0.92] hue-rotate-180 brightness-95 contrast-105" : ""
                  }`}
                />
              </div>

              {/* Center Book Crease / Spine (When 2 pages are side by side) */}
              {isTwoPageMode && secondaryPage && (
                <div
                  className="w-2.5 self-stretch bg-gradient-to-r from-black/20 via-black/5 to-black/20 z-10 shrink-0 pointer-events-none border-x border-black/10"
                  title="ثنية الكتاب"
                />
              )}

              {/* Secondary Page: Left Page in RTL */}
              {isTwoPageMode && secondaryPage && (
                <div className="relative">
                  <canvas
                    ref={secondCanvasRef}
                    className={`block transition-all duration-200 ${
                      isDarkMode ? "filter invert-[0.92] hue-rotate-180 brightness-95 contrast-105" : ""
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. BOTTOM HELPER BAR ================= */}
      <div className="bg-[#FAF8F3] dark:bg-[#182013] border-t border-[#DFD8C7] dark:border-[#2E3B21] px-4 py-2 flex items-center justify-between text-xs text-[#626F4E] dark:text-[#A8B598]">
        <span className="hidden sm:inline">
          يمكنك استخدام مفاتيح الأسهم (← و →) في لوحة المفاتيح للتقليب السريع
        </span>
        <span className="font-mono text-xs font-bold text-[#3F4A2B] dark:text-[#C6D2B8]">
          {isTwoPageMode && secondaryPage
            ? `صفحتا ${currentPage} و ${secondaryPage} من ${totalPages}`
            : `صفحة ${currentPage} من ${totalPages}`}
        </span>
      </div>
    </div>
  );
}
