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

export const accountLinks: NavItem[] = [
  { name: "My Account", href: "/account" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Orders", href: "/account/orders" },
]

export const infoLinks: NavItem[] = [
  { name: "About Apmo", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Blog", href: "/blog" },
  { name: "Pages", href: "/pages" },
]

export const mobileMenuSections: NavSection[] = [
  { label: "Shop", items: shopLinks },
  { label: "Account", items: accountLinks },
  { label: "Info", items: infoLinks },
]
