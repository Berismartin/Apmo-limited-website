import type {
  PaginatedResult,
  PaginationParams,
  Product,
  ProductFilters,
  ProductRepository,
  SortOption,
} from "@/types"
import { createSupabasePublicClient } from "@/lib/supabase/server"
import { mapProduct, type SupabaseProductRow } from "./supabase-catalog-mappers"

const productSelect = `
  *,
  product_images (*),
  product_variants (*),
  product_categories (category_id)
`

function paginate<T>(
  items: T[],
  pagination?: PaginationParams
): PaginatedResult<T> {
  const page = pagination?.page ?? 1
  const limit = pagination?.limit ?? 12
  const total = items.length
  const totalPages = Math.ceil(total / limit)
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

function applyClientFilters(items: Product[], filters?: ProductFilters) {
  if (!filters) return items

  let result = items

  if (filters.priceRange) {
    const { min, max } = filters.priceRange
    result = result.filter((product) => {
      const price = product.variants[0]?.price ?? 0
      if (min !== undefined && price < min) return false
      if (max !== undefined && price > max) return false
      return true
    })
  }

  if (filters.inStock !== undefined) {
    result = result.filter((product) =>
      product.variants.some((variant) =>
        filters.inStock
          ? variant.inventory.quantity > 0 || variant.inventory.allowBackorder
          : true
      )
    )
  }

  if (filters.tags?.length) {
    result = result.filter((product) =>
      filters.tags?.some((tag) => product.tags.includes(tag))
    )
  }

  return result
}

function applySort(items: Product[], sort?: SortOption) {
  if (!sort) return items

  return [...items].sort((a, b) => {
    let comparison = 0

    switch (sort.field) {
      case "price":
        comparison = (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0)
        break
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      default:
        comparison = 0
    }

    return sort.order === "desc" ? -comparison : comparison
  })
}

async function fetchProducts(filters?: ProductFilters): Promise<Product[]> {
  const supabase = createSupabasePublicClient()
  let query = supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")

  if (filters?.search) {
    const search = `%${filters.search}%`
    query = query.or(`name.ilike.${search},description.ilike.${search}`)
  }

  if (filters?.category) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle()

    if (categoryError) throw new Error(categoryError.message)
    if (!category) return []

    const { data: categoryProducts, error: joinError } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", category.id)

    if (joinError) throw new Error(joinError.message)
    const productIds = (categoryProducts ?? []).map((item) => item.product_id)
    if (productIds.length === 0) return []

    query = query.in("id", productIds)
  }

  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as SupabaseProductRow[]).map(mapProduct)
}

export const supabaseProductRepository: ProductRepository = {
  async list(filters, sort, pagination) {
    const products = await fetchProducts(filters)
    return paginate(applySort(applyClientFilters(products, filters), sort), pagination)
  },

  async getBySlug(slug) {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapProduct(data as SupabaseProductRow) : null
  },

  async getById(id) {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapProduct(data as SupabaseProductRow) : null
  },

  async getFeatured(limit = 4) {
    const supabase = createSupabasePublicClient()
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("status", "active")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return ((data ?? []) as SupabaseProductRow[]).map(mapProduct)
  },

  async getByCategory(categorySlug, pagination) {
    const products = await fetchProducts({ category: categorySlug })
    return paginate(products, pagination)
  },

  async search(query, pagination) {
    const products = await fetchProducts({ search: query })
    return paginate(products, pagination)
  },
}
