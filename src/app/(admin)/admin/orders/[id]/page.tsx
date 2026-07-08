import { notFound } from "next/navigation"
import { OrderForm } from "@/components/admin/order-form"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteOrderAction,
  getAdminOrder,
  updateOrderAction,
} from "@/lib/admin/order-admin"

interface EditAdminOrderPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminOrderPage({
  params,
}: EditAdminOrderPageProps) {
  const { id } = await params
  const order = await getAdminOrder(id)

  if (!order) notFound()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Edit ${order.orderNumber}`}
          description="Update fulfilment status, payment status, customer details, totals, and line item."
        />
        <form action={deleteOrderAction}>
          <input type="hidden" name="id" value={order.id} />
          <Button type="submit" variant="destructive">
            Delete
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <OrderForm
          action={updateOrderAction}
          order={order}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
