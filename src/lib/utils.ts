import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { siteConfig } from "@/lib/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  priceInCents: number,
  currency?: string
): string {
  const currentCurrency = currency ?? siteConfig.currency;
  const isZeroDecimal = currentCurrency.toUpperCase() === "UGX"; // Extend list if needed

  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: currentCurrency,
    minimumFractionDigits: isZeroDecimal ? 0 : undefined,
    maximumFractionDigits: isZeroDecimal ? 0 : undefined,
  }).format(priceInCents / 100)
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
