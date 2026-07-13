import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { imageAssets } from "@/components/apmo/data"
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
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
            Testimonials
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.05em] text-[#351426] sm:text-7xl">
            Real hair stories, softer routines, brighter confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6c4354]">
            Apmo is built around product care and practical education. These
            stories reflect the kind of warm, guided experience customers should
            feel across the full store.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-[#351426] px-7 hover:bg-[#4b1c34]">
              <Link href="/shop">Shop Apmo products</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-rose-200 px-7">
              <Link href="/contact">Share your question</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-rose-950/10">
          <Image
            src={imageAssets.salon}
            alt="Apmo customers and team smiling together"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/60 via-transparent to-transparent" />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
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
