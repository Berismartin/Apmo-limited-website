"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { FiPlus } from "react-icons/fi"
import { Reveal, SectionHeading } from "@/components/apmo/animation"
import { faqs } from "@/components/apmo/data"
import { cn } from "@/lib/utils"

export function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative z-10 px-4 py-24 text-[#351426] sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeading
          eyebrow="FAQ"
          title="A simple launch promise"
          copy="The source site is intentionally minimal. The FAQ keeps that clarity while answering the questions a visitor would naturally have before contacting Apmo."
          align="left"
        />

        <Reveal className="rounded-[2rem] border border-rose-100 bg-white/85 p-3 shadow-2xl shadow-rose-950/10 backdrop-blur-xl">
          {faqs.map((item, index) => (
            <div key={item.question} className="border-b border-rose-100 last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-6 px-4 py-6 text-left"
                aria-expanded={open === index}
              >
                <span className="font-serif text-2xl italic tracking-[-0.04em]">
                  {item.question}
                </span>
                <FiPlus
                  className={cn(
                    "shrink-0 text-rose-500 transition-transform duration-300",
                    open === index && "rotate-45"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === index ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                    animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                    exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-6 leading-8 text-[#6c4354]">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
