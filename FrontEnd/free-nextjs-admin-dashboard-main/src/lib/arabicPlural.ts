/**
 * Arabic Pluralization & Counting Helper using Intl.PluralRules('ar')
 * Adheres to standard Arabic grammatical rules and unifies numerical presentation.
 */

const arPluralRules = new Intl.PluralRules("ar");

export interface PluralForms {
  zero?: string;
  one: string;
  two: string;
  few: string;  // 3-10
  many: string; // 11-99
  other: string; // 100, 1000, etc.
}

export function formatArabicPlural(count: number, forms: PluralForms): string {
  const rule = arPluralRules.select(count);
  switch (rule) {
    case "zero":
      return forms.zero || forms.other.replace("{n}", String(count));
    case "one":
      return forms.one;
    case "two":
      return forms.two;
    case "few":
      return forms.few.replace("{n}", String(count));
    case "many":
      return forms.many.replace("{n}", String(count));
    case "other":
    default:
      return forms.other.replace("{n}", String(count));
  }
}

/**
 * Format reading time according to Arabic counting rules:
 * 1 -> "دقيقة واحدة"
 * 2 -> "دقيقتان"
 * 3..10 -> "X دقائق"
 * 11+ -> "X دقيقة"
 */
export function formatReadingTime(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  return formatArabicPlural(m, {
    zero: "أقل من دقيقة",
    one: "دقيقة واحدة",
    two: "دقيقتان",
    few: "{n} دقائق",
    many: "{n} دقيقة",
    other: "{n} دقيقة",
  });
}

/**
 * Format articles count according to Arabic rules:
 * 1 -> "مقال واحد"
 * 2 -> "مقالان"
 * 3..10 -> "X مقالات" (e.g. "7 مقالات")
 * 11+ -> "X مقالاً"
 */
export function formatArticlesCount(count: number): string {
  return formatArabicPlural(count, {
    zero: "لا توجد مقالات",
    one: "مقال واحد",
    two: "مقالان",
    few: "{n} مقالات",
    many: "{n} مقالاً",
    other: "{n} مقال",
  });
}

/**
 * Unified Arabic Date Formatter with standard Latin digits (1, 2, 3...)
 * Returns e.g. "14 أكتوبر 2026"
 */
export function formatArabicDate(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}
