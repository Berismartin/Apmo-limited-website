import { CategoryForm } from "@/components/admin/category-form"
import { PageHeader } from "@/components/ui/page-header"
import {
  createCategoryAction,
  getAdminCategories,
} from "@/lib/admin/category-admin"

export default async function NewAdminCategoryPage() {
  const categories = await getAdminCategories()

  return (
    <div>
      <PageHeader
        title="New category"
        description="Add a new category for organizing products."
      />
      <div className="mt-8">
        <CategoryForm
          action={createCategoryAction}
          categories={categories}
          submitLabel="Create category"
        />
      </div>
    </div>
  )
}
