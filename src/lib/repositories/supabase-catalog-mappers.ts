import type { Brand, Category, Product, ProductImage, ProductOption, ProductVariant } from "@/types"

export interface SupabaseCategoryRow {
  id: string
  name: string
  slug: string
  description: string
  image_url: string | null
  image_alt: string | null
  image_width: number | null
  image_height: number | null
  parent_id: string | null
  sort_order: number
}

export interface SupabaseBrandRow {
  id: string
  name: string
  slug: string
  description: string
}

export interface SupabaseProductImageRow {
  id: string
  url: string
  alt: string
  width: number | null
  height: number | null
  sort_order: number
}

export interface SupabaseProductVariantRow {
  id: string
  product_id: string
  sku: string
  name: string
  price: number
  compare_at_price: number | null
  currency: string
  inventory_quantity: number
  track_inventory: boolean
  allow_backorder: boolean
  options: ProductOption[]
  weight: number | null
  dimensions: { length: number; width: number; height: number } | null
  sort_order: number
}

export interface SupabaseProductRow {
  id: string
  brand_id: string
  name: string
  slug: string
  description: string
  body: string | null
  status: Product["status"]
  tags: string[]
  rating: number
  review_count: number
  featured: boolean
  created_at: string
  updated_at: string
  product_images?: SupabaseProductImageRow[]
  product_variants?: SupabaseProductVariantRow[]
  product_categories?: Array<{ category_id: string }>
}

export function mapBrand(row: SupabaseBrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  }
}

export function mapCategory(row: SupabaseCategoryRow): Category {
  const image: ProductImage | undefined = row.image_url
    ? {
        url: row.image_url,
        alt: row.image_alt ?? row.name,
        width: row.image_width ?? undefined,
        height: row.image_height ?? undefined,
      }
    : undefined

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image,
    parentId: row.parent_id ?? undefined,
    order: row.sort_order,
  }
}

export function mapProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    brandId: row.brand_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    body: row.body ?? undefined,
    status: row.status,
    tags: row.tags ?? [],
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryIds: row.product_categories?.map((item) => item.category_id) ?? [],
    images:
      row.product_images
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => ({
          url: image.url,
          alt: image.alt,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
        })) ?? [],
    variants:
      row.product_variants
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map((variant) => mapVariant(variant)) ?? [],
  }
}

function mapVariant(row: SupabaseProductVariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    name: row.name,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    currency: row.currency,
    inventory: {
      quantity: row.inventory_quantity,
      trackInventory: row.track_inventory,
      allowBackorder: row.allow_backorder,
    },
    options: row.options ?? [],
    images: [],
    weight: row.weight ?? undefined,
    dimensions: row.dimensions ?? undefined,
  }
}
