"use client"

import { useRouter } from "next/navigation"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CustomerSearchProps {
  defaultValue?: string
}

export function CustomerSearch({ defaultValue = "" }: CustomerSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value.trim() ?? ""
    if (value) {
      router.push(`/admin/customers?search=${encodeURIComponent(value)}`)
    } else {
      router.push("/admin/customers")
    }
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = ""
    router.push("/admin/customers")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        ref={inputRef}
        name="search"
        placeholder="Search by name or email…"
        defaultValue={defaultValue}
        className="max-w-sm"
      />
      <Button type="submit" variant="secondary" size="sm">
        Search
      </Button>
      {defaultValue && (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  )
}
