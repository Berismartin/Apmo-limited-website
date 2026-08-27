import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { getAdminBrands, deleteBrandAction } from "@/lib/admin/brand-admin"
import { DeleteBrandDialog } from "@/components/admin/delete-brand-dialog"

export default async function AdminBrandsPage() {
  const brands = await getAdminBrands()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Brands"
          description="Manage the brands available for products."
        />
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" />
            New brand
          </Link>
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {brand.slug}
                    </td>
                    <td className="max-w-md px-4 py-3 text-muted-foreground">
                      <p className="line-clamp-2">{brand.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/brands/${brand.id}`}>Edit</Link>
                        </Button>
                        <DeleteBrandDialog
                          brandId={brand.id}
                          brandName={brand.name}
                          deleteAction={deleteBrandAction}
                          triggerNode={<Button size="sm" variant="destructive" />}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {brands.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      No brands yet.
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
