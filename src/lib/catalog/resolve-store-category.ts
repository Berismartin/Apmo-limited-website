import { findCategoryForNav, shopLinks } from "@/lib/navigation"
import { compactSlug, slugify } from "@/lib/utils"
import { categoryRepository } from "@/lib/repositories"
import type { Category } from "@/types"

/**
 * Resolve a storefront category slug to a catalog category.
 * Falls back to a lightweight placeholder for known shop nav links so
 * empty collections (e.g. /hair) render instead of a 404.
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

  const navItem = shopLinks.find((item) => {
    if (item.href === "/shop") return false
    return (
      item.href === `/${slug}` ||
      compactSlug(item.name) === wanted ||
      compactSlug(item.href.replace(/^\//, "")) === wanted
    )
  })
  if (!navItem) return null

  const fromNav = findCategoryForNav(navItem.name, listed)
  if (fromNav) return fromNav

  return {
    id: `nav-${slug}`,
    name: navItem.name,
    slug,
    description: "",
    order: 0,
  }
}
