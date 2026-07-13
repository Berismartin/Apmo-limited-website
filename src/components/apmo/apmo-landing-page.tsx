"use client"

import {
  AmbientBackground,
  CursorGlow,
  SectionDivider,
  SmoothScroll,
} from "@/components/apmo/animation"
import { About } from "@/components/apmo/about"
import { Contact } from "@/components/apmo/contact"
import { FAQ } from "@/components/apmo/faq"
import { Features } from "@/components/apmo/features"
import { Hero } from "@/components/apmo/hero"
import { Portfolio } from "@/components/apmo/portfolio"
import { Products } from "@/components/apmo/products"
import { Services } from "@/components/apmo/services"
import { Testimonials } from "@/components/apmo/testimonials"
import type { Testimonial } from "@/types"

interface ApmoLandingPageProps {
  testimonials?: Testimonial[]
}

export function ApmoLandingPage({ testimonials = [] }: ApmoLandingPageProps) {
  return (
    <SmoothScroll>
      <div className="relative isolate min-h-screen overflow-hidden bg-[#fff8f1] text-[#351426]">
        <AmbientBackground />
        <CursorGlow />
        <div>
          <Hero />
          <SectionDivider />
          <Features />
          <About />
          <SectionDivider />
          <Services />
          <Products />
          <Portfolio />
          <Testimonials items={testimonials} />
          <FAQ />
          <Contact />
        </div>
      </div>
    </SmoothScroll>
  )
}
