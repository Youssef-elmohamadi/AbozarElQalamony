const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";

export interface PublicLesson {
  id: number;
  title: string;
  description?: string;
  audioFilePath?: string;
  videoFilePath?: string;
  thumbnailPath?: string;
  durationInMinutes?: number;
  publishDate?: string;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface PublicSermon {
  id: number;
  title: string;
  description?: string;
  audioFilePath?: string;
  videoFilePath?: string;
  thumbnailPath?: string;
  durationInMinutes?: number;
  deliveryDate?: string;
  publishDate?: string;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface PublicBook {
  id: number;
  title: string;
  author?: string;
  authorName?: string;
  description?: string;
  coverImagePath?: string;
  pdfFilePath?: string;
  pagesCount?: number;
  fileSizeInMB?: number;
  tableOfContents?: Array<{ title: string; page: number }>;
  tableOfContentsJson?: string;
  publishYear?: number;
  publishDate?: string;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface PublicArticle {
  id: number;
  title: string;
  content?: string;
  body?: string;
  description?: string | null;
  summary?: string | null;
  thumbnailPath?: string;
  publishDate?: string | null;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
  authorName?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

async function fetchPublicList<T>(
  endpoint: string,
  params: Record<string, any> = {},
  revalidate: number = 1800,
  tags: string[] = []
): Promise<PaginatedResult<T>> {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate, tags: tags.length > 0 ? tags : undefined },
    });

    if (!res.ok) {
      return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
    }

    const json = await res.json();
    const data = json?.data;

    const sortOrder = params.sort;
    const isTestItem = (item: any) => {
      const t = String(item?.title || "");
      const d = String(item?.description || "");
      return t.includes("تللت") || d.includes("تللت");
    };

    const applySort = (list: any[]) => {
      const filtered = list.filter((item) => !isTestItem(item));
      if (!sortOrder) return filtered;
      const isOldest = sortOrder === "oldest" || sortOrder === "asc";
      return [...filtered].sort((a: any, b: any) => {
        const timeA = new Date(a.publishDate || a.khutbahDate || a.deliveryDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishDate || b.khutbahDate || b.deliveryDate || b.createdAt || 0).getTime();
        return isOldest ? timeA - timeB : timeB - timeA;
      });
    };

    if (Array.isArray(data)) {
      const sorted = applySort(data);
      return {
        items: sorted,
        totalCount: sorted.length,
        pageNumber: 1,
        pageSize: sorted.length,
        totalPages: 1,
      };
    }

    if (data?.items && Array.isArray(data.items)) {
      const sorted = applySort(data.items);
      return {
        items: sorted,
        totalCount: data.totalCount ?? sorted.length,
        pageNumber: data.pageNumber ?? 1,
        pageSize: data.pageSize ?? 10,
        totalPages: data.totalPages ?? Math.ceil((data.totalCount ?? sorted.length) / 10),
      };
    }

    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
  } catch (err) {
    console.error(`Error fetching public endpoint ${endpoint}:`, err);
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
  }
}

export async function getPublicLessons(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
  sort?: string;
} = {}): Promise<PaginatedResult<PublicLesson>> {
  return fetchPublicList<PublicLesson>("/api/Lessons", params, 86400, ["lessons", "lessons-list"]);
}

export async function getPublicLessonById(id: number | string): Promise<PublicLesson | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/Lessons/${id}`, {
      headers: { Accept: "application/json" },
      next: {
        tags: ["lessons-list", "lessons", `lesson-${id}`],
        revalidate: 86400,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error(`Error fetching lesson by id ${id}:`, err);
    return null;
  }
}

export async function getPublicSermons(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
  sort?: string;
} = {}): Promise<PaginatedResult<PublicSermon>> {
  return fetchPublicList<PublicSermon>("/api/Sermons", params, 86400, ["sermons", "sermons-list"]);
}

export async function getPublicSermonById(id: number | string): Promise<PublicSermon | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/Sermons/${id}`, {
      headers: { Accept: "application/json" },
      next: {
        tags: ["sermons", "sermons-list", `sermon-${id}`],
        revalidate: 86400,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error(`Error fetching sermon by id ${id}:`, err);
    return null;
  }
}

