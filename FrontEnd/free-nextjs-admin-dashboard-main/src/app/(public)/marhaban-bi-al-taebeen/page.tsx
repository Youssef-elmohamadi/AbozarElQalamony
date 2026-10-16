import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "اسطوانة مرحبا بالتائبين | فضيلة الشيخ أبو ذر القلموني",
  description:
    "اسطوانة مرحبا بالتائبين لفضيلة الشيخ أبي ذر القلموني - السلسلة الإيمانية والوعظية المؤثرة في التوبة والإنابة والفرار إلى الله تعالى. استماع وتحميل مجاني.",
  keywords: [
    "اسطوانة مرحبا بالتائبين",
    "الشيخ أبو ذر القلموني مرحبا بالتائبين",
    "توبة التائبين",
    "ففروا إلى الله",
    "رقائق الشيخ أبو ذر",
    "مواعظ التوبة",
  ],
  alternates: {
    canonical: "/marhaban-bi-al-taebeen",
  },
};

const DISC_TRACKS = [
  {
    id: 1,
    title: "مقدمة: مرحبا بالتائبين والمنيبين",
    duration: "25 دقيقة",
    desc: "كلمة افتتاحية مؤثرة وبشارة لكل من أثقلته الذنوب وأراد الرجوع إلى ربه ومولاه.",
  },
  {
    id: 2,
    title: "ففروا إلى الله.. كيف تبدأ رحلة التوبة؟",
    duration: "48 دقيقة",
    desc: "شرح خطوات الانخلاع من المعصية وصدق العزيمة في الإقبال على الله عز وجل.",
  },
  {
    id: 3,
    title: "شروط التوبة الصادقة وتطهير القلب",
    duration: "52 دقيقة",
    desc: "معالجة أمراض القلب من الغفلة والقسوة، وحقيقة الندم والاستغفار باللسان والجنان.",
  },
  {
    id: 4,
    title: "قصص العائدين ومواقف الباكين",
    duration: "60 دقيقة",
    desc: "نماذج مشرقة من توبة الصحابة والسلف الصالح، ومواقف الخوف والرجاء من الله.",
  },
  {
    id: 5,
    title: "عقبات في طريق التائبين وكيفية التغلب عليها",
    duration: "45 دقيقة",
    desc: "كيف يواجه التائب رفقاء السوء ووساوس الشيطان وضغوط النفس الأمارة بالسوء.",
  },
  {
    id: 6,
    title: "الثبات بعد التوبة.. وصايا عملية",
    duration: "50 دقيقة",
    desc: "زاد الطريق للمستقيمين: ورد القرآن، قيام الليل، صحبة الصالحين، والعمل الدعوي.",
  },
];

export default function MarhabanBiAlTaebeenPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ================= HEADER HERO ================= */}
        <div className="rounded-3xl bg-gradient-to-br from-[#864024] via-[#C0673F] to-[#6D341D] text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-[#DEA587]/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center shrink-0 border-4 border-[#F5E3D8]/40">
              <Image
                src="/logo-qalamuni-1.svg"
                alt="شعار اسطوانة مرحبا بالتائبين"
                width={120}
                height={120}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-4 text-center md:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                إصدار صوتي دعوي مبارك
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-white font-serif leading-tight">
                اسطوانة مرحبا بالتائبين
              </h1>

              <p className="text-sm sm:text-base text-[#F5E3D8] max-w-xl leading-relaxed">
                سلسلة الوعظ والتزكية المؤثرة لفضيلة الشيخ أبي ذر القلموني - حفظه
                الله - لبيان فضل التوبة، وبشارة العائدين، وأدوية القلوب الغافلة.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold">
                <span className="px-3.5 py-1.5 rounded-lg bg-black/20 text-white">
                  6 أشرطة ومحاضرات كاملة
                </span>
                <span className="px-3.5 py-1.5 rounded-lg bg-black/20 text-white">
                  جودة صوتية عالية
                </span>
                <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/80 text-white">
                  متاحة للتحميل والنشر
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PUBLISHING QUOTE ================= */}
        <div className="bg-[#FAF3EF] border-2 border-[#C0673F]/30 rounded-2xl p-6 text-center space-y-2">
          <p className="text-lg sm:text-xl font-black text-[#6D341D] font-serif">
            « هذه المواد من أراد أن ينشرها فلينشرها دون إذن وليتق الله فيها »
          </p>
          <p className="text-xs text-[#864024]">
            يمكنك نسخ هذه الاسطوانة وتوزيعها على التائبين والشباب بنية احتساب
            الأجر.
          </p>
        </div>

        {/* ================= AUDIO TRACKS LIST ================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-200 pb-3">
            <h2 className="text-xl font-black text-brand-950 flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-[#C0673F]" />
              <span>محتويات ومسارات الاسطوانة</span>
            </h2>
            <span className="text-xs text-gray-500 font-semibold">
              استماع فوري
            </span>
          </div>

          <div className="space-y-3.5">
            {DISC_TRACKS.map((track) => (
              <div
                key={track.id}
                className="bg-white rounded-2xl border border-brand-200/80 p-5 shadow-xs hover:border-[#C0673F] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF3EF] text-[#C0673F] font-black text-sm flex items-center justify-center shrink-0 border border-[#F5E3D8]">
                    {track.id}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-brand-900">
                      {track.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{track.desc}</p>
                    <span className="inline-block text-[11px] font-semibold text-gray-400 mt-2">
                      المدة التقديرية: {track.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#3F4A2B] hover:bg-[#343E23] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>استماع</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= BACK TO HOME ================= */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900 transition-colors"
          >
            <span>&rarr;</span>
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
