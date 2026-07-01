import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { imageAssets } from "@/components/apmo/data"

export const metadata: Metadata = {
  title: "About Apmo",
  description:
    "Learn about Apmo's premium textured haircare rituals, product education, and beauty philosophy.",
}

export default function AboutPage() {
  return (
    <div className="bg-[#fff8f1]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
            About Apmo
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.05em] text-[#351426] sm:text-7xl">
            Haircare that feels personal, polished, and easy to trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6c4354]">
            Apmo is a textured haircare brand focused on moisture-first
            products, practical education, and confidence-led beauty rituals.
            Every product and page is designed to help customers understand what
            their hair needs before they buy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-[#351426] px-7 hover:bg-[#4b1c34]">
              <Link href="/shop">
                Shop products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-rose-200 px-7">
              <Link href="/contact">Ask for guidance</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-rose-950/10">
          <Image
            src={imageAssets.heroAlt}
            alt="Apmo haircare ritual"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/45 via-transparent to-transparent" />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Care Before Commerce",
              copy: "The store is built around helping customers understand products, routines, and realistic hair goals.",
            },
            {
              icon: Leaf,
              title: "Moisture-first Rituals",
              copy: "Apmo focuses on detangling, scalp comfort, softness, and easy maintenance for textured hair.",
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

        <div className="mt-12 rounded-[2rem] border border-rose-100 bg-white/80 p-6 shadow-xl shadow-rose-950/5 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
                What you can do here
              </p>
              <h2 className="mt-3 font-serif text-4xl italic tracking-[-0.05em] text-[#351426]">
                A working store for the full Apmo launch.
              </h2>
            </div>
            <ul className="grid gap-3 text-muted-foreground sm:grid-cols-2">
              <li>Browse Apmo haircare, scalp care, styling, and ritual kits.</li>
              <li>Open product pages with images, variants, cart actions, and details.</li>
              <li>Use search, wishlist, cart, checkout, FAQ, account, and contact routes.</li>
              <li>Read customer stories on the new testimonials page.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
