import Link from "next/link"
import { breadcrumbJsonLd } from "@/lib/structured-data"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/products/product-grid"
import { Pagination } from "@/components/products/pagination"
import type { Category, Product, PaginationMeta } from "@/types"

interface CategoryViewProps {
  category: Category
  products: Product[]
  pagination: PaginationMeta
  subcategories?: Category[]
  ancestors?: Category[]
}

/** Strip parent name prefix from a subcategory display name */
function stripParentPrefix(name: string, parentName: string): string {
  const patterns = [
    new RegExp(`^${parentName}\\s*[-–—:|]\\s*`, "i"),
    new RegExp(`^${parentName}\\s+`, "i"),
  ]
  for (const pattern of patterns) {
    if (pattern.test(name)) return name.replace(pattern, "")
  }
  return name
}

export function CategoryView({
  category,
  products,
  pagination,
  subcategories = [],
  ancestors = [],
}: CategoryViewProps) {
  const parentTrail = ancestors.filter((cat) => cat.id !== category.id)
  // Full ancestor trail for breadcrumbs — e.g. Shop > Haircare
  const trail = [
    { name: "Shop", href: "/shop" },
    ...parentTrail.map((c) => ({ name: c.name, href: `/${c.slug}` })),
    { name: category.name, href: `/${category.slug}` },
  ]

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(trail)),
        }}
      />
      {/* Breadcrumb — full ancestor trail */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/shop" />}>Shop</BreadcrumbLink>
          </BreadcrumbItem>
          {parentTrail.map((cat) => (
            <div key={cat.id} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/${cat.slug}`} />}>
                  {cat.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mt-2">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        {pagination.total > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination.total}{" "}
            {pagination.total === 1 ? "product" : "products"}
          </p>
        )}
      </div>

      {/* Subcategories — parent prefix stripped, no "All" pill */}
      {subcategories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/${sub.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-foreground"
            >
              {stripParentPrefix(sub.name, category.name)}
            </Link>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="mt-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-lg font-medium tracking-tight">
              No products in {category.name} yet
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              We&apos;re still stocking this collection. Browse the full shop
              in the meantime.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Browse all products</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      {/* Pagination */}
      <div className="mt-12">
        <Pagination
          pagination={pagination}
          basePath={`/${category.slug}`}
        />
      </div>
    </div>
  )
}
