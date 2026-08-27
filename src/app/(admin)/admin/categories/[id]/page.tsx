import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteCategoryAction,
  getAdminCategories,
  getAdminCategory,
  updateCategoryAction,
} from "@/lib/admin/category-admin"
import { DeleteCategoryDialog } from "@/components/admin/delete-category-dialog"

interface EditAdminCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminCategoryPage({
  params,
}: EditAdminCategoryPageProps) {
  const { id } = await params
  const [category, categories] = await Promise.all([
    getAdminCategory(id),
    getAdminCategories(),
  ])

  if (!category) notFound()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Edit ${category.name}`}
          description="Update category details, parent, sort order, and image."
        />
        <DeleteCategoryDialog
          categoryId={category.id}
          categoryName={category.name}
          deleteAction={deleteCategoryAction}
        />
      </div>
      <div className="mt-8">
        <CategoryForm
          action={updateCategoryAction}
          category={category}
          categories={categories}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
