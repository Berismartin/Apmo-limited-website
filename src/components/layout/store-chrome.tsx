"use client"

import type { ReactNode } from "react"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { BackToTop } from "@/components/layout/back-to-top"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CartDrawer } from "@/components/cart/cart-drawer"
import type { Category } from "@/types"

export function StoreChrome({
  categories,
  children,
}: {
  categories: Category[]
  children: ReactNode
}) {
  return (
    <>
      <AnnouncementBar />
      <Header categories={categories} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </>
  )
}
