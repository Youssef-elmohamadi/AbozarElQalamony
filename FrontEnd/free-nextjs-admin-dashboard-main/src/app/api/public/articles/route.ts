import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "12";
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";

    const targetUrl = new URL(`${BASE_URL}/api/Articles`);
    targetUrl.searchParams.set("Page", page);
    targetUrl.searchParams.set("PageSize", pageSize);
    targetUrl.searchParams.set("page", page);
    targetUrl.searchParams.set("pageSize", pageSize);
    targetUrl.searchParams.set("sort", sort);
    targetUrl.searchParams.set("Sort", sort);

    if (categoryId && categoryId !== "all" && categoryId !== "0") {
      targetUrl.searchParams.set("categoryId", categoryId);
    }

    if (search && search.trim()) {
      targetUrl.searchParams.set("search", search.trim());
      targetUrl.searchParams.set("Search", search.trim());
      targetUrl.searchParams.set("title", search.trim());
    }

    const res = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { items: [], totalCount: 0, totalPages: 0, page: Number(page) },
        { status: res.status }
      );
    }

    const json = await res.json();
    const data = json?.data;

    const isTestArticle = (item: any) => {
      const t = String(item?.title || "");
      const d = String(item?.description || "");
      return t.includes("تللت") || d.includes("تللت") || /test/i.test(t);
    };

    const isOldest = sort === "oldest" || sort === "asc";
    const filterAndSort = (list: any[]) => {
      let cleanList = list.filter((item) => !isTestArticle(item));
      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        cleanList = cleanList.filter((item) => {
          const t = String(item.title || "").toLowerCase();
          const d = String(item.description || "").toLowerCase();
          const b = String(item.body || "").toLowerCase();
          return t.includes(term) || d.includes(term) || b.includes(term);
        });
      }
      return [...cleanList].sort((a: any, b: any) => {
        const timeA = new Date(a.publishDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishDate || b.createdAt || 0).getTime();
        return isOldest ? timeA - timeB : timeB - timeA;
      });
    };

    if (data?.items && Array.isArray(data.items)) {
      const sorted = filterAndSort(data.items);
      const total = data.totalCount ?? sorted.length;
      return NextResponse.json({
        items: sorted,
        totalCount: total,
        page: data.page ?? data.pageNumber ?? Number(page),
        pageSize: data.pageSize ?? Number(pageSize),
        totalPages: data.totalPages ?? (Math.ceil(total / Number(pageSize)) || 1),
        hasNext: data.hasNext ?? false,
      });
    }

    const rawList = Array.isArray(data) ? data : [];
    const sorted = filterAndSort(rawList);
    return NextResponse.json({
      items: sorted,
      totalCount: sorted.length,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(sorted.length / Number(pageSize)) || 1,
      hasNext: false,
    });
  } catch (err: any) {
    console.error("API /api/public/articles route error:", err);
    return NextResponse.json(
      { items: [], totalCount: 0, totalPages: 0, page: 1, error: err?.message },
      { status: 500 }
    );
  }
}
