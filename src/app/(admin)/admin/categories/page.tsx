import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteCategoryAction,
  getAdminCategories,
} from "@/lib/admin/category-admin"
import { DeleteCategoryDialog } from "@/components/admin/delete-category-dialog"

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  const parentMap = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Categories"
          description="Manage product categories and their hierarchy."
        />
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New category
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
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category.parentId
                        ? parentMap.get(category.parentId) ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{category.order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/categories/${category.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <DeleteCategoryDialog
                          categoryId={category.id}
                          categoryName={category.name}
                          deleteAction={deleteCategoryAction}
                          triggerNode={
                            <Button size="sm" variant="destructive" />
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      No categories yet.
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
