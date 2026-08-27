import { BrandForm } from "@/components/admin/brand-form"
import { PageHeader } from "@/components/ui/page-header"
import { createBrandAction } from "@/lib/admin/brand-admin"

export default async function NewAdminBrandPage() {
  return (
    <div>
      <PageHeader
        title="New brand"
        description="Add a new brand for your product catalog."
      />
      <div className="mt-8">
        <BrandForm action={createBrandAction} submitLabel="Create brand" />
      </div>
    </div>
  )
}
