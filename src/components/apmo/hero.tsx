"use client"

import Image from "next/image"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"
import {
  CountUp,
  MagneticButton,
  Reveal,
  SplitHeading,
} from "@/components/apmo/animation"
import { imageAssets, stats, trustMarks } from "@/components/apmo/data"

const heroEase = [0.22, 1, 0.36, 1] as const

const intro: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(12px)" },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 1.05 + index * 0.12,
      duration: 0.82,
      ease: heroEase,
    },
  }),
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || !heroRef.current || !imageRef.current) return

    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: 12,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    }, heroRef)

    return () => context.revert()
  }, [reduceMotion])

  return (
    <section
      ref={heroRef}
      className="relative isolate flex min-h-[calc(100vh-4rem)] overflow-hidden bg-[#fff8f1] px-4 py-20 text-[#351426] sm:px-6 lg:items-center"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(244,114,182,0.22),transparent_34%),radial-gradient(circle_at_78%_10%,rgba(251,191,36,0.22),transparent_32%),linear-gradient(145deg,#fff8f1_18%,#fff0e5_54%,#ffffff_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-52 bg-gradient-to-t from-white to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="relative z-10">
          <motion.p
            className="inline-flex rounded-full border border-rose-200 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 backdrop-blur-xl"
            variants={intro}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            Premium textured hair rituals
          </motion.p>

          <SplitHeading
            as="h1"
            text="Beauty that moves with your hair story"
            className="mt-7 max-w-5xl font-serif text-6xl italic leading-[0.84] tracking-[-0.07em] text-[#351426] sm:text-7xl lg:text-[7.8rem]"
          />

          <motion.p
            className="mt-7 max-w-2xl text-base leading-8 text-[#6c4354] sm:text-lg"
            variants={intro}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            Apmo is preparing a warm, product-led beauty destination for haircare
            education, nourishing formulas, and confidence-first rituals. The
            reference site is under construction, so this launch experience turns
            the same simple promise into a cinematic digital storefront.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-4 sm:flex-row"
            variants={intro}
            initial="hidden"
            animate="visible"
            custom={6}
          >
            <MagneticButton href="/shop">Shop Haircare</MagneticButton>
            <MagneticButton href="/contact" variant="secondary">
              Contact Us
            </MagneticButton>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={1.3 + index * 0.1}
                className="rounded-3xl border border-rose-100 bg-white/75 p-5 shadow-xl shadow-rose-950/5 backdrop-blur-xl"
              >
                <p className="font-serif text-4xl italic tracking-[-0.04em]">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[#8f6675]">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <motion.div
          className="relative min-h-[36rem] lg:min-h-[44rem]"
          initial={{ opacity: 0, scale: 0.96, filter: "blur(18px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 1.05, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            ref={imageRef}
            className="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_34px_120px_rgba(159,51,100,0.18)] will-change-transform"
          >
            <Image
              src={imageAssets.hero}
              alt="Apmo product ritual with natural haircare products"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/42 via-transparent to-transparent" />
          </div>

          <motion.div
            className="absolute -left-4 top-12 hidden w-44 rounded-[2rem] border border-white bg-white/85 p-3 shadow-2xl shadow-rose-950/15 backdrop-blur-xl sm:block"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.65, duration: 0.8 }}
          >
            <div className="relative h-44 overflow-hidden rounded-[1.4rem]">
              <Image
                src={imageAssets.heroAlt}
                alt="Apmo haircare service moment"
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
          </motion.div>

          <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-xl shadow-rose-950/10 backdrop-blur-2xl">
            <div className="grid gap-3 sm:grid-cols-3">
              {trustMarks.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-[#5f3d4b]">
                  <item.icon className="text-rose-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
