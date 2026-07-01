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
  announcement: "Apmo Website is coming soon — contact us for product guidance.",

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
    twitter: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
  },

  // Shipping
  freeShippingThreshold: 7500, // in cents ($75.00)
  taxRate: 0.08, // 8%

  // Currency & locale
  currency: "USD",
  locale: "en-US",

  // Legal
  copyrightYear: new Date().getFullYear(),
} as const

export type SiteConfig = typeof siteConfig
