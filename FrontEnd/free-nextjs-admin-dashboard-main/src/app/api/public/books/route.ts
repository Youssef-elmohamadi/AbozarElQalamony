import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://abuzarelqalamony.somee.com";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "12";
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const targetUrl = new URL(`${BASE_URL}/api/Books`);
    targetUrl.searchParams.set("page", page);
    targetUrl.searchParams.set("pageSize", pageSize);
    if (categoryId && categoryId !== "all" && categoryId !== "0") {
      targetUrl.searchParams.set("categoryId", categoryId);
    }
    if (search && search.trim()) {
      targetUrl.searchParams.set("search", search.trim());
      targetUrl.searchParams.set("title", search.trim());
    }

    const res = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 86400,
        tags: ["books", "books-list"],
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { items: [], totalCount: 0, totalPages: 0, page: Number(page) },
        { status: res.status }
      );
    }

    const json = await res.json();
    const data = json?.data;

    const applySort = (list: any[]) => {
      if (!sort) return list;
      const isOldest = sort === "oldest" || sort === "asc";
      return [...list].sort((a: any, b: any) => {
        const timeA = new Date(a.publishDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishDate || b.createdAt || 0).getTime();
        return isOldest ? timeA - timeB : timeB - timeA;
      });
    };

    if (data?.items && Array.isArray(data.items)) {
      const sorted = applySort(data.items);
      return NextResponse.json({
        items: sorted,
        totalCount: data.totalCount ?? sorted.length,
        page: data.page ?? Number(page),
        pageSize: data.pageSize ?? Number(pageSize),
        totalPages: data.totalPages ?? 1,
        hasNext: data.hasNext ?? false,
      });
    }

    const rawList = Array.isArray(data) ? data : [];
    const sorted = applySort(rawList);
    return NextResponse.json({
      items: sorted,
      totalCount: sorted.length,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(sorted.length / Number(pageSize)) || 1,
      hasNext: false,
    });
  } catch (err: any) {
    console.error("API /api/public/books route error:", err);
    return NextResponse.json(
      { items: [], totalCount: 0, totalPages: 0, page: 1, error: err?.message },
      { status: 500 }
    );
  }
}
