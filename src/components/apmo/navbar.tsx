"use client"

import Link from "next/link"
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import { FiMenu, FiX } from "react-icons/fi"
import { MagneticButton } from "@/components/apmo/animation"
import { navItems } from "@/components/apmo/data"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const backdropFilter = useTransform(scrollY, [0, 160], ["blur(0px)", "blur(18px)"])

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => setScrolled(latest > 24))
    return () => unsubscribe()
  }, [scrollY])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] px-4 py-4 transition-colors duration-500 sm:px-6",
          scrolled ? "text-white" : "text-white"
        )}
        style={{ backdropFilter }}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 transition-all duration-500 sm:px-5",
            scrolled
              ? "border-white/12 bg-[#090407]/70 shadow-2xl shadow-black/30 backdrop-blur-2xl"
              : "border-white/8 bg-white/[0.035] backdrop-blur-md"
          )}
          aria-label="Main navigation"
        >
          <Link href="/" className="group flex items-center gap-3" aria-label="Apmo home">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#12070d] shadow-[0_10px_30px_rgba(255,255,255,0.16)] transition-transform duration-300 group-hover:scale-105">
              <span className="font-serif text-xl italic">A</span>
            </span>
            <span className="font-serif text-2xl italic tracking-tight">Apmo</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative text-sm font-medium text-white/72 transition-colors hover:text-white"
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-amber-200 to-pink-300 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <MagneticButton href="#contact" className="h-11 px-5">
              Contact Us
            </MagneticButton>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <FiMenu />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[120] bg-[#050306]/96 text-white backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, clipPath: "circle(0% at 92% 6%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 92% 6%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-7">
              <span className="font-serif text-3xl italic">Apmo</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.05]"
                aria-label="Close menu"
              >
                <FiX />
              </button>
            </div>
            <div className="px-6 pt-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 24, opacity: 0, filter: "blur(10px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: 0.12 + index * 0.08 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/10 py-5 font-serif text-5xl italic tracking-[-0.05em]"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <MagneticButton href="#contact" className="mt-10 w-full" variant="primary">
                Start your hair ritual
              </MagneticButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
