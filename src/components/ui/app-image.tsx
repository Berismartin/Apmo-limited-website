import Image, { type ImageProps } from "next/image"
import { shouldUnoptimizeImage } from "@/lib/images"

/**
 * Drop-in next/image wrapper that skips Vercel optimization for Supabase
 * storage URLs (avoids INVALID_IMAGE_OPTIMIZE_REQUEST 400s).
 */
export function AppImage({ unoptimized, src, alt, ...props }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={unoptimized ?? shouldUnoptimizeImage(src)}
      {...props}
    />
  )
}
