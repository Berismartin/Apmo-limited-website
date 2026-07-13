import type { ImageProps } from "next/image"

/**
 * Supabase storage images are already resized/compressed on upload.
 * Next.js 16 + Vercel image optimization often returns 400
 * (INVALID_IMAGE_OPTIMIZE_REQUEST) for these hosts, so skip the optimizer.
 */
export function shouldUnoptimizeImage(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false
  if (src.startsWith("blob:") || src.startsWith("data:")) return true
  try {
    const url = new URL(src, "http://localhost")
    return url.hostname.endsWith(".supabase.co")
  } catch {
    return false
  }
}
