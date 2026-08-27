"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import {
  mapBrand,
  type SupabaseBrandRow,
} from "@/lib/repositories/supabase-catalog-mappers"
import type { Brand } from "@/types"
import { requireAdmin } from "./require-admin"
import { runAdminMutation } from "./mutation-result"

export async function getAdminBrands(): Promise<Brand[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return ((data ?? []) as SupabaseBrandRow[]).map(mapBrand)
}

export async function getAdminBrand(id: string): Promise<Brand | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapBrand(data as SupabaseBrandRow) : null
}

export async function createBrandAction(formData: FormData) {
  let id = ""
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const supabase = createSupabaseAdminClient()

    const name = requiredText(formData, "name")
    const slug = slugify(String(formData.get("slug") || name))
    const description = String(formData.get("description") ?? "").trim()

    const { data, error } = await supabase
      .from("brands")
      .insert({ name, slug, description })
      .select("id")
      .single()

    if (error) throw new Error(error.message)
    id = data.id as string
  })
  if (result?.error) return result
  revalidateBrands()
  redirect(`/admin/brands/${id}`)
}

export async function updateBrandAction(formData: FormData) {
  let id = ""
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const supabase = createSupabaseAdminClient()

    id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing brand id")

    const name = requiredText(formData, "name")
    const slug = slugify(String(formData.get("slug") || name))
    const description = String(formData.get("description") ?? "").trim()

    const { error } = await supabase
      .from("brands")
      .update({ name, slug, description })
      .eq("id", id)

    if (error) throw new Error(error.message)
  })
  if (result?.error) return result
  revalidateBrands()
  redirect(`/admin/brands/${id}`)
}

export async function deleteBrandAction(formData: FormData) {
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const supabase = createSupabaseAdminClient()

    const id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing brand id")

    const { error } = await supabase.from("brands").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
  if (result?.error) return result
  revalidateBrands()
  redirect("/admin/brands")
}

function requiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function revalidateBrands() {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin")
  revalidatePath("/admin/brands")
  revalidatePath("/admin/products")
}
