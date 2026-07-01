import Link from "next/link"
import { PackagePlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { formatPrice } from "@/lib/utils"
import { getAdminCatalogState } from "@/lib/admin/product-admin"

export default async function AdminProductsPage() {
  const { configured, products } = await getAdminCatalogState()

  if (!configured) {
    return (
      <div>
        <PageHeader
          title="Products"
          description="Manage Apmo products from Supabase."
        />
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="font-semibold">Supabase is not configured yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
              and `SUPABASE_SERVICE_ROLE_KEY` to your environment, then run the
              Supabase migration.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Products"
          description="Create, edit, archive, and publish Apmo products."
        />
        <Button asChild>
          <Link href="/admin/products/new">
            <PackagePlus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Inventory</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const variant = product.variants[0]
                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="px-4 py-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">/{product.slug}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {variant ? formatPrice(variant.price, variant.currency) : "-"}
                      </td>
                      <td className="px-4 py-4">
                        {variant?.inventory.quantity ?? 0}
                      </td>
                      <td className="px-4 py-4">{product.featured ? "Yes" : "No"}</td>
                      <td className="px-4 py-4 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/products/${product.id}`}>Edit</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
