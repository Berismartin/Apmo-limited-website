"use client"

import Link from "next/link"
import { useLinkStatus } from "next/link"
import { cn } from "@/lib/utils"
import type { PaginationMeta } from "@/types"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface PaginationProps {
  pagination: PaginationMeta
  basePath: string
  searchParams?: Record<string, string>
}

/**
 * Renders as a child of <Link>. next/link's useLinkStatus() reports whether
 * that specific link's navigation is in flight, so the page you clicked can
 * show a spinner instead of the whole grid silently swapping out underneath
 * you (or nothing happening at all on a slow connection).
 */
function LinkContent({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus()
  if (pending) {
    return <Loader2 className="h-4 w-4 animate-spin" />
  }
  return <>{children}</>
}

export function Pagination({
  pagination,
  basePath,
  searchParams = {},
}: PaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination

  if (totalPages <= 1) return null

  function buildHref(pageNum: number) {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(pageNum))
    return `${basePath}?${params.toString()}`
  }

  // Sliding 6-page window: keep 6 visible pages centered on current where possible
  const WINDOW_SIZE = 6
  const pages: number[] = []
  let start = Math.max(1, page - Math.floor(WINDOW_SIZE / 2))
  const end = Math.min(totalPages, start + WINDOW_SIZE - 1)
  // If we're near the end, shift window back so we always show up to WINDOW_SIZE pages
  start = Math.max(1, end - WINDOW_SIZE + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Previous page"
        >
          <LinkContent>
            <ChevronLeft className="h-4 w-4" />
          </LinkContent>
        </Link>
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground/60">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium",
            p === page
              ? "bg-foreground text-background"
              : "hover:bg-accent"
          )}
          aria-current={p === page ? "page" : undefined}
        >
          <LinkContent>{p}</LinkContent>
        </Link>
      ))}

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Next page"
        >
          <LinkContent>
            <ChevronRight className="h-4 w-4" />
          </LinkContent>
        </Link>
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground/60">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
