"use client"

import { ImageReveal, Reveal, SectionHeading } from "@/components/apmo/animation"
import { imageAssets } from "@/components/apmo/data"

export function About() {
  return (
    <section id="about" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <SectionHeading
            eyebrow="About Apmo"
            title="A beauty house built around care, education, and glow"
            copy="The current public site announces that something cool is coming. This recreation expands that launch moment into a richer editorial story while keeping the promise direct: learn, connect, and contact the team."
            align="left"
          />
          <Reveal className="mt-10 rounded-[2rem] border border-rose-100 bg-white/80 p-6 leading-8 text-[#6c4354] shadow-xl shadow-rose-950/5 backdrop-blur-xl">
            Apmo’s visual language draws from warm salon interiors, burgundy
            accents, botanical product cues, and intimate portraiture. The
            experience should feel close enough to trust and polished enough to
            remember.
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr] sm:items-end">
          <ImageReveal
            src={imageAssets.founder}
            alt="Apmo founder presenting a haircare product"
            fill
            sizes="(max-width: 768px) 100vw, 32vw"
            className="h-[28rem]"
            parallax
          />
          <ImageReveal
            src={imageAssets.salon}
            alt="Apmo community haircare portrait"
            fill
            sizes="(max-width: 768px) 100vw, 42vw"
            className="h-[36rem]"
            parallax
          />
        </div>
      </div>
    </section>
  )
}
