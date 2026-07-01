"use client"

import { FiMail, FiMapPin, FiPhone } from "react-icons/fi"
import { ImageReveal, MagneticButton, Reveal, SectionHeading } from "@/components/apmo/animation"
import { imageAssets } from "@/components/apmo/data"

export function Contact() {
  return (
    <section id="contact" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="rounded-[2.5rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur-xl sm:p-10">
          <SectionHeading
            eyebrow="Contact"
            title="The cool thing is coming soon"
            copy="The reference site leads with a direct under-construction message and a contact path. This section keeps that conversion clear while giving the brand a more memorable launch presence."
            align="left"
          />

          <Reveal className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: FiMail, label: "Email", value: "hello@apmoug.com" },
              { icon: FiPhone, label: "Phone", value: "Available on request" },
              { icon: FiMapPin, label: "Studio", value: "Uganda" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-rose-100 bg-white/75 p-5">
                <item.icon className="text-rose-500" />
                <p className="mt-5 text-xs uppercase tracking-[0.24em] text-[#8f6675]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-[#5f3d4b]">{item.value}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-10 flex flex-col gap-4 sm:flex-row">
            <MagneticButton href="mailto:hello@apmoug.com">Email Apmo</MagneticButton>
            <MagneticButton href="/shop" variant="secondary">
              Shop products
            </MagneticButton>
          </Reveal>
        </div>

        <ImageReveal
          src={imageAssets.product}
          alt="Apmo product portrait"
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="min-h-[34rem]"
          parallax
        />
      </div>
    </section>
  )
}
