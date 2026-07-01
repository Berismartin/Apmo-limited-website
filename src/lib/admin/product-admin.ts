"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import {
  mapBrand,
  mapCategory,
  mapProduct,
  type SupabaseBrandRow,
  type SupabaseCategoryRow,
  type SupabaseProductRow,
} from "@/lib/repositories/supabase-catalog-mappers"
import type { Brand, Category, Product, ProductOption, ProductStatus } from "@/types"

const adminProductSelect = `
  *,
  product_images (*),
  product_variants (*),
  product_categories (category_id)
`

export interface AdminCatalogState {
  configured: boolean
  products: Product[]
  categories: Category[]
  brands: Brand[]
}

export async function getAdminCatalogState(): Promise<AdminCatalogState> {
  if (!isSupabaseAdminConfigured()) {
    return {
      configured: false,
      products: [],
      categories: [],
      brands: [],
    }
  }

  const supabase = createSupabaseAdminClient()
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    supabase
      .from("products")
      .select(adminProductSelect)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true }),
  ])

  if (productsResult.error) throw new Error(productsResult.error.message)
  if (categoriesResult.error) throw new Error(categoriesResult.error.message)
  if (brandsResult.error) throw new Error(brandsResult.error.message)

  return {
    configured: true,
    products: ((productsResult.data ?? []) as SupabaseProductRow[]).map(mapProduct),
    categories: ((categoriesResult.data ?? []) as SupabaseCategoryRow[]).map(mapCategory),
    brands: ((brandsResult.data ?? []) as SupabaseBrandRow[]).map(mapBrand),
  }
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  if (!isSupabaseAdminConfigured()) return null

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select(adminProductSelect)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProduct(data as SupabaseProductRow) : null
}

export async function createProductAction(formData: FormData) {
  const productId = await upsertProduct(formData)
  revalidateCatalog()
  redirect(`/admin/products/${productId}`)
}

export async function updateProductAction(formData: FormData) {
  const productId = String(formData.get("id") ?? "")
  if (!productId) throw new Error("Missing product id")

  await upsertProduct(formData, productId)
  revalidateCatalog()
  redirect(`/admin/products/${productId}`)
}

export async function deleteProductAction(formData: FormData) {
  const productId = String(formData.get("id") ?? "")
  if (!productId) throw new Error("Missing product id")
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin credentials are not configured")
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from("products").delete().eq("id", productId)
  if (error) throw new Error(error.message)

  revalidateCatalog()
  redirect("/admin/products")
}

async function upsertProduct(formData: FormData, productId?: string) {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin credentials are not configured")
  }

  const supabase = createSupabaseAdminClient()
  const name = requiredText(formData, "name")
  const slug = slugify(String(formData.get("slug") || name))
  const brandId = requiredText(formData, "brand_id")
  const status = requiredText(formData, "status") as ProductStatus
  const categoryIds = formData.getAll("category_ids").map(String).filter(Boolean)
  const tags = splitCsv(String(formData.get("tags") ?? ""))
  const imageUrl = String(formData.get("image_url") ?? "").trim()
  const imageAlt = String(formData.get("image_alt") ?? name).trim()
  const variantName = String(formData.get("variant_name") || "Default")
  const sku = requiredText(formData, "sku")
  const price = parseMoneyToCents(String(formData.get("price") ?? "0"))
  const compareAtPriceInput = String(formData.get("compare_at_price") ?? "").trim()
  const compareAtPrice = compareAtPriceInput
    ? parseMoneyToCents(compareAtPriceInput)
    : null
  const inventoryQuantity = Number(formData.get("inventory_quantity") ?? 0)
  const options = parseVariantOptions(String(formData.get("variant_options") ?? ""))

  const productPayload = {
    brand_id: brandId,
    name,
    slug,
    description: requiredText(formData, "description"),
    body: String(formData.get("body") ?? "").trim() || null,
    status,
    tags,
    rating: Number(formData.get("rating") ?? 0),
    review_count: Number(formData.get("review_count") ?? 0),
    featured: formData.get("featured") === "on",
  }

  const productResult = productId
    ? await supabase
        .from("products")
        .update(productPayload)
        .eq("id", productId)
        .select("id")
        .single()
    : await supabase
        .from("products")
        .insert(productPayload)
        .select("id")
        .single()

  if (productResult.error) throw new Error(productResult.error.message)
  const id = productResult.data.id as string

  await Promise.all([
    supabase.from("product_categories").delete().eq("product_id", id),
    supabase.from("product_images").delete().eq("product_id", id),
    supabase.from("product_variants").delete().eq("product_id", id),
  ])

  if (categoryIds.length > 0) {
    const { error } = await supabase.from("product_categories").insert(
      categoryIds.map((categoryId) => ({
        product_id: id,
        category_id: categoryId,
      }))
    )
    if (error) throw new Error(error.message)
  }

  if (imageUrl) {
    const { error } = await supabase.from("product_images").insert({
      product_id: id,
      url: imageUrl,
      alt: imageAlt,
      sort_order: 0,
    })
    if (error) throw new Error(error.message)
  }

  const { error: variantError } = await supabase.from("product_variants").insert({
    product_id: id,
    sku,
    name: variantName,
    price,
    compare_at_price: compareAtPrice,
    currency: String(formData.get("currency") || "USD"),
    inventory_quantity: Number.isFinite(inventoryQuantity) ? inventoryQuantity : 0,
    track_inventory: formData.get("track_inventory") === "on",
    allow_backorder: formData.get("allow_backorder") === "on",
    options,
    sort_order: 0,
  })

  if (variantError) throw new Error(variantError.message)
  return id
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

function parseMoneyToCents(value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100)
}

function parseVariantOptions(value: string): ProductOption[] {
  return splitCsv(value).map((entry) => {
    const [name, optionValue] = entry.split(":").map((part) => part.trim())
    return {
      name: name || "Option",
      value: optionValue || name || "Default",
    }
  })
}

function revalidateCatalog() {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin")
  revalidatePath("/admin/products")
}
