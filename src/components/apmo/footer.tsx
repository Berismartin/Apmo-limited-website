"use client"

import Link from "next/link"
import { FiInstagram, FiMail, FiTwitter } from "react-icons/fi"
import { Reveal } from "@/components/apmo/animation"
import { navItems } from "@/components/apmo/data"

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden px-4 pb-8 pt-24 text-white sm:px-6">
      <Reveal className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="font-serif text-6xl italic tracking-[-0.07em]">
              Apmo
            </Link>
            <p className="mt-6 max-w-md leading-8 text-white/58">
              A cinematic launch experience for a beauty brand preparing
              something cool, warm, and product-led for textured haircare.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">
              Navigate
            </h3>
            <div className="mt-5 grid gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-white/58 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">
              Social
            </h3>
            <div className="mt-5 flex gap-3">
              {[
                { icon: FiInstagram, label: "Instagram" },
                { icon: FiTwitter, label: "Twitter" },
                { icon: FiMail, label: "Email" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.label === "Email" ? "mailto:hello@apmoug.com" : "#"}
                  aria-label={item.label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:text-white"
                >
                  <item.icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.24em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Apmo. All rights reserved.</p>
          <p>Under construction, reimagined for launch.</p>
        </div>
      </Reveal>
    </footer>
  )
}
