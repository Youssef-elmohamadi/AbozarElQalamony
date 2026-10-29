import React from "react";
import type { Metadata } from "next";
import PublicHeader from "@/components/public/header/PublicHeader";
import PublicFooter from "@/components/public/footer/PublicFooter";
import AudioProviderWrapper from "@/components/public/AudioProviderWrapper";
import { getPublicCategories } from "@/api/public/categories";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sheikh-abozar.com";
const YOUTUBE_URL = "https://www.youtube.com/@abuzaralqalamoni";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني",
    template: "%s | منصة الشيخ أبو ذر القلموني",
  },
  description:
    "الموقع العلمي والدعوي الرسمي لفضيلة الشيخ أبي ذر القلموني - دروس علمية، خطب الجمعة المنبرية، مؤلفات وكتب، مقالات، واسطوانة مرحبا بالتائبين.",
  keywords: [
    "الشيخ أبو ذر القلموني",
    "أبو ذر القلموني",
    "اسطوانة مرحبا بالتائبين",
    "ففروا إلى الله",
    "دروس دينية",
    "خطب الجمعة",
    "تزكية ورقائق",
    "كتب إسلامية",
    "مواعظ وبكاء",
    "محاضرات صوتية ومرئية",
  ],
  authors: [{ name: "فضيلة الشيخ أبو ذر القلموني" }],
  creator: "منصة فضيلة الشيخ أبو ذر القلموني",
  publisher: "منصة فضيلة الشيخ أبو ذر القلموني",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo-qalamuni-1.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo-qalamuni-1.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/",
    siteName: "الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني",
    title: "الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني",
    description:
      "الموقع العلمي والدعوي الرسمي لفضيلة الشيخ أبي ذر القلموني - دروس، خطب، كتب، ومقالات إسلامية.",
    images: [
      {
        url: "/logo-qalamuni-1.svg",
        width: 800,
        height: 600,
        alt: "شعار فضيلة الشيخ أبو ذر القلموني",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "الموقع الرسمي لفضيلة الشيخ أبو ذر القلموني",
    description:
      "الموقع العلمي والدعوي الرسمي لفضيلة الشيخ أبي ذر القلموني - خطب، دروس، مؤلفات، واسطوانة مرحبا بالتائبين.",
    images: ["/logo-qalamuni-1.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR: Fetch categories on server for layout navigation
  const categories = await getPublicCategories();

  // JSON-LD Structured Data for high Google/SEO ranking
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "منصة فضيلة الشيخ أبو ذر القلموني",
        description:
          "الموقع العلمي والدعوي الرسمي لفضيلة الشيخ أبي ذر القلموني",
        inLanguage: "ar",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#sheikh`,
        name: "فضيلة الشيخ أبو ذر القلموني",
        alternateName: "عبد المنعم أحمد سلطان",
        jobTitle: "عالم وداعية إسلامي ومؤلف",
        description:
          "عالم وداعية إسلامي مصري، صاحب كتاب ففروا إلى الله واسطوانة مرحبا بالتائبين، معتني بالتزكية والرقائق وعلوم الشريعة.",
        sameAs: [YOUTUBE_URL],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF5] text-brand-950 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AudioProviderWrapper>
        <PublicHeader categories={categories} youtubeUrl={YOUTUBE_URL} />
        <main className="flex-1 w-full">{children}</main>
        <PublicFooter youtubeUrl={YOUTUBE_URL} />
      </AudioProviderWrapper>
    </div>
  );
}

