import type { MetadataRoute } from "next";
import { getPublicCategories } from "@/api/public/categories";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sheikh-abozar.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getPublicCategories();

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/categories/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/marhaban-bi-al-taebeen`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  return [...staticEntries, ...categoryEntries];
}
