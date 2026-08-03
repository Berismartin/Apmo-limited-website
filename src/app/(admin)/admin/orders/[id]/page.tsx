import { notFound } from "next/navigation"
import { OrderDetail } from "@/components/admin/order-detail"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteOrderAction,
  getAdminOrder,
  updateOrderStatusAction,
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
          title={`Order ${order.orderNumber}`}
          description="View items and update fulfilment status."
        />
        <DeleteOrderDialog
          orderId={order.id}
          orderName={`Order ${order.orderNumber}`}
          deleteAction={deleteOrderAction}
        />
      </div>

      <div className="mt-8">
        <OrderDetail order={order} updateStatusAction={updateOrderStatusAction} />
      </div>
    </div>
  )
}
