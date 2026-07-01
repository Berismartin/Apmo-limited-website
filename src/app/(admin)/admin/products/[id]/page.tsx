import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteProductAction,
  getAdminCatalogState,
  getAdminProduct,
  updateProductAction,
} from "@/lib/admin/product-admin"

interface EditAdminProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminProductPage({
  params,
}: EditAdminProductPageProps) {
  const { id } = await params
  const [{ configured, categories, brands }, product] = await Promise.all([
    getAdminCatalogState(),
    getAdminProduct(id),
  ])

  if (!configured) {
    return (
      <div>
        <PageHeader title="Edit Product" description="Update a Supabase product." />
        <Card className="mt-8">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Supabase admin credentials are required before editing products.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) notFound()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Edit ${product.name}`}
          description="Update product details, category placement, imagery, pricing, and inventory."
        />
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <Button type="submit" variant="destructive">
            Delete
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <ProductForm
          action={updateProductAction}
          brands={brands}
          categories={categories}
          product={product}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
