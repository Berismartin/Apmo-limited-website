"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, X } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { useWishlistStore } from "@/store/wishlist"
import { formatPrice } from "@/lib/utils"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { toast } from "sonner"

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((s) => s.items)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title="Wishlist" />
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title="Wishlist" />
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love to find them easily later."
          actionLabel="Browse Products"
          actionHref="/shop"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Wishlist"
        description={`${wishlistItems.length} ${wishlistItems.length === 1 ? "item" : "items"}`}
      />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {wishlistItems.map((item) => (
          <div key={item.productId} className="group relative">
            <Link href={`/${item.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  src={item.image?.url ?? PLACEHOLDER_IMAGE}
                  alt={item.image?.alt ?? item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <div className="mt-3 pr-8">
                <h3 className="text-sm font-medium text-foreground group-hover:underline">
                  {item.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                removeItem(item.productId)
                toast("Removed from wishlist")
              }}
              className="absolute right-0 top-auto mt-[-3rem] mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-neutral-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Remove from wishlist"
            >
              <Heart className="h-4 w-4 fill-wishlist text-wishlist" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
