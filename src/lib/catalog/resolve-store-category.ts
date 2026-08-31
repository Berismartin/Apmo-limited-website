import { shopLinks } from "@/lib/navigation"
import { compactSlug, slugify } from "@/lib/utils"
import { categoryRepository } from "@/lib/repositories"
import type { Category } from "@/types"

/**
 * Resolve a storefront category slug to a catalog category.
 * Falls back to a lightweight placeholder for known shop nav links so
 * empty collections (e.g. /haircare) render instead of a 404.
 */
export async function resolveStoreCategory(slug: string): Promise<Category | null> {
  try {
    const direct = await categoryRepository.getBySlug(slug)
    if (direct) return direct
  } catch {
    // Catalog lookup can fail when Supabase is misconfigured; still try list/nav.
  }

  let listed: Category[] = []
  try {
    listed = await categoryRepository.list()
  } catch {
    listed = []
  }

  const wanted = compactSlug(slug)
  const match = listed.find((category) => {
    return (
      compactSlug(category.slug) === wanted ||
      compactSlug(slugify(category.name)) === wanted
    )
  })
  if (match) return match

  const navItem = shopLinks.find(
    (item) => item.href === `/${slug}` && item.href !== "/shop"
  )
  if (!navItem) return null

  return {
    id: `nav-${slug}`,
    name: navItem.name,
    slug,
    description: "",
    order: 0,
  }
}
