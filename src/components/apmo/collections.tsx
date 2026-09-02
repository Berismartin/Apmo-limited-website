"use client"

import Link from "next/link"
import { collections, heroImages, modelImages } from "@/components/apmo/data"
import { CoverPhoto } from "@/components/apmo/cover-photo"
import { MagneticButton, Reveal, SectionHeading } from "@/components/apmo/animation"

export function Collections() {
  return (
    <section id="shop" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Shop by ritual"
          title="Hair, skin, body — on real people"
          copy="These are Apmo customers and models, not stock photos. Pick a collection and find the formula that fits your routine."
        />

        <div className="mt-14 grid auto-rows-[20rem] gap-5 md:grid-cols-4 md:auto-rows-[22rem]">
          {collections.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-rose-950/10 ${
                index === 0 ? "md:col-span-2 md:row-span-2 md:min-h-[46rem]" : "md:col-span-2"
              }`}
            >
              <CoverPhoto
                src={item.image}
                alt={`${item.name} by Apmo`}
                className="transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/75 via-[#351426]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-100">
                  Shop
                </p>
                <h3 className="mt-2 font-serif text-4xl italic tracking-[-0.04em] sm:text-5xl">
                  {item.name}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">{item.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LifestyleBanner() {
  return (
    <section className="relative isolate min-h-[28rem] overflow-hidden lg:min-h-[34rem]">
      <CoverPhoto
        src={heroImages.inRealLife}
        alt="Apmo model with textured hair and haircare products"
        objectPosition="center top"
      />
      <div className="absolute inset-0 bg-[#351426]/45" />
      <div className="relative mx-auto flex min-h-[28rem] max-w-7xl flex-col items-start justify-end px-4 py-16 sm:px-6 lg:min-h-[34rem] lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-100">
          In real life
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-5xl italic leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl">
          Care you can see on skin and strands.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
          From wash day to body butter, the people in these frames are using the
          same formulas you can shop today.
        </p>
        <div className="mt-8">
          <MagneticButton href="/shop">Shop all products</MagneticButton>
        </div>
      </div>
    </section>
  )
}

export function SoftPortraitBand() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-24 sm:px-6 lg:py-32">
      <div className="absolute inset-0">
        <CoverPhoto
          src={modelImages.hairLeaveIn}
          alt=""
          objectPosition="top"
          className="opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-[#fff8f1]/70" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
            Made to be worn
          </p>
          <h2 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.05em] text-[#351426] sm:text-6xl">
            Texture, skin, and the people who carry them.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#6c4354]">
            Apmo is built around real routines — coils, curls, glow, and family
            wash days — photographed with the people who live them.
          </p>
        </Reveal>
        <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white shadow-2xl shadow-rose-950/10">
          <CoverPhoto
            src={modelImages.bodyLooking}
            alt="Apmo body lotion held by a model"
          />
        </div>
      </div>
    </section>
  )
}
