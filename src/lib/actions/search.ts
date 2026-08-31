"use server"

import { productRepository } from "@/lib/repositories"
import type { Product } from "@/types"

/**
 * Product list for the Cmd+K quick-search popup. Goes through the shared
 * repository layer (Supabase in production, JSON fallback otherwise) so
 * results always match the live catalog — unlike the old hardcoded import
 * of src/data/products.json, which was a one-time snapshot that drifted out
 * of sync with anything added/edited/removed through the admin afterward.
 */
export async function getSearchableProductsAction(): Promise<Product[]> {
  const { items } = await productRepository.list(undefined, undefined, {
    page: 1,
    limit: 500,
  })
  return items.filter((p) => p.status === "active")
}
