"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"
import { getRecentlyViewedCatalogAction } from "@/lib/actions/recently-viewed"
import { useRecentlyViewedStore } from "@/store/recently-viewed"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"

interface RecentlyViewedProps {
  excludeProductId?: string
}

export function RecentlyViewed({ excludeProductId }: RecentlyViewedProps) {
  const items = useRecentlyViewedStore((s) => s.items)
  const patchItems = useRecentlyViewedStore((s) => s.patchItems)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const visible = useMemo(
    () =>
      mounted
        ? items
            .filter((item) => item.productId !== excludeProductId)
            .slice(0, 6)
        : [],
    [mounted, items, excludeProductId]
  )
  const slugsKey = visible.map((item) => item.slug).join("|")

  useEffect(() => {
    if (!mounted || !slugsKey) return
    const slugs = slugsKey.split("|")
    let cancelled = false
    getRecentlyViewedCatalogAction(slugs)
      .then((fresh) => {
        if (!cancelled && fresh.length > 0) patchItems(fresh)
      })
      .catch(() => {
        // Keep the local snapshot if the catalog lookup fails.
      })
    return () => {
      cancelled = true
    }
  }, [mounted, slugsKey, patchItems])

  if (!mounted || visible.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold tracking-tight">Recently Viewed</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {visible.map((item) => (
          <Link
            key={item.productId}
            href={`/${item.slug}`}
            className="group shrink-0"
          >
            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-neutral-100">
              <AppImage
                src={item.imageUrl || PLACEHOLDER_IMAGE}
                alt={item.imageAlt || item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="128px"
              />
            </div>
            <p className="mt-2 w-32 truncate text-xs font-medium group-hover:underline">
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(item.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
