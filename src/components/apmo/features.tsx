"use client"

import { AnimatedCard, SectionHeading } from "@/components/apmo/animation"
import { features } from "@/components/apmo/data"

export function Features() {
  return (
    <section className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="The experience"
          title="Soft power for textured hair"
          copy="Every interaction is designed to feel refined, useful, and human: a premium brand moment without losing the warmth of a personal consultation."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={index * 0.1}>
              <feature.icon className="h-7 w-7 text-rose-500" />
              <h3 className="mt-8 font-serif text-3xl italic tracking-[-0.04em]">
                {feature.title}
              </h3>
              <p className="mt-4 leading-7 text-[#6c4354]">{feature.copy}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}
