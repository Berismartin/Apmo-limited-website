import type { Metadata } from "next"
import { ApmoLandingPage } from "@/components/apmo/apmo-landing-page"

export const metadata: Metadata = {
  title: "Apmo — Premium Textured Haircare Rituals",
  description:
    "A cinematic recreation of Apmo's coming-soon website with premium textured haircare storytelling, product rituals, and a contact-led launch experience.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Apmo — Premium Textured Haircare Rituals",
    description:
      "A premium cinematic launch experience for Apmo's textured haircare products and services.",
    type: "website",
  },
  keywords: [
    "Apmo",
    "haircare",
    "textured hair",
    "natural hair products",
    "beauty brand",
    "Uganda haircare",
    "premium hair rituals",
  ],
}

export default function HomePage() {
  return <ApmoLandingPage />
}
