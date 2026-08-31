"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { ChevronDown, Loader2 } from "lucide-react"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
]

interface SortDropdownProps {
  currentSort: string
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (value === "newest") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    params.delete("page")
    const query = params.toString()
    const href = query ? `/shop?${query}` : "/shop"
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Sort products by"
        aria-busy={isPending}
        className="appearance-none rounded-md border border-border bg-white py-2 pl-3 pr-8 text-sm text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground disabled:cursor-wait disabled:opacity-70"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
    </div>
  )
}
