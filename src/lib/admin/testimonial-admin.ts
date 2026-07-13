"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import {
  mapTestimonial,
  type SupabaseTestimonialRow,
} from "@/lib/repositories/supabase-testimonial-repository"
import { jsonTestimonialRepository } from "@/lib/repositories/json-testimonial-repository"
import { uploadProductImagesFromFormData } from "./product-image-storage"
import type { Testimonial } from "@/types"

export interface AdminTestimonialsState {
  testimonials: Testimonial[]
  configured: boolean
  demoMode: boolean
}

export async function getAdminTestimonialsState(): Promise<AdminTestimonialsState> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw new Error(error.message)

    return {
      testimonials: ((data ?? []) as SupabaseTestimonialRow[]).map(mapTestimonial),
      configured: true,
      demoMode: false,
    }
  } catch {
    const testimonials = await jsonTestimonialRepository.list({
      includeUnpublished: true,
    })
    return {
      testimonials,
      configured: false,
      demoMode: true,
    }
  }
}

export async function getAdminTestimonial(id: string): Promise<Testimonial | null> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapTestimonial(data as SupabaseTestimonialRow) : null
  } catch {
    return jsonTestimonialRepository.getById(id)
  }
}

export async function createTestimonialAction(formData: FormData) {
  const id = await upsertTestimonial(formData)
  revalidateTestimonials()
  redirect(`/admin/testimonials/${id}`)
}

export async function updateTestimonialAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) throw new Error("Missing testimonial id")

  await upsertTestimonial(formData, id)
  revalidateTestimonials()
  redirect(`/admin/testimonials/${id}`)
}

export async function deleteTestimonialAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) throw new Error("Missing testimonial id")

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from("testimonials").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidateTestimonials()
  redirect("/admin/testimonials")
}

async function upsertTestimonial(formData: FormData, testimonialId?: string) {
  const supabase = createSupabaseAdminClient()
  const quote = requiredText(formData, "quote")
  const name = requiredText(formData, "name")
  const role = String(formData.get("role") ?? "").trim()
  const rating = clampRating(Number(formData.get("rating") ?? 5))
  const sortOrder = Number(formData.get("sort_order") ?? 0)
  const featured = formData.get("featured") === "on"
  const published = formData.get("published") === "on"

  const existingAvatarUrl =
    String(formData.get("existing_avatar_url") ?? "").trim() ||
    String(formData.get("existing_image_url") ?? "").trim()
  const externalAvatarUrl = String(formData.get("avatar_url") ?? "").trim()
  const avatarAlt =
    String(formData.get("avatar_alt") ?? "").trim() || name
  const uploaded = await uploadProductImagesFromFormData(
    formData,
    `testimonials/${name}`
  )
  const uploadedAvatar = uploaded[0]

  let avatar_url: string | null = null
  let avatar_alt: string | null = null

  if (uploadedAvatar) {
    avatar_url = uploadedAvatar.url
    avatar_alt = avatarAlt
  } else if (externalAvatarUrl) {
    avatar_url = externalAvatarUrl
    avatar_alt = avatarAlt
  } else if (existingAvatarUrl) {
    avatar_url = existingAvatarUrl
    avatar_alt = avatarAlt
  }

  const payload = {
    quote,
    name,
    role,
    rating,
    featured,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    published,
    avatar_url,
    avatar_alt,
  }

  const result = testimonialId
    ? await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", testimonialId)
        .select("id")
        .single()
    : await supabase.from("testimonials").insert(payload).select("id").single()

  if (result.error) throw new Error(result.error.message)
  return result.data.id as string
}

function requiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function clampRating(value: number) {
  if (!Number.isFinite(value)) return 5
  return Math.min(5, Math.max(1, Math.round(value)))
}

function revalidateTestimonials() {
  revalidatePath("/")
  revalidatePath("/testimonials")
  revalidatePath("/admin")
  revalidatePath("/admin/testimonials")
}
