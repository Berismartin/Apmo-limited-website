import { OrderForm } from "@/components/admin/order-form"
import { PageHeader } from "@/components/ui/page-header"
import { createOrderAction } from "@/lib/admin/order-admin"

export default async function NewAdminOrderPage() {
  return (
    <div>
      <PageHeader title="New Order" description="Create a manual customer order." />
      <div className="mt-8">
        <OrderForm action={createOrderAction} submitLabel="Create order" />
      </div>
    </div>
  )
}
