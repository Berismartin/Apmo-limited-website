"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { portfolio } from "@/components/apmo/data"
import { SectionHeading } from "@/components/apmo/animation"

export function Portfolio() {
  return (
    <section id="portfolio" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Gallery"
          title="Warm scenes, tactile rituals, real people"
          copy="The gallery behaves like a slow-moving editorial spread: layered compositions, hover scaling, and enough restraint for the photography to lead."
        />

        <div className="mt-14 grid auto-rows-[22rem] gap-5 md:grid-cols-4">
          {portfolio.map((item, index) => (
            <motion.figure
              key={item.title}
              className={`group relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-rose-950/10 ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              } ${index === 3 ? "md:col-span-2" : ""}`}
              initial={{ opacity: 0, y: 38, clipPath: "inset(12% round 2rem)" }}
              whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% round 2rem)" }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.88, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/70 via-transparent to-transparent" />
              <figcaption className="absolute bottom-5 left-5 right-5 font-serif text-3xl italic tracking-[-0.04em] text-white">
                {item.title}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
