import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { productRepository, categoryRepository, brandRepository } from "@/lib/repositories"
import { resolveStoreCategory } from "@/lib/catalog/resolve-store-category"
import { shopLinks } from "@/lib/navigation"
import { ProductDetailView } from "./product-detail-view"
import { CategoryView } from "./category-view"
import { BrandView } from "./brand-view"
import { formatPrice } from "@/lib/utils"
import { siteConfig } from "@/lib/config"
import type { PaginationMeta } from "@/types"

const EMPTY_CATEGORY_PAGE: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 40,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
}


interface SlugPageProps {
  params: Promise<{ slug: string }>
}

// generateStaticParams pre-renders known slugs at build time. Slugs added or
// changed later (via the admin panel) are NOT in that list — dynamicParams
// defaults to true, so Next renders those on-demand at request time instead
// of 404ing until the next full rebuild+redeploy. This matches how
// blog/[slug] already behaves; do not set dynamicParams = false here again
// unless a full rebuild is guaranteed on every catalog change.
export async function generateStaticParams() {
  const [{ items: products }, categories, brands] = await Promise.all([
    productRepository.list(undefined, undefined, { page: 1, limit: 1000 }),
    categoryRepository.list(),
    brandRepository.list(),
  ])

  const productSlugs = products
    .filter((p) => p.status === "active")
    .map((p) => ({ slug: p.slug }))
  const categorySlugs = categories.map((c) => ({ slug: c.slug }))
  const brandSlugs = brands.map((b) => ({ slug: b.slug }))
  const navSlugs = shopLinks
    .filter((item) => item.href !== "/shop")
    .map((item) => ({ slug: item.href.replace(/^\//, "") }))

  return [...productSlugs, ...categorySlugs, ...brandSlugs, ...navSlugs]
}

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params

  const product = await productRepository.getBySlug(slug)
  if (product) {
    const variant = product.variants[0]
    const price = variant ? formatPrice(variant.price, variant.currency) : ""
    return {
      title: product.name,
      description: product.description,
      alternates: { canonical: `/${product.slug}` },
      openGraph: {
        title: product.name,
        description: product.description,
        type: "website",
        url: `${siteConfig.url}/${product.slug}`,
        images: product.images[0]
          ? [{ url: product.images[0].url, alt: product.images[0].alt }]
          : [],
      },
      other: {
        "product:price:amount": variant
          ? String(variant.price / 100)
          : "",
        "product:price:currency": variant?.currency ?? siteConfig.currency,
      },
    }
  }

  const category = await resolveStoreCategory(slug)
  if (category) {
    return {
      title: category.name,
      description: category.description || `Shop ${category.name} from ${siteConfig.name}.`,
      alternates: { canonical: `/${category.slug}` },
      openGraph: {
        title: category.name,
        description: category.description || `Shop ${category.name} from ${siteConfig.name}.`,
        type: "website",
        url: `${siteConfig.url}/${category.slug}`,
      },
    }
  }

  const brand = await brandRepository.getBySlug(slug)
  if (brand) {
    return {
      title: brand.name,
      description: brand.description,
      alternates: { canonical: `/${brand.slug}` },
      openGraph: {
        title: brand.name,
        description: brand.description,
        type: "website",
        url: `${siteConfig.url}/${brand.slug}`,
      },
    }
  }

  return { title: "Not Found" }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params

  // Check product first
  const product = await productRepository.getBySlug(slug)
  if (product) {
    // Pick the most specific category (prefer one with a parentId, i.e. a subcategory)
    const productCategories = await Promise.all(
      product.categoryIds.map((id) => categoryRepository.getById(id))
    )
    const validCategories = productCategories.filter(
      (c): c is NonNullable<typeof c> => c !== null
    )
    const primaryCategory =
      validCategories.find((c) => c.parentId) ?? validCategories[0] ?? null

    const [relatedProducts, brand, categoryAncestors] = await Promise.all([
      primaryCategory
        ? productRepository
            .getByCategory(primaryCategory.slug, { page: 1, limit: 5 })
            .then((r) => r.items.filter((p) => p.id !== product.id).slice(0, 4))
        : Promise.resolve([]),
      brandRepository.getById(product.brandId),
      primaryCategory
        ? categoryRepository.getAncestors(primaryCategory.id)
        : Promise.resolve([]),
    ])

    return (
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        brand={brand}
        categoryAncestors={categoryAncestors}
      />
    )
  }

  // Check category (including known shop nav slugs with no catalog row yet)
  const category = await resolveStoreCategory(slug)
  if (category) {
    const isPlaceholder = category.id.startsWith("nav-")
    const [{ items: products, pagination }, subcategories, ancestors] =
      await Promise.all([
        productRepository
          .getByCategory(category.slug, { page: 1, limit: 40 })
          .catch(() => ({ items: [], pagination: EMPTY_CATEGORY_PAGE })),
        isPlaceholder
          ? Promise.resolve([])
          : categoryRepository.getChildren(category.id).catch(() => []),
        isPlaceholder
          ? Promise.resolve([])
          : categoryRepository.getAncestors(category.id).catch(() => []),
      ])
    return (
      <CategoryView
        category={category}
        products={products}
        pagination={pagination}
        subcategories={subcategories}
        ancestors={ancestors}
      />
    )
  }

  // Check brand
  const brand = await brandRepository.getBySlug(slug)
  if (brand) {
    const { items: products, pagination } = await productRepository.list(
      { tags: [] },
      undefined,
      { page: 1, limit: 40 }
    )
    const brandProducts = products.filter((p) => p.brandId === brand.id)
    return (
      <BrandView
        brand={brand}
        products={brandProducts}
        pagination={{ ...pagination, total: brandProducts.length, totalPages: 1, hasNext: false }}
      />
    )
  }

  notFound()
}
