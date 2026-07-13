"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/admin/image-uploader"
import type { Testimonial } from "@/types"

interface TestimonialFormProps {
  action: (formData: FormData) => Promise<void>
  testimonial?: Testimonial | null
  submitLabel: string
}

export function TestimonialForm({
  action,
  testimonial,
  submitLabel,
}: TestimonialFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}
      {testimonial?.avatar?.url ? (
        <input type="hidden" name="existing_avatar_url" value={testimonial.avatar.url} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Testimonial details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quote">Quote</Label>
            <Textarea
              id="quote"
              name="quote"
              rows={5}
              defaultValue={testimonial?.quote}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={testimonial?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / label</Label>
            <Input
              id="role"
              name="role"
              defaultValue={testimonial?.role}
              placeholder="Natural hair customer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min={1}
              max={5}
              defaultValue={testimonial?.rating ?? 5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={testimonial?.sortOrder ?? 0}
            />
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={testimonial?.featured ?? false}
              className="h-4 w-4 rounded border-rose-200"
            />
            <Label htmlFor="featured">Featured on homepage</Label>
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={testimonial?.published ?? true}
              className="h-4 w-4 rounded border-rose-200"
            />
            <Label htmlFor="published">Published</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUploader existing={testimonial?.avatar ? [testimonial.avatar] : []} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Or avatar URL</Label>
              <Input id="avatar_url" name="avatar_url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_alt">Avatar alt text</Label>
              <Input
                id="avatar_alt"
                name="avatar_alt"
                defaultValue={testimonial?.avatar?.alt ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/testimonials">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
