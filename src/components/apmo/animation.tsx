"use client"

import Image, { type ImageProps } from "next/image"
import { shouldUnoptimizeImage } from "@/lib/images"
import Link from "next/link"
import Lenis from "lenis"
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { FiArrowUpRight } from "react-icons/fi"
import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reduceMotion])

  return children
}

export function LoadingScreen() {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[200] grid place-items-center bg-[#fff7ef]"
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ delay: 1.15, duration: 0.9, ease }}
    >
      <motion.div
        className="relative flex h-36 w-36 items-center justify-center rounded-full border border-rose-200/70 bg-white text-[#371323] shadow-[0_0_80px_rgba(244,114,182,0.28)] backdrop-blur-xl"
        initial={{ clipPath: "inset(50% 0 50% 0)", filter: "blur(12px)" }}
        animate={{ clipPath: "inset(0% 0 0% 0)", filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease }}
      >
        <span className="font-serif text-4xl italic tracking-tight">Apmo</span>
      </motion.div>
    </motion.div>
  )
}

export function PageTransitionOverlay() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[150] h-screen origin-top bg-[#fff1e7]"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease }}
    />
  )
}

export function CursorGlow() {
  const reduceMotion = useReducedMotion()
  const [position, setPosition] = useState({ x: -400, y: -400 })

  useEffect(() => {
    if (reduceMotion) return

    const handlePointerMove = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [reduceMotion])

  if (reduceMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[60] hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.16),rgba(245,158,11,0.12)_35%,transparent_70%)] blur-2xl lg:block"
      style={{ left: position.x, top: position.y }}
    />
  )
}

export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[8%] h-96 w-96 rounded-full bg-pink-200/55 blur-[120px]" />
      <div className="absolute right-[-8%] top-[30%] h-[28rem] w-[28rem] rounded-full bg-amber-200/55 blur-[140px]" />
      <div className="absolute bottom-[8%] left-[28%] h-80 w-80 rounded-full bg-emerald-100/55 blur-[120px]" />
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 animate-[apmo-float_9s_ease-in-out_infinite] rounded-full bg-rose-300/50"
          style={{
            left: `${(index * 17) % 100}%`,
            top: `${12 + ((index * 23) % 78)}%`,
            animationDelay: `${index * 0.35}s`,
          }}
        />
      ))}
    </div>
  )
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={cn(
        "group rounded-[2rem] border border-rose-100 bg-white/80 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur-xl transition-colors hover:border-rose-200",
        className
      )}
      initial={{ opacity: 0, y: 42, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      whileHover={{ y: -8, scale: 1.01 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function SplitHeading({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3"
}) {
  const words = text.split(" ")

  return (
    <Tag className={cn("overflow-hidden", className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden pr-[0.18em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", filter: "blur(10px)", opacity: 0 }}
            whileInView={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.72, delay: index * 0.08, ease }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
}: {
  eyebrow: string
  title: string
  copy?: string
  align?: "left" | "center"
}) {
  return (
    <Reveal
      className={cn(
        "mx-auto max-w-4xl",
        align === "center" ? "text-center" : "mx-0 text-left"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-500/80">
        {eyebrow}
      </p>
      <SplitHeading
        text={title}
        className="mt-4 font-serif text-4xl italic leading-[0.95] tracking-[-0.05em] text-[#351426] sm:text-6xl lg:text-7xl"
      />
      {copy ? (
        <p className="mt-6 text-base leading-8 text-[#5f3d4b] sm:text-lg">{copy}</p>
      ) : null}
    </Reveal>
  )
}

export function MagneticButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary"
  className?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduceMotion = useReducedMotion()

  const handleMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate3d(${x * 0.18}px, ${y * 0.24}px, 0)`
  }

  const handleLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = "translate3d(0, 0, 0)"
  }

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "group inline-flex h-14 items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold transition-[transform,box-shadow,background,color] duration-300 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200",
        variant === "primary"
          ? "bg-[#351426] text-white shadow-[0_18px_55px_rgba(53,20,38,0.18)] hover:bg-[#4b1c34] hover:shadow-[0_24px_70px_rgba(244,114,182,0.32)]"
          : "border border-rose-200 bg-white/70 text-[#351426] backdrop-blur-xl hover:border-rose-300 hover:bg-white",
        className
      )}
    >
      {children}
      <FiArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}

export function ImageReveal({
  className,
  imageClassName,
  alt,
  parallax = false,
  ...props
}: ImageProps & {
  imageClassName?: string
  parallax?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], parallax ? ["-8%", "8%"] : ["0%", "0%"])
  const scale = useTransform(scrollYProgress, [0, 1], parallax ? [1.08, 1.18] : [1, 1])

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden rounded-[2rem]", className)}
      initial={{ clipPath: "inset(18% 12% 18% 12% round 2rem)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 2rem)", opacity: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.1, ease }}
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale }}>
        <Image
          {...props}
          alt={alt}
          unoptimized={props.unoptimized ?? shouldUnoptimizeImage(props.src)}
          className={cn("object-cover transition-transform duration-700", imageClassName)}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#351426]/35 via-transparent to-transparent" />
    </motion.div>
  )
}

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })

  useEffect(() => {
    if (!inView || !ref.current) return

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = `${Math.round(latest)}${suffix}`
      },
    })

    return () => controls.stop()
  }, [inView, suffix, value])

  return <span ref={ref}>0{suffix}</span>
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-rose-100">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-amber-200 via-pink-300 to-fuchsia-400"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: value / 100 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
        style={{ originX: 0 }}
      />
    </div>
  )
}

export function SectionDivider() {
  return (
    <motion.div
      aria-hidden="true"
      className="mx-auto my-8 h-px w-[min(86rem,calc(100%-2rem))] overflow-hidden bg-rose-100"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease }}
      style={{ originX: 0 }}
    >
      <div className="h-full w-full bg-gradient-to-r from-transparent via-rose-300/60 to-transparent" />
    </motion.div>
  )
}
