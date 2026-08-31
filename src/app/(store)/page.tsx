import type { Metadata } from "next"
import { ApmoLandingPage } from "@/components/apmo/apmo-landing-page"
import { testimonialRepository } from "@/lib/repositories"

export const metadata: Metadata = {
  title: "Apmo — Premium Textured Haircare Rituals",
  description:
    "Shop Apmo's premium textured haircare rituals — moisture-first products, practical hair education, and confidence-led beauty routines.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Apmo — Premium Textured Haircare Rituals",
    description:
      "Moisture-first haircare products, practical hair education, and confidence-led beauty routines from Apmo.",
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

export default async function HomePage() {
  const testimonials = await testimonialRepository.list({ featuredOnly: true })
  return <ApmoLandingPage testimonials={testimonials} />
}
