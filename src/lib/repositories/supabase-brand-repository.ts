import type { Brand } from "@/types"
import { createSupabasePublicClient } from "@/lib/supabase/server"
import { mapBrand, type SupabaseBrandRow } from "./supabase-catalog-mappers"

export const supabaseBrandRepository = {
  async list(): Promise<Brand[]> {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw new Error(error.message)
    return ((data ?? []) as SupabaseBrandRow[]).map(mapBrand)
  },

  async getBySlug(slug: string): Promise<Brand | null> {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapBrand(data as SupabaseBrandRow) : null
  },

  async getById(id: string): Promise<Brand | null> {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapBrand(data as SupabaseBrandRow) : null
  },
}