export async function getPublicBooks(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
  sort?: string;
} = {}): Promise<PaginatedResult<PublicBook>> {
  return fetchPublicList<PublicBook>("/api/Books", params, 86400, ["books", "books-list"]);
}

export async function getPublicBookById(id: string | number): Promise<PublicBook | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  try {
    const res = await fetch(`${baseUrl}/api/Books/${id}`, {
      next: {
        tags: ["books", "books-list", `book-${id}`],
        revalidate: 86400,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (data && data.tableOfContentsJson && !data.tableOfContents) {
      try {
        data.tableOfContents = JSON.parse(data.tableOfContentsJson);
      } catch {
        // ignore parse error
      }
    }
    return data ?? null;
  } catch (err) {
    console.error(`Error fetching book by id ${id}:`, err);
    return null;
  }
}

export async function getPublicArticles(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
  sort?: string;
} = {}): Promise<PaginatedResult<PublicArticle>> {
  return fetchPublicList<PublicArticle>("/api/Articles", params);
}

export async function getPublicArticleById(id: string | number): Promise<PublicArticle | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  try {
    const res = await fetch(`${baseUrl}/api/Articles/${id}`, {
      next: {
        tags: ["articles", `articles-${id}`],
        revalidate: 86400,

      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error(`Error fetching article by id ${id}:`, err);
    return null;
  }
}

export interface PublicQuran {
  id: number;
  title: string;
  description?: string | null;
  audioFilePath?: string | null;
  videoFilePath?: string | null;
  thumbnailPath?: string | null;
  durationInMinutes?: number | null;
  surahNumber?: number | null;
  surahName?: string | null;
  publishDate?: string | null;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
}

export async function getPublicQuran(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
  sort?: string;
} = {}): Promise<PaginatedResult<PublicQuran>> {
  return fetchPublicList<PublicQuran>("/api/quran", params);
}

export async function getPublicQuranById(id: string | number): Promise<PublicQuran | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  try {
    const res = await fetch(`${baseUrl}/api/quran/${id}`, {
      next: {
        tags: ["quran", `quran-${id}`],
        revalidate: 86400,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error(`Error fetching quran item by id ${id}:`, err);
    return null;
  }
}

export interface PublicSearchCategory {
  id: number;
  name: string;
  type: number; // 1: Book, 2: Lesson, 3: Sermon, 4: Quran
  parentId?: number | null;
}

export interface PublicSearchAlert {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface GlobalSearchResult {
  query: string;
  sort: string;
  totalResults: number;
  categories: PublicSearchCategory[];
  lessons: PublicLesson[];
  sermons: PublicLesson[];
  books: PublicBook[];
  quran: PublicQuran[];
  articles: PublicArticle[];
  alerts: PublicSearchAlert[];
}

export async function getGlobalSearch(params: {
  q?: string;
  sort?: string;
  limitPerSection?: number;
  section?: string;
} = {}): Promise<GlobalSearchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";
  const url = new URL(`${baseUrl}/api/search`);

  if (params.q) url.searchParams.set("q", params.q.trim());
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.limitPerSection) url.searchParams.set("limitPerSection", String(params.limitPerSection));
  if (params.section) url.searchParams.set("section", params.section);

  try {
    const res = await fetch(url.toString(), {
      next: {
        tags: ["search", `search-${params.q || ""}`],
        revalidate: 30,
      },
    });

    if (!res.ok) {
      return {
        query: params.q || "",
        sort: params.sort || "latest",
        totalResults: 0,
        categories: [],
        lessons: [],
        sermons: [],
        books: [],
        quran: [],
        articles: [],
        alerts: [],
      };
    }

    const json = await res.json();
    const data = json?.data;

    return {
      query: data?.query || params.q || "",
      sort: data?.sort || params.sort || "latest",
      totalResults: data?.totalResults || 0,
      categories: data?.categories || [],
      lessons: data?.lessons || [],
      sermons: data?.sermons || [],
      books: data?.books || [],
      quran: data?.quran || [],
      articles: data?.articles || [],
      alerts: data?.alerts || [],
    };
  } catch (err) {
    console.error("Error executing global search:", err);
    return {
      query: params.q || "",
      sort: params.sort || "latest",
      totalResults: 0,
      categories: [],
      lessons: [],
      sermons: [],
      books: [],
      quran: [],
      articles: [],
      alerts: [],
    };
  }
}



