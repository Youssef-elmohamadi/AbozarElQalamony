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
    const sort = searchParams.get("sort") || "latest";

    // Forward to backend /api/quran
    const targetUrl = new URL(`${BASE_URL}/api/quran`);
    targetUrl.searchParams.set("page", page);
    targetUrl.searchParams.set("pageSize", pageSize);
    targetUrl.searchParams.set("sort", sort);
    if (categoryId && categoryId !== "all" && categoryId !== "0") {
      targetUrl.searchParams.set("categoryId", categoryId);
    }
    if (search && search.trim()) {
      targetUrl.searchParams.set("search", search.trim());
    }

    const res = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 86400,
        tags: ["quran", "quran-list"],
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

    const isOldest = sort === "oldest" || sort === "asc";
    const sortList = (list: any[]) => {
      return [...list].sort((a: any, b: any) => {
        const timeA = new Date(a.publishDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishDate || b.createdAt || 0).getTime();
        return isOldest ? timeA - timeB : timeB - timeA;
      });
    };

    if (data?.items && Array.isArray(data.items)) {
      const sorted = sortList(data.items);
      return NextResponse.json({
        items: sorted,
        totalCount: data.totalCount ?? sorted.length,
        page: data.page ?? Number(page),
        pageSize: data.pageSize ?? Number(pageSize),
        totalPages: data.totalPages ?? 1,
        hasNext: data.hasNext ?? false,
      });
    }

    return NextResponse.json({
      items: [],
      totalCount: 0,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: 0,
      hasNext: false,
    });
  } catch (error) {
    console.error("Public Quran lessons API error:", error);
    return NextResponse.json(
      { items: [], totalCount: 0, totalPages: 0, page: 1 },
      { status: 500 }
    );
  }
}
