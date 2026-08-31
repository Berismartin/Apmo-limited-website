import { compactSlug } from "@/lib/utils"

export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

// Single source of truth for all navigation across desktop header,
// mobile menu, and anywhere else. Edit this one file to update all menus.

export const shopLinks: NavItem[] = [
  { name: "All Products", href: "/shop" },
  { name: "Haircare", href: "/haircare" },
  { name: "Scalp Care", href: "/scalp-care" },
  { name: "Ritual Kits", href: "/ritual-kits" },
  { name: "Styling", href: "/styling" },
]

/** Prefer live catalog slugs so header links don't 404, keep known shop items. */
export function shopLinksFromCategories(
  categories: { name: string; slug: string; parentId?: string; order: number }[]
): NavItem[] {
  const topLevel = categories
    .filter((category) => !category.parentId)
    .sort((a, b) => a.order - b.order)

  const byName = new Map(topLevel.map((category) => [category.name.toLowerCase(), category]))
  const byCompactSlug = new Map(
    topLevel.map((category) => [compactSlug(category.slug), category])
  )
  const fromNav = shopLinks
    .filter((item) => item.href !== "/shop")
    .map((item) => {
      const slug = item.href.replace(/^\//, "")
      const existing =
        byName.get(item.name.toLowerCase()) ?? byCompactSlug.get(compactSlug(slug))
      if (existing) return { name: existing.name, href: `/${existing.slug}` }
      return item
    })

  const usedHrefs = new Set(fromNav.map((item) => item.href))
  const usedCompacts = new Set(
    fromNav.map((item) => compactSlug(item.href.replace(/^\//, "")))
  )
  const extras = topLevel
    .filter((category) => {
      const href = `/${category.slug}`
      return !usedHrefs.has(href) && !usedCompacts.has(compactSlug(category.slug))
    })
    .map((category) => ({ name: category.name, href: `/${category.slug}` }))

  return [{ name: "All Products", href: "/shop" }, ...fromNav, ...extras]
}

export const infoLinks: NavItem[] = [
  { name: "About Apmo", href: "/about" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Blog", href: "/blog" },
  { name: "Wishlist", href: "/wishlist" },
]

export const mobileMenuSections: NavSection[] = [
  { label: "Shop", items: shopLinks },
  { label: "Info", items: infoLinks },
]
