"use client"

import { FiStar } from "react-icons/fi"
import { AnimatedCard, SectionHeading } from "@/components/apmo/animation"
import { testimonials } from "@/components/apmo/data"

export function Testimonials() {
  return (
    <section className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="Beauty that feels personal"
          copy="Premium does not have to feel distant. These cards are written to mirror the kind of trust-led social proof the launch site should invite."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <AnimatedCard key={item.name} delay={index * 0.1}>
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <FiStar key={starIndex} className="fill-current" />
                ))}
              </div>
              <blockquote className="mt-8 font-serif text-3xl italic leading-tight tracking-[-0.04em]">
                “{item.quote}”
              </blockquote>
              <div className="mt-8 border-t border-rose-100 pt-5">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-[#8f6675]">{item.role}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}
