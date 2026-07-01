"use client"

import {
  AnimatedCard,
  ProgressBar,
  Reveal,
  SectionHeading,
} from "@/components/apmo/animation"
import { services, timeline } from "@/components/apmo/data"

export function Services() {
  return (
    <section id="services" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Services"
            title="Guided care for every chapter"
            copy="A premium beauty site needs to do more than display products. It should guide decisions, create confidence, and make the next step effortless."
            align="left"
          />

          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
            {services.map((service, index) => (
              <AnimatedCard
                key={service.title}
                delay={index * 0.1}
                className="p-5 lg:grid lg:grid-cols-[auto_1fr] lg:gap-5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#351426] text-white">
                  <service.icon />
                </div>
                <div>
                  <h3 className="font-serif text-3xl italic tracking-[-0.04em]">
                    {service.title}
                  </h3>
                  <p className="mt-3 leading-7 text-[#6c4354]">{service.copy}</p>
                  <ProgressBar value={service.progress} />
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {timeline.map((item, index) => (
            <Reveal
              key={item.step}
              delay={index * 0.1}
              className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-b from-white to-rose-50/70 p-7 shadow-xl shadow-rose-950/5"
            >
              <span className="font-serif text-6xl italic text-rose-200">{item.step}</span>
              <h3 className="mt-8 font-serif text-3xl italic tracking-[-0.04em]">
                {item.title}
              </h3>
              <p className="mt-4 leading-7 text-[#6c4354]">{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
