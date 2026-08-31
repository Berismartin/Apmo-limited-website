// ============================================================================
// Store Configuration — Single source of truth for all store-wide settings.
// Edit this file to customize the store name, contact info, social links, etc.
// ============================================================================

export const siteConfig = {
  // Branding
  name: "Apmo",
  tagline: "Premium textured haircare rituals.",
  description:
    "Apmo creates premium textured haircare rituals, product education, and confidence-first beauty experiences.",

  // Announcement bar (set to "" to hide)
  announcement: "",

  // URLs
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",

  // Contact
  contact: {
    email: "hello@apmoug.com",
    phone: "",
    address: {
      street: "",
      suite: "",
      city: "",
      state: "",
      zip: "",
    },
  },

  // Social links (set to "" to hide)
  social: {
    instagram: "https://www.instagram.com/apmo_cosmetics?igsi=MXM3dzd6Zm9rcjVyaw==",
    facebook: "https://www.facebook.com/share/1BqKigfBTP/?mibextid=wwXIfr",
    tiktok: "https://www.tiktok.com/@apmocosmetics?_r=1&_t=ZS-99LCthEWzSC",
  },

  // Shipping
  freeShippingThreshold: 15000000, // in cents-equivalent (UGX 150,000)
  taxRate: 0.08, // 8%

  // Currency & locale
  currency: "UGX",
  locale: "en-UG",

  // Legal
  copyrightYear: new Date().getFullYear(),
} as const

export type SiteConfig = typeof siteConfig
