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
  expiresAt?: string | null;
  isUrgent?: boolean;
  priority?: "low" | "medium" | "high" | string;
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

const EMPTY_HOME_DATA: HomeData = {
  topCategories: [],
  latestLessons: [],
  latestSermons: [],
  latestBooks: [],
  latestArticles: [],
  activeAlerts: [],
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
        next: { revalidate: 43200, tags: ["public-home"] },
      });
      if (altRes.ok) {
        const altJson = await altRes.json();
        if (altJson?.data) return altJson.data;
      }
      return EMPTY_HOME_DATA;
    }

    const json = await res.json();
    return json?.data || EMPTY_HOME_DATA;
  } catch (error) {
    console.error("Error fetching public home data:", error);
    return EMPTY_HOME_DATA;
  }
}
