"use client"

import { useTransition, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/admin/image-uploader"
import { submitAdminMutation } from "@/components/admin/submit-admin-mutation"
import { slugify } from "@/lib/utils"
import type { MutationResult } from "@/lib/admin/mutation-result"
import type { Category } from "@/types"

interface CategoryFormProps {
  action: (formData: FormData) => Promise<MutationResult | void>
  category?: Category | null
  categories: Category[]
  submitLabel: string
}

export function CategoryForm({
  action,
  category,
  categories,
  submitLabel,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [slug, setSlug] = useState(category?.slug ?? "")

  const parentOptions = categories.filter((c) => c.id !== category?.id)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await submitAdminMutation(() => action(formData), {
        success: "Category saved successfully",
        failure: "Failed to save category",
      })
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {category?.image ? (
        <>
          <input type="hidden" name="image_alt" value={category.image.alt} />
          <input type="hidden" name="image_width" value={category.image.width ?? ""} />
          <input type="hidden" name="image_height" value={category.image.height ?? ""} />
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              required
              onChange={(e) => {
                if (!category) setSlug(slugify(e.target.value))
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
              defaultValue={category?.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent category</Label>
            <select
              id="parent_id"
              name="parent_id"
              defaultValue={category?.parentId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">None (top-level)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={category?.order ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category image (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader existing={category?.image ? [category.image] : []} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? "Saving…" : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/categories">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
