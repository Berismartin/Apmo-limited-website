"use client"

import { useTransition, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { slugify } from "@/lib/utils"
import type { Brand } from "@/types"

interface BrandFormProps {
  action: (formData: FormData) => Promise<void>
  brand?: Brand | null
  submitLabel: string
}

export function BrandForm({ action, brand, submitLabel }: BrandFormProps) {
  const [isPending, startTransition] = useTransition()
  const [slug, setSlug] = useState(brand?.slug ?? "")

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await action(formData)
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          toast.success("Brand saved successfully")
          throw err
        }
        toast.error(err instanceof Error ? err.message : "Failed to save brand")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Brand details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={brand?.name}
              required
              onChange={(e) => {
                if (!brand) setSlug(slugify(e.target.value))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={brand?.description}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/brands">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
