export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;

  // If it's an uploaded asset, use relative path so Next.js proxies it through /uploads/... over HTTPS
  if (normalized.startsWith("/uploads/")) {
    return normalized;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://abo-zar.runasp.net";
  return `${baseUrl}${normalized}`;
}

