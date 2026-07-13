import type { ProductImage, Testimonial } from "@/types"
import { createSupabasePublicClient } from "@/lib/supabase/server"
import { jsonTestimonialRepository } from "./json-testimonial-repository"

export interface SupabaseTestimonialRow {
  id: string
  quote: string
  name: string
  role: string
  rating: number
  featured: boolean
  sort_order: number
  avatar_url: string | null
  avatar_alt: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export function mapTestimonial(row: SupabaseTestimonialRow): Testimonial {
  const avatar: ProductImage | undefined = row.avatar_url
    ? {
        url: row.avatar_url,
        alt: row.avatar_alt || row.name,
      }
    : undefined

  return {
    id: row.id,
    quote: row.quote,
    name: row.name,
    role: row.role,
    rating: row.rating,
    featured: row.featured,
    sortOrder: row.sort_order,
    published: row.published,
    avatar,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function isMissingTableError(message: string) {
  return (
    message.includes("testimonials") &&
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

export const supabaseTestimonialRepository = {
  async list(options?: { featuredOnly?: boolean; includeUnpublished?: boolean }) {
    return withJsonFallback(
      async () => {
        const supabase = createSupabasePublicClient()
        let query = supabase
          .from("testimonials")
          .select("*")
          .order("sort_order", { ascending: true })

        if (!options?.includeUnpublished) {
          query = query.eq("published", true)
        }
        if (options?.featuredOnly) {
          query = query.eq("featured", true)
        }

        const { data, error } = await query
        if (error) throw new Error(error.message)
        return ((data ?? []) as SupabaseTestimonialRow[]).map(mapTestimonial)
      },
      () => jsonTestimonialRepository.list(options)
    )
  },

  async getById(id: string) {
    return withJsonFallback(
      async () => {
        const supabase = createSupabasePublicClient()
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("id", id)
          .maybeSingle()

        if (error) throw new Error(error.message)
        return data ? mapTestimonial(data as SupabaseTestimonialRow) : null
      },
      () => jsonTestimonialRepository.getById(id)
    )
  },
}
