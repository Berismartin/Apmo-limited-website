import { notFound } from "next/navigation"
import { BrandForm } from "@/components/admin/brand-form"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteBrandAction,
  getAdminBrand,
  updateBrandAction,
} from "@/lib/admin/brand-admin"
import { DeleteBrandDialog } from "@/components/admin/delete-brand-dialog"

interface EditAdminBrandPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminBrandPage({
  params,
}: EditAdminBrandPageProps) {
  const { id } = await params
  const brand = await getAdminBrand(id)

  if (!brand) notFound()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Edit ${brand.name}`}
          description="Update brand name, slug, and description."
        />
        <DeleteBrandDialog
          brandId={brand.id}
          brandName={brand.name}
          deleteAction={deleteBrandAction}
        />
      </div>
      <div className="mt-8">
        <BrandForm
          action={updateBrandAction}
          brand={brand}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
