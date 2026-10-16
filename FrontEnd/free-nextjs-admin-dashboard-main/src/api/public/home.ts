import { PublicLesson, PublicSermon, PublicBook, PublicArticle } from "./content";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

export interface HomeCategory {
  id: number;
  name: string;
  type: number;
  typeName: string;
  parentId?: number | null;
  parentName?: string | null;
  lessonsCount: number;
  sermonsCount: number;
  booksCount: number;
  totalContentCount: number;
}

export interface SiteAlert {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface HomeLesson {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  youtubeVideoId?: string | null;
  durationMinutes?: number | null;
  durationInMinutes?: number | null;
  publishDate?: string | null;
  createdAt?: string | null;
  categoryId?: number;
  categoryName?: string | null;
}

export interface HomeSermon {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  youtubeVideoId?: string | null;
  durationMinutes?: number | null;
  durationInMinutes?: number | null;
  deliveryDate?: string | null;
  khutbahDate?: string | null;
  publishDate?: string | null;
  createdAt?: string | null;
  categoryId?: number;
  categoryName?: string | null;
}

export interface HomeBook {
  id: number;
  title: string;
  authorName?: string | null;
  author?: string | null;
  description?: string | null;
  coverImagePath?: string | null;
  pdfFilePath?: string | null;
  pagesCount?: number | null;
  publishYear?: number | null;
  publishDate?: string | null;
  createdAt?: string | null;
  categoryId?: number;
  categoryName?: string | null;
}

export interface HomeArticle {
  id: number;
  title: string;
  description?: string | null;
  body?: string | null;
  summary?: string | null;
  content?: string | null;
  thumbnailPath?: string | null;
  publishDate?: string | null;
  createdAt?: string | null;
  categoryId?: number;
  categoryName?: string | null;
}

export interface HomeData {
  topCategories: HomeCategory[];
  latestLessons: HomeLesson[];
  latestSermons: HomeSermon[];
  latestBooks: HomeBook[];
  latestArticles: HomeArticle[];
  activeAlerts: SiteAlert[];
}

export interface HomeQueryParams {
  topCategoriesCount?: number;
  latestLessonsCount?: number;
  latestSermonsCount?: number;
  latestBooksCount?: number;
  latestArticlesCount?: number;
  alertsCount?: number;
}

const FALLBACK_HOME_DATA: HomeData = {
  topCategories: [
    {
      id: 2,
      name: "سلاسل التزكية والرقائق",
      type: 2,
      typeName: "دروس وسلاسل علمية",
      parentId: null,
      parentName: null,
      lessonsCount: 9,
      sermonsCount: 0,
      booksCount: 0,
      totalContentCount: 9,
    },
    {
      id: 16,
      name: "مؤلفات فضيلة الشيخ أبو ذر",
      type: 1,
      typeName: "كتب ومؤلفات",
      parentId: null,
      parentName: null,
      lessonsCount: 0,
      sermonsCount: 0,
      booksCount: 8,
      totalContentCount: 8,
    },
    {
      id: 22,
      name: "خطب الجمعة المنبرية",
      type: 3,
      typeName: "خطب جمعة",
      parentId: null,
      parentName: null,
      lessonsCount: 0,
      sermonsCount: 5,
      booksCount: 0,
      totalContentCount: 5,
    },
    {
      id: 7,
      name: "شرح كتاب ففروا إلى الله",
      type: 2,
      typeName: "دروس وسلاسل علمية",
      parentId: 2,
      parentName: "سلاسل التزكية والرقائق",
      lessonsCount: 4,
      sermonsCount: 0,
      booksCount: 0,
      totalContentCount: 4,
    },
    {
      id: 19,
      name: "كتب التزكية والرقائق",
      type: 1,
      typeName: "كتب ومؤلفات",
      parentId: 16,
      parentName: "مؤلفات فضيلة الشيخ أبو ذر",
      lessonsCount: 0,
      sermonsCount: 0,
      booksCount: 4,
      totalContentCount: 4,
    },
    {
      id: 6,
      name: "أبحاث ودراسات فكرية معاصرة",
      type: 2,
      typeName: "دروس وسلاسل علمية",
      parentId: null,
      parentName: null,
      lessonsCount: 3,
      sermonsCount: 0,
      booksCount: 0,
      totalContentCount: 3,
    },
  ],
  latestLessons: [
    {
      id: 12,
      title: "الدرس 12: الاستعداد لمواسم الطاعات والنفحات الربانية",
      description: "درس تربوي مرقق عن كيفية استقبال شهر رمضان ومواسم الفضل بروح جديدة وهمة عالية.",
      durationMinutes: 60,
      categoryName: "أحكام الصيام والزكاة",
      categoryId: 2,
    },
    {
      id: 9,
      title: "الدرس 09: المحاسبة اليومية قبل فوات الأوان",
      description: "موقف عمر بن الخطاب رضي الله عنه: حاسبوا أنفسكم قبل أن تحاسبوا، خطوات تطبيقية للمحاسبة قبل المنام.",
      durationMinutes: 53,
      categoryName: "شرح كتاب ففروا إلى الله",
      categoryId: 7,
    },
    {
      id: 7,
      title: "الدرس 07: مفاتيح تدبر القرآن وأثره في إصلاح السلوك",
      description: "قواعد ذهبية لفتح مغاليق القلوب لآيات التنزيل، وتجاوز مجرد سرد الحروف إلى معايشة الروح والمعنى.",
      durationMinutes: 45,
      categoryName: "شرح كتاب ففروا إلى الله",
      categoryId: 7,
    },
    {
      id: 4,
      title: "الدرس 04: دواء قسوة القلوب وذكر هادم اللذات",
      description: "كيف تلين القلوب القاسية؟ وما أثر زيارة القبور وعيادة المرضى وتدبر آيات الوعيد في إحياء القلب الميت.",
      durationMinutes: 62,
      categoryName: "أمراض القلوب وعلاجها",
      categoryId: 2,
    },
  ],
  latestSermons: [
    {
      id: 6,
      title: "خطبة الجمعة: الاستعداد للرحيل وسؤال القبر",
      description: "تذكرة بظلمة اللحود ومقام اللذات وضرورة الاستكثار من الزاد ليوم المعاد وسؤال الملكين منكر ونكير.",
      categoryName: "خطب الموت والدار الآخرة",
      categoryId: 24,
    },
    {
      id: 5,
      title: "خطبة الجمعة القادمة: فضائل الصبر ومقامات الصابرين",
      description: "تذكرة بأهمية الصبر على طاعة الله تعالى والصبر عن معصيته والصبر على أقداره المؤلمة.",
      categoryName: "خطب الأخلاق والسلوك المجتمعي",
      categoryId: 22,
    },
    {
      id: 4,
      title: "خطبة الجمعة: ففروا إلى الله إن كنتم مؤمنين",
      description: "خطبة جامعة ومزلزلة في الحث على التوبة العاجلة والإقبال على الله في أزمنة الفتن والغفلة.",
      categoryName: "خطب التوبة والرجوع إلى الله",
      categoryId: 22,
    },
    {
      id: 3,
      title: "خطبة الجمعة: حلاوة الصلاة وخشوع الجوارح",
      description: "الصلاة معراج المؤمن وقرة عين النبي ﷺ، كيف نؤديها خاشعين لتنهانا عن الفحشاء والمنكر.",
      categoryName: "خطب الأخلاق والسلوك المجتمعي",
      categoryId: 22,
    },
  ],
  latestBooks: [
    {
      id: 10,
      title: "ففروا الى الله",
      authorName: "فضيلة الشيخ أبو ذر القلموني",
      categoryName: "كتب التزكية والرقائق",
      pdfFilePath: "/uploads/books/a6a31e4e-09f7-4f19-8eae-09aa82713faf.pdf",
      coverImagePath: "/uploads/books/01ea01e5-21c1-4a9a-a97e-48ab759e4579.jpeg",
    },
    {
      id: 8,
      title: "الميزان في معيار السلوك والإيمان",
      authorName: "فضيلة الشيخ أبو ذر القلموني",
      categoryName: "مؤلفات فضيلة الشيخ أبو ذر",
      pdfFilePath: "/uploads/books/sample.pdf",
    },
    {
      id: 7,
      title: "فقه الخشوع في الصلاة",
      authorName: "فضيلة الشيخ أبو ذر القلموني",
      categoryName: "مؤلفات فضيلة الشيخ أبو ذر",
      pdfFilePath: "/uploads/books/sample.pdf",
    },
    {
      id: 6,
      title: "أصلح قلبك وتدارك عمرك",
      authorName: "فضيلة الشيخ أبو ذر القلموني",
      categoryName: "مؤلفات فضيلة الشيخ أبو ذر",
      pdfFilePath: "/uploads/books/sample.pdf",
    },
  ],
  latestArticles: [
    {
      id: 3,
      title: "أسرار سورة الكهف ومنهج النجاة من الفتن الأربع",
      description: "وقفات تدبرية عميقة مع سورة الكهف وكيف رسمت للمؤمن خطة نجاة محكمة من فتن الدين والمال والعلم والسلطة.",
      publishDate: "2026-10-11T00:00:00",
    },
    {
      id: 2,
      title: "فضل مجالس الذكر وبركة صحبة الصالحين",
      description: "بيان ما أعده الله تعالى لأهل مجالس العلم والذكر من تنزل السكينة وغشيان الرحمة وحفوف الملائكة.",
      publishDate: "2026-10-12T00:00:00",
    },
    {
      id: 1,
      title: "علاج الهم والضيق بالقرآن الكريم والأذكار النبوية",
      description: "روشتة إيمانية من كتاب الله وهدي النبي ﷺ لكل مبتلى بالهم والحزن وضيق الصدر.",
      publishDate: "2026-10-07T00:00:00",
    },
  ],
  activeAlerts: [
    {
      id: 3,
      title: "جدول المحاضرات والدروس العلمية لشهر رمضان المبارك",
      content: "تم نشر جدول السلاسل الدعوية والإيمانية والمجالس القرآنية الخاصة بشهر رمضان المبارك في قسم الدروس والمحاضرات.",
      isActive: true,
      createdAt: "2026-10-12T21:48:37",
    },
    {
      id: 2,
      title: "صدور الطبعة الجديدة من كتاب «ففروا إلى الله»",
      content: "يسر إدارة الموقع الإعلان عن توفر الطبعة الجديدة المنقحة من كتاب «ففروا إلى الله» بصيغة PDF عالية الجودة مجاناً لجميع زوار المنصة.",
      isActive: true,
      createdAt: "2026-10-10T21:48:37",
    },
    {
      id: 1,
      title: "بث مباشر لدرس فضيلة الشيخ الأسبوعي",
      content: "تابعوا معنا الدرس الأسبوعي لفضيلة الشيخ أبو ذر القلموني كل يوم خميس بعد صلاة المغرب مباشرة عبر منصاتنا الرسمية.",
      isActive: true,
      createdAt: "2026-10-08T21:48:37",
    },
  ],
};

/**
 * Fetch aggregated home data for the public website from api/public/home (or api/home).
 * Retrieves top categories by content, latest lessons, sermons, books, articles, and active site alerts in a single call.
 */
export async function getPublicHomeData(
  params: HomeQueryParams = {},
  revalidate: number = 300 // 5 minutes cache
): Promise<HomeData> {
  try {
    const url = new URL(`${BASE_URL}/api/public/home`);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, String(val));
      }
    });

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate, tags: ["public-home"] },
    });

    if (!res.ok) {
      // Fallback try /api/home
      const altUrl = new URL(`${BASE_URL}/api/home`);
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          altUrl.searchParams.set(key, String(val));
        }
      });
      const altRes = await fetch(altUrl.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate, tags: ["public-home"] },
      });
      if (altRes.ok) {
        const altJson = await altRes.json();
        if (altJson?.data) return altJson.data;
      }
      return FALLBACK_HOME_DATA;
    }

    const json = await res.json();
    return json?.data || FALLBACK_HOME_DATA;
  } catch (error) {
    console.error("Error fetching public home data:", error);
    return FALLBACK_HOME_DATA;
  }
}
