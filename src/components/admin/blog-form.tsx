"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/admin/image-uploader"
import type { BlogPost } from "@/types"

interface BlogFormProps {
  action: (formData: FormData) => Promise<void>
  post?: BlogPost | null
  submitLabel: string
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function BlogForm({ action, post, submitLabel }: BlogFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      {post?.coverImage?.url ? (
        <input type="hidden" name="existing_cover_url" value={post.coverImage.url} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Post details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={post?.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={post?.slug}
              placeholder="auto-generated from title if empty"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" defaultValue={post?.author ?? "The Team"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="published_at">Published at</Label>
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(post?.publishedAt)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={post?.tags?.join(", ") ?? ""}
              placeholder="guides, haircare, tips"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="body">Body (HTML)</Label>
            <Textarea
              id="body"
              name="body"
              rows={14}
              defaultValue={post?.body}
              required
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cover image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUploader existing={post?.coverImage ? [post.coverImage] : []} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Or cover image URL</Label>
              <Input
                id="cover_image_url"
                name="cover_image_url"
                placeholder="https://..."
                defaultValue=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover_image_alt">Cover alt text</Label>
              <Input
                id="cover_image_alt"
                name="cover_image_alt"
                defaultValue={post?.coverImage?.alt ?? ""}
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
          <Link href="/admin/blog">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
