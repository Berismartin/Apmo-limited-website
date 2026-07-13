"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import {
  mapBlogPost,
  type SupabaseBlogPostRow,
} from "@/lib/repositories/supabase-blog-repository"
import { uploadProductImagesFromFormData } from "./product-image-storage"
import type { BlogPost } from "@/types"
import { jsonBlogRepository } from "@/lib/repositories/json-blog-repository"

export interface AdminBlogState {
  posts: BlogPost[]
  configured: boolean
  demoMode: boolean
}

export async function getAdminBlogState(): Promise<AdminBlogState> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false })

    if (error) throw new Error(error.message)

    return {
      posts: ((data ?? []) as SupabaseBlogPostRow[]).map(mapBlogPost),
      configured: true,
      demoMode: false,
    }
  } catch {
    const { items } = await jsonBlogRepository.list({ page: 1, limit: 10_000 })
    return {
      posts: items,
      configured: false,
      demoMode: true,
    }
  }
}

export async function getAdminBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapBlogPost(data as SupabaseBlogPostRow) : null
  } catch {
    const { items } = await jsonBlogRepository.list({ page: 1, limit: 10_000 })
    return items.find((post) => post.id === id) ?? null
  }
}

export async function createBlogPostAction(formData: FormData) {
  const id = await upsertBlogPost(formData)
  revalidateBlog()
  redirect(`/admin/blog/${id}`)
}

export async function updateBlogPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) throw new Error("Missing blog post id")

  await upsertBlogPost(formData, id)
  revalidateBlog()
  redirect(`/admin/blog/${id}`)
}

export async function deleteBlogPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) throw new Error("Missing blog post id")

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidateBlog()
  redirect("/admin/blog")
}

async function upsertBlogPost(formData: FormData, postId?: string) {
  const supabase = createSupabaseAdminClient()
  const title = requiredText(formData, "title")
  const slug = slugify(String(formData.get("slug") || title))
  const excerpt = requiredText(formData, "excerpt")
  const body = requiredText(formData, "body")
  const author = String(formData.get("author") ?? "").trim() || "The Team"
  const tags = splitCsv(String(formData.get("tags") ?? ""))
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim()
  const published_at = publishedAtRaw
    ? new Date(publishedAtRaw).toISOString()
    : new Date().toISOString()

  const existingCoverUrl =
    String(formData.get("existing_cover_url") ?? "").trim() ||
    String(formData.get("existing_image_url") ?? "").trim()
  const externalCoverUrl = String(formData.get("cover_image_url") ?? "").trim()
  const coverAlt =
    String(formData.get("cover_image_alt") ?? "").trim() || title
  const uploaded = await uploadProductImagesFromFormData(formData, `blog/${slug}`)
  const uploadedCover = uploaded[0]

  let cover_image_url: string | null = null
  let cover_image_alt: string | null = null

  if (uploadedCover) {
    cover_image_url = uploadedCover.url
    cover_image_alt = coverAlt
  } else if (externalCoverUrl) {
    cover_image_url = externalCoverUrl
    cover_image_alt = coverAlt
  } else if (existingCoverUrl) {
    cover_image_url = existingCoverUrl
    cover_image_alt = coverAlt
  }

  const payload = {
    title,
    slug,
    excerpt,
    body,
    author,
    tags,
    cover_image_url,
    cover_image_alt,
    published_at,
  }

  const result = postId
    ? await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", postId)
        .select("id")
        .single()
    : await supabase.from("blog_posts").insert(payload).select("id").single()

  if (result.error) throw new Error(result.error.message)
  return result.data.id as string
}

function requiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function revalidateBlog() {
  revalidatePath("/")
  revalidatePath("/blog")
  revalidatePath("/admin")
  revalidatePath("/admin/blog")
}
