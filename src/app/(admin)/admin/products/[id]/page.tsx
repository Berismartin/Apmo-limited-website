import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteProductAction,
  deleteProductImageAction,
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
  const [{ categories, brands }, product] = await Promise.all([
    getAdminCatalogState(),
    getAdminProduct(id),
  ])

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
          deleteImageAction={deleteProductImageAction}
          brands={brands}
          categories={categories}
          product={product}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
