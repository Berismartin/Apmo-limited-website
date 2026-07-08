import { ProductForm } from "@/components/admin/product-form"
import { PageHeader } from "@/components/ui/page-header"
import { createProductAction, getAdminCatalogState } from "@/lib/admin/product-admin"

export default async function NewAdminProductPage() {
  const { categories, brands } = await getAdminCatalogState()

  return (
    <div>
      <PageHeader title="New Product" description="Create a new Apmo catalog product." />
      <div className="mt-8">
        <ProductForm
          action={createProductAction}
          brands={brands}
          categories={categories}
          submitLabel="Create product"
        />
      </div>
    </div>
  )
}
