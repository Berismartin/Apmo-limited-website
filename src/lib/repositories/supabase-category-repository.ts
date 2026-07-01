import type { Category, CategoryRepository } from "@/types"
import { createSupabasePublicClient } from "@/lib/supabase/server"
import { mapCategory, type SupabaseCategoryRow } from "./supabase-catalog-mappers"

export const supabaseCategoryRepository: CategoryRepository & {
  getChildren(parentId: string): Promise<Category[]>
  getTopLevel(): Promise<Category[]>
  getAncestors(categoryId: string): Promise<Category[]>
} = {
  async list() {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw new Error(error.message)
    return ((data ?? []) as SupabaseCategoryRow[]).map(mapCategory)
  },

  async getBySlug(slug) {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapCategory(data as SupabaseCategoryRow) : null
  },

  async getById(id) {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapCategory(data as SupabaseCategoryRow) : null
  },

  async getChildren(parentId) {
    const categories = await this.list()
    return categories.filter((category) => category.parentId === parentId)
  },

  async getTopLevel() {
    const categories = await this.list()
    return categories.filter((category) => !category.parentId)
  },

  async getAncestors(categoryId) {
    const categories = await this.list()
    const chain: Category[] = []
    let current = categories.find((category) => category.id === categoryId)

    while (current) {
      chain.unshift(current)
      current = current.parentId
        ? categories.find((category) => category.id === current?.parentId)
        : undefined
    }

    return chain
  },
}
