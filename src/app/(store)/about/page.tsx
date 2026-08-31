import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { modelImages } from "@/components/apmo/data"
import { EditorialHero } from "@/components/layout/editorial-hero"

export const metadata: Metadata = {
  title: "About Apmo",
  description:
    "Learn about Apmo's premium textured haircare rituals, product education, and beauty philosophy.",
}

export default function AboutPage() {
  return (
    <div className="bg-[#fff8f1]">
      <EditorialHero
        eyebrow="About Apmo"
        title="Hair, skin, and body care that feels personal."
        copy="Apmo is a moisture-first brand photographed with real people — not stock faces. Every formula is made to be understood before you buy."
        image={modelImages.bodyPair}
        imageAlt="Apmo model holding moisturizing lotion and body cream"
        primaryHref="/shop"
        primaryLabel="Shop products"
        secondaryHref="/contact"
        secondaryLabel="Ask for guidance"
      />

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Care Before Commerce",
              copy: "The store is built around helping customers understand products, routines, and realistic hair and skin goals.",
            },
            {
              icon: Leaf,
              title: "Moisture-first Rituals",
              copy: "Apmo focuses on detangling, softness, glow, and easy maintenance for textured hair and skin.",
            },
            {
              icon: Sparkles,
              title: "Premium, Not Distant",
              copy: "The brand should feel polished and elevated while still being warm, practical, and human.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-rose-100 bg-white/90 shadow-xl shadow-rose-950/5">
              <CardContent className="p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-6 font-serif text-3xl italic tracking-[-0.04em] text-[#351426]">
                  {item.title}
                </h2>
                <p className="mt-4 leading-7 text-muted-foreground">{item.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white shadow-2xl shadow-rose-950/10">
              <Image
                src={modelImages.hairLeaveIn}
                alt="Apmo model holding moisturizing leave-in conditioner"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
          </div>
          <div className="flex flex-col justify-center rounded-[2rem] border border-rose-100 bg-white/80 p-6 shadow-xl shadow-rose-950/5 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
              What you can do here
            </p>
            <h2 className="mt-3 font-serif text-4xl italic tracking-[-0.05em] text-[#351426]">
              Shop hair, skin, body, kids, and home care.
            </h2>
            <ul className="mt-6 grid gap-3 text-muted-foreground">
              <li>Browse collections for Hair, Skin, Body, Kids, and Detergents.</li>
              <li>Open product pages with images, variants, cart actions, and details.</li>
              <li>Use search, wishlist, cart, checkout, FAQ, account, and contact.</li>
              <li>Read customer stories on the testimonials page.</li>
            </ul>
            <Button asChild size="lg" className="mt-8 w-fit rounded-full bg-[#351426] px-7 hover:bg-[#4b1c34]">
              <Link href="/shop">
                Shop the collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
