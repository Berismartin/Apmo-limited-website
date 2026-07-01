"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MagneticButton, SectionHeading } from "@/components/apmo/animation"
import { products } from "@/components/apmo/data"

export function Products() {
  return (
    <section id="products" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Products"
            title="Premium formulas, cinematic presence"
            copy="The product experience uses tactile photography, soft shadows, and editorial motion so every formula feels considered before a visitor ever reaches checkout."
            align="left"
          />
          <MagneticButton href="/shop" variant="secondary" className="w-fit">
            Shop all products
          </MagneticButton>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.article
              key={product.name}
              className="group relative overflow-hidden rounded-[2.4rem] border border-rose-100 bg-white/85 p-4 shadow-2xl shadow-rose-950/10 backdrop-blur-xl"
              initial={{ opacity: 0, y: 48, filter: "blur(14px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              whileHover={{ y: -10 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.82, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-[30rem] overflow-hidden rounded-[1.8rem] bg-[#13070e]">
                <Image
                  src={product.image}
                  alt={`${product.name} by Apmo`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/62 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#351426] backdrop-blur-xl">
                  {product.category}
                </div>
              </div>
              <div className="p-3 pt-6">
                <h3 className="font-serif text-4xl italic tracking-[-0.05em]">
                  {product.name}
                </h3>
                <p className="mt-4 leading-7 text-[#6c4354]">{product.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
