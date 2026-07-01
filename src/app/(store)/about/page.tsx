import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Apmo",
  description:
    "Learn about Apmo's premium textured haircare rituals, product education, and beauty philosophy.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
        About Apmo
      </p>
      <h1 className="mt-4 font-serif text-5xl italic tracking-[-0.05em] text-[#351426] sm:text-6xl">
        Haircare that feels personal, polished, and easy to trust.
      </h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Apmo is a textured haircare brand focused on moisture-first products,
          practical education, and confidence-led beauty rituals. The public
          website is coming soon, but the store is already structured around the
          experience customers need: discover products, understand routines, and
          contact the team for guidance.
        </p>
        <p>
          The brand language is warm, premium, and human. Apmo combines product
          care with salon-style consultation so customers can choose formulas
          that fit their texture, lifestyle, protective styles, and wash-day
          habits.
        </p>

        <h2 className="!mt-12 text-xl font-semibold text-foreground">
          What Apmo Believes
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Textured hair deserves products that are gentle, effective, and easy to use.</li>
          <li>Education should sit beside every product, not after the sale.</li>
          <li>Beauty experiences can feel luxurious without feeling distant.</li>
        </ul>

        <h2 className="!mt-12 text-xl font-semibold text-foreground">
          What You Can Do Here
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Browse Apmo haircare, scalp care, styling, and ritual kits.</li>
          <li>Open product pages with images, variants, cart actions, and details.</li>
          <li>Use search, wishlist, cart, checkout, FAQ, account, and contact routes.</li>
          <li>Reach out for product guidance while the full Apmo launch is being prepared.</li>
        </ul>

        <h2 className="!mt-12 text-xl font-semibold text-foreground">
          Need Guidance?
        </h2>
        <p>
          If you are unsure which product fits your hair story, start with a
          consultation or send the team a message.{" "}
          <Link href="/contact" className="underline hover:text-foreground">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
