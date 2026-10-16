const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

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
  description?: string;
  coverImagePath?: string;
  pdfFilePath?: string;
  pagesCount?: number;
  publishYear?: number;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface PublicArticle {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  thumbnailPath?: string;
  publishDate?: string;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
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
  revalidate: number = 1800
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
      next: { revalidate },
    });

    if (!res.ok) {
      return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
    }

    const json = await res.json();
    const data = json?.data;

    if (Array.isArray(data)) {
      return {
        items: data,
        totalCount: data.length,
        pageNumber: 1,
        pageSize: data.length,
        totalPages: 1,
      };
    }

    if (data?.items && Array.isArray(data.items)) {
      return {
        items: data.items,
        totalCount: data.totalCount ?? data.items.length,
        pageNumber: data.pageNumber ?? 1,
        pageSize: data.pageSize ?? 10,
        totalPages: data.totalPages ?? Math.ceil((data.totalCount ?? data.items.length) / 10),
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
} = {}): Promise<PaginatedResult<PublicLesson>> {
  return fetchPublicList<PublicLesson>("/api/Lessons", params);
}

export async function getPublicSermons(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
} = {}): Promise<PaginatedResult<PublicSermon>> {
  return fetchPublicList<PublicSermon>("/api/Sermons", params);
}

export async function getPublicBooks(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
} = {}): Promise<PaginatedResult<PublicBook>> {
  return fetchPublicList<PublicBook>("/api/Books", params);
}

export async function getPublicArticles(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
} = {}): Promise<PaginatedResult<PublicArticle>> {
  return fetchPublicList<PublicArticle>("/api/Articles", params);
}
