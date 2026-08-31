import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { siteConfig } from "@/lib/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCurrencyCode(currency?: string | null): string {
  const fallback = siteConfig.currency
  if (!currency) return fallback

  const match = currency.toUpperCase().match(/[A-Z]{3}/)
  if (!match) return fallback

  try {
    // Validate against Intl so bad codes never crash the UI
    new Intl.NumberFormat(siteConfig.locale, {
      style: "currency",
      currency: match[0],
    }).format(0)
    return match[0]
  } catch {
    return fallback
  }
}

export function formatPrice(
  priceInCents: number,
  currency?: string
): string {
  const currentCurrency = normalizeCurrencyCode(currency)
  const isZeroDecimal = currentCurrency === "UGX"

  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: currentCurrency,
    minimumFractionDigits: isZeroDecimal ? 0 : undefined,
    maximumFractionDigits: isZeroDecimal ? 0 : undefined,
  }).format(Number.isFinite(priceInCents) ? priceInCents / 100 : 0)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

/** Compare slugs ignoring hyphens/underscores, e.g. hair-care === haircare. */
export function compactSlug(value: string): string {
  return value.toLowerCase().replace(/[_-]/g, "")
}
