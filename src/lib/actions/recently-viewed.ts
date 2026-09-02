"use server"

import { productRepository } from "@/lib/repositories"

export interface RecentlyViewedCatalogItem {
  productId: string
  slug: string
  name: string
  price: number
  imageUrl: string
  imageAlt: string
}

/** Live catalog thumbs for recently viewed rows that were saved without photos. */
export async function getRecentlyViewedCatalogAction(
  slugs: string[]
): Promise<RecentlyViewedCatalogItem[]> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))].slice(
    0,
    12
  )
  if (unique.length === 0) return []

  const products = await Promise.all(
    unique.map((slug) => productRepository.getBySlug(slug))
  )

  return products.flatMap((product) => {
    if (!product) return []
    const image = product.images[0]
    return [
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.variants[0]?.price ?? 0,
        imageUrl: image?.url ?? "",
        imageAlt: image?.alt ?? product.name,
      },
    ]
  })
}
