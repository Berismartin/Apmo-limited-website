"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ApmoLoaderMark } from "@/components/layout/apmo-loader-mark"

const ease = [0.76, 0, 0.24, 1] as const
const MIN_VISIBLE_MS = 2200

export function PageLoader() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const isAdmin = pathname.startsWith("/admin")
  const [visible, setVisible] = useState(!isAdmin)

  useEffect(() => {
    if (isAdmin) {
      setVisible(false)
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const minDelay = new Promise((resolve) => {
      window.setTimeout(resolve, reduceMotion ? 200 : MIN_VISIBLE_MS)
    })
    const fontsReady = document.fonts?.ready ?? Promise.resolve()

    let cancelled = false
    void Promise.all([minDelay, fontsReady]).then(() => {
      if (!cancelled) setVisible(false)
    })

    return () => {
      cancelled = true
      document.body.style.overflow = previousOverflow
    }
  }, [isAdmin, reduceMotion])

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = ""
    }
  }, [visible])

  if (isAdmin) return null

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[400]"
          initial={{ opacity: 1 }}
          exit={{
            y: "-108%",
            opacity: 1,
            transition: { duration: reduceMotion ? 0.2 : 0.95, ease },
          }}
        >
          <ApmoLoaderMark />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
