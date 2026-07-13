import { AppImage } from "@/components/ui/app-image"
import Link from "next/link"
import { PackagePlus, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { formatPrice } from "@/lib/utils"
import { getAdminCatalogState, deleteProductAction } from "@/lib/admin/product-admin"
import { DeleteProductDialog } from "@/components/admin/delete-product-dialog"

export default async function AdminProductsPage() {
  const { products } = await getAdminCatalogState()

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
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const variant = product.variants[0]
                  const image = product.images[0]
                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Product thumbnail */}
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-rose-100 bg-rose-50">
                            {image ? (
                              <AppImage
                                src={image.url}
                                alt={image.alt}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-rose-200" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">/{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {variant ? formatPrice(variant.price, variant.currency) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {variant?.inventory.quantity ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/products/${product.id}`}>Edit</Link>
                          </Button>
                          <DeleteProductDialog
                            productId={product.id}
                            productName={product.name}
                            deleteAction={deleteProductAction}
                            triggerNode={
                              <Button size="sm" variant="destructive" />
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No products yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
