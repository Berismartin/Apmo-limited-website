import { notFound } from "next/navigation"
import { OrderForm } from "@/components/admin/order-form"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteOrderAction,
  getAdminOrder,
  updateOrderAction,
} from "@/lib/admin/order-admin"
import { DeleteOrderDialog } from "@/components/admin/delete-order-dialog"

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
        <DeleteOrderDialog
          orderId={order.id}
          orderName={`Order ${order.orderNumber}`}
          deleteAction={deleteOrderAction}
        />
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
