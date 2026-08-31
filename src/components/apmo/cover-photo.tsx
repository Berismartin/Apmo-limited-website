import { cn } from "@/lib/utils"

interface CoverPhotoProps {
  src: string
  alt: string
  className?: string
  /** Use eager only for above-the-fold photos. Everything else lazy-loads. */
  eager?: boolean
  objectPosition?: string
}

/** Full-bleed photo that does not depend on next/image `fill` sizing. */
export function CoverPhoto({
  src,
  alt,
  className,
  eager = false,
  objectPosition = "center",
}: CoverPhotoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{ objectPosition }}
    />
  )
}
