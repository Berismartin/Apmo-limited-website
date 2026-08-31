import type { Metadata } from "next"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { modelImages } from "@/components/apmo/data"
import { EditorialHero } from "@/components/layout/editorial-hero"
import { testimonialRepository } from "@/lib/repositories"

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read what customers say about Apmo haircare products, rituals, and product guidance.",
}

const reviewHighlights = [
  { value: "4.9/5", label: "average product experience" },
  { value: "96%", label: "reported softer-feeling hair" },
  { value: "8k+", label: "hair journeys supported" },
]

export default async function TestimonialsPage() {
  const testimonials = await testimonialRepository.list()

  return (
    <div className="bg-[#fff8f1]">
      <EditorialHero
        eyebrow="Testimonials"
        title="Real hair stories, softer routines, brighter confidence."
        copy="Apmo is built around product care and practical education. These stories reflect the kind of warm, guided experience customers should feel across the full store."
        image={modelImages.hairWash}
        imageAlt="Wash-day ritual with Apmo moisturizing shampoo"
        primaryHref="/shop"
        primaryLabel="Shop Apmo products"
        secondaryHref="/contact"
        secondaryLabel="Share your question"
      />

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid gap-4 rounded-[2rem] border border-rose-100 bg-white/80 p-4 shadow-xl shadow-rose-950/5 backdrop-blur sm:grid-cols-3">
          {reviewHighlights.map((item) => (
            <div key={item.label} className="rounded-[1.5rem] bg-rose-50/70 p-6 text-center">
              <p className="font-serif text-4xl italic tracking-[-0.04em] text-[#351426]">
                {item.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6675]">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.id} className="border-rose-100 bg-white/90 shadow-xl shadow-rose-950/5">
              <CardContent className="p-6">
                <div
                  className="flex gap-1 text-amber-400"
                  aria-label={`${item.rating} star review`}
                >
                  {Array.from({ length: item.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 font-serif text-2xl italic leading-tight tracking-[-0.04em] text-[#351426]">
                  “{item.quote}”
                </blockquote>
                <div className="mt-8 border-t border-rose-100 pt-5">
                  <p className="font-semibold text-[#351426]">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
