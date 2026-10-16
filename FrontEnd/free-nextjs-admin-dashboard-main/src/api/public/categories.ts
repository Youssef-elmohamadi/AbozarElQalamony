export interface Category {
  id: number;
  name: string;
  type: number;
  parentId?: number | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7281";

// Curated fallbacks in case the backend server is temporarily unavailable during SSR
const FALLBACK_CATEGORIES: Category[] = [
  { id: 16, name: "مؤلفات فضيلة الشيخ أبو ذر", type: 1, parentId: null },
  { id: 1, name: "دروس علمية", type: 2, parentId: null },
  { id: 2, name: "سلاسل التزكية والرقائق", type: 2, parentId: null },
  { id: 22, name: "خطب الجمعة المنبرية", type: 3, parentId: null },
  { id: 29, name: "مجالس تدبر القرآن العظيم", type: 4, parentId: null },
  { id: 3, name: "العقيدة وأصول الإيمان", type: 2, parentId: null },
  { id: 5, name: "السيرة النبوية والشمائل", type: 2, parentId: null },
  { id: 17, name: "رسائل ومطويات دعوية", type: 1, parentId: null },
  { id: 18, name: "فتاوى واستشارات دعوية", type: 1, parentId: null },
  { id: 12, name: "فقه الصلاة والخشوع", type: 2, parentId: null },
];

/**
 * Fetch all categories for public SSR rendering.
 * Does NOT require authentication tokens.
 * Uses Next.js ISR/caching tags with 1-hour revalidation.
 */
export async function getPublicCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/Categories/all`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 3600,
        tags: ["public-categories"],
      },
    });

    if (!res.ok) {
      console.warn(`Public categories fetch returned status ${res.status}, using fallback.`);
      return FALLBACK_CATEGORIES;
    }

    const json = await res.json();
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }

    return FALLBACK_CATEGORIES;
  } catch (error) {
    console.error("Error fetching public categories for SSR:", error);
    return FALLBACK_CATEGORIES;
  }
}
