import type { BlogPost, PaginatedResult, PaginationParams, ProductImage } from "@/types"
import { createSupabasePublicClient } from "@/lib/supabase/server"
import { jsonBlogRepository } from "./json-blog-repository"

export interface SupabaseBlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  author: string
  tags: string[] | null
  cover_image_url: string | null
  cover_image_alt: string | null
  published_at: string
  created_at: string
  updated_at: string
}

export function mapBlogPost(row: SupabaseBlogPostRow): BlogPost {
  const coverImage: ProductImage | undefined = row.cover_image_url
    ? {
        url: row.cover_image_url,
        alt: row.cover_image_alt || row.title,
      }
    : undefined

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    author: row.author,
    tags: row.tags ?? [],
    coverImage,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }
}

function paginate<T>(items: T[], params?: PaginationParams): PaginatedResult<T> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 9
  const total = items.length
  const totalPages = Math.ceil(total / limit) || 1
  const offset = (page - 1) * limit

  return {
    items: items.slice(offset, offset + limit),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

function isMissingTableError(message: string) {
  return (
    message.includes("blog_posts") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  )
}

async function withJsonFallback<T>(
  run: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (isMissingTableError(message)) {
      return fallback()
    }
    throw error
  }
}

export const supabaseBlogRepository = {
  async list(params?: PaginationParams): Promise<PaginatedResult<BlogPost>> {
    return withJsonFallback(
      async () => {
        const supabase = createSupabasePublicClient()
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("published_at", { ascending: false })

        if (error) throw new Error(error.message)

        const posts = ((data ?? []) as SupabaseBlogPostRow[]).map(mapBlogPost)
        return paginate(posts, params)
      },
      () => jsonBlogRepository.list(params)
    )
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    return withJsonFallback(
      async () => {
        const supabase = createSupabasePublicClient()
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .maybeSingle()

        if (error) throw new Error(error.message)
        return data ? mapBlogPost(data as SupabaseBlogPostRow) : null
      },
      () => jsonBlogRepository.getBySlug(slug)
    )
  },

  async getByTag(
    tag: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<BlogPost>> {
    return withJsonFallback(
      async () => {
        const supabase = createSupabasePublicClient()
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .contains("tags", [tag])
          .order("published_at", { ascending: false })

        if (error) throw new Error(error.message)

        const posts = ((data ?? []) as SupabaseBlogPostRow[]).map(mapBlogPost)
        return paginate(posts, params)
      },
      () => jsonBlogRepository.getByTag(tag, params)
    )
  },
}
