"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RecentlyViewedItem {
  productId: string
  slug: string
  name: string
  price: number
  imageUrl: string
  imageAlt: string
  viewedAt: number
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void
  patchItems: (updates: Omit<RecentlyViewedItem, "viewedAt">[]) => void
  getItems: (excludeId?: string, limit?: number) => RecentlyViewedItem[]
}

const MAX_ITEMS = 12

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          const filtered = state.items.filter(
            (i) => i.productId !== item.productId
          )
          return {
            items: [
              {
                ...item,
                imageUrl: item.imageUrl || existing?.imageUrl || "",
                imageAlt: item.imageAlt || existing?.imageAlt || item.name,
                viewedAt: Date.now(),
              },
              ...filtered,
            ].slice(0, MAX_ITEMS),
          }
        })
      },

      patchItems: (updates) => {
        if (updates.length === 0) return
        set((state) => {
          const byId = new Map(updates.map((update) => [update.productId, update]))
          const bySlug = new Map(updates.map((update) => [update.slug, update]))
          let changed = false
          const items = state.items.map((item) => {
            const update = byId.get(item.productId) ?? bySlug.get(item.slug)
            if (!update) return item
            const next = {
              ...item,
              productId: update.productId || item.productId,
              slug: update.slug || item.slug,
              name: update.name || item.name,
              price: update.price || item.price,
              imageUrl: update.imageUrl || item.imageUrl,
              imageAlt: update.imageAlt || item.imageAlt,
            }
            if (
              next.imageUrl !== item.imageUrl ||
              next.name !== item.name ||
              next.price !== item.price ||
              next.slug !== item.slug
            ) {
              changed = true
              return next
            }
            return item
          })
          return changed ? { items } : state
        })
      },

      getItems: (excludeId, limit = 6) => {
        return get()
          .items.filter((i) => i.productId !== excludeId)
          .slice(0, limit)
      },
    }),
    {
      name: "recently-viewed-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
)
