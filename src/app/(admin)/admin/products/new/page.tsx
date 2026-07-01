import { ProductForm } from "@/components/admin/product-form"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { createProductAction, getAdminCatalogState } from "@/lib/admin/product-admin"

export default async function NewAdminProductPage() {
  const { configured, categories, brands } = await getAdminCatalogState()

  if (!configured) {
    return (
      <div>
        <PageHeader title="New Product" description="Create a Supabase product." />
        <Card className="mt-8">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Supabase admin credentials are required before creating products.
          </CardContent>
        </Card>
      </div>
    )
  }

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
