import { compactSlug, slugify } from "@/lib/utils"

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
  { name: "Hair", href: "/hair" },
  { name: "Skin", href: "/skin" },
  { name: "Body", href: "/body" },
  { name: "Kids", href: "/kids" },
  { name: "Detergents", href: "/detergents" },
]

const NAV_ALIASES: Record<string, string[]> = {
  hair: ["hair", "haircare", "hair-care"],
  skin: ["skin", "skincare", "skin-care"],
  body: ["body", "bodycare", "body-care", "bodybath", "body-bath"],
  kids: ["kids", "kid", "children", "child", "baby"],
  detergents: ["detergents", "detergent", "laundry"],
}

function categoryTokens(category: { name: string; slug: string }) {
  return [
    compactSlug(category.slug),
    compactSlug(category.name),
    compactSlug(slugify(category.name)),
  ]
}

export function findCategoryForNav<T extends { name: string; slug: string }>(
  navName: string,
  categories: T[]
): T | undefined {
  const aliases = NAV_ALIASES[compactSlug(navName)] ?? [compactSlug(navName)]
  return categories.find((category) => {
    const tokens = categoryTokens(category)
    return aliases.some((alias) =>
      tokens.some(
        (token) =>
          token === alias || token.includes(alias) || alias.includes(token)
      )
    )
  })
}

/** Map the fixed shop nav to live catalog slugs. Never append extra categories. */
export function shopLinksFromCategories(
  categories: { name: string; slug: string; parentId?: string; order: number }[]
): NavItem[] {
  const topLevel = categories.filter((category) => !category.parentId)

  return shopLinks.map((item) => {
    if (item.href === "/shop") return item
    const existing = findCategoryForNav(item.name, topLevel)
    if (existing) return { name: item.name, href: `/${existing.slug}` }
    return item
  })
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
