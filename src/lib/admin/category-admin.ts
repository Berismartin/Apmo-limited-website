"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import {
  mapCategory,
  type SupabaseCategoryRow,
} from "@/lib/repositories/supabase-catalog-mappers"
import type { Category } from "@/types"
import { uploadProductImagesFromFormData } from "./product-image-storage"
import { requireAdmin } from "./require-admin"
import { runAdminMutation } from "./mutation-result"

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw new Error(error.message)
  return ((data ?? []) as SupabaseCategoryRow[]).map(mapCategory)
}

export async function getAdminCategory(id: string): Promise<Category | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapCategory(data as SupabaseCategoryRow) : null
}

export async function createCategoryAction(formData: FormData) {
    const result = await runAdminMutation(async () => {
    await requireAdmin()
    await upsertCategory(formData)
  })
  if (result?.error) return result
  revalidateCategories()
  redirect("/admin/categories")
}

export async function updateCategoryAction(formData: FormData) {
  let id = ""
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing category id")
    await upsertCategory(formData, id)
  })
  if (result?.error) return result
  revalidateCategories()
  redirect("/admin/categories")
}

export async function deleteCategoryAction(formData: FormData) {
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const supabase = createSupabaseAdminClient()

    const id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing category id")

    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
  if (result?.error) return result
  revalidateCategories()
  redirect("/admin/categories")
}

async function upsertCategory(formData: FormData, categoryId?: string) {
  const supabase = createSupabaseAdminClient()

  const name = requiredText(formData, "name")
  const slug = slugify(String(formData.get("slug") || name))
  const description = String(formData.get("description") ?? "").trim()
  const parentId = String(formData.get("parent_id") ?? "").trim() || null
  const sortOrder = Number(formData.get("sort_order") ?? 0)

  const existingImageUrl = String(formData.get("existing_image_url") ?? "").trim()
  const uploaded = await uploadProductImagesFromFormData(formData, `categories/${slug}`)
  const uploadedImage = uploaded[0]

  let image_url: string | null = null
  let image_alt: string | null = null
  let image_width: number | null = null
  let image_height: number | null = null

  if (uploadedImage) {
    image_url = uploadedImage.url
    image_alt = name
    image_width = uploadedImage.width ?? null
    image_height = uploadedImage.height ?? null
  } else if (existingImageUrl) {
    image_url = existingImageUrl
    image_alt = String(formData.get("image_alt") ?? "").trim() || name
    image_width = Number(formData.get("image_width")) || null
    image_height = Number(formData.get("image_height")) || null
  }

  const payload = {
    name,
    slug,
    description,
    parent_id: parentId,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    image_url,
    image_alt,
    image_width,
    image_height,
  }

  const result = categoryId
    ? await supabase
        .from("categories")
        .update(payload)
        .eq("id", categoryId)
        .select("id")
        .single()
    : await supabase.from("categories").insert(payload).select("id").single()

  if (result.error) throw new Error(result.error.message)
  return result.data.id as string
}

function requiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function revalidateCategories() {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
}
