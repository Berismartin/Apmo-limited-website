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
