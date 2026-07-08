import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { formatPrice } from "@/lib/utils"
import { getAdminOrdersState } from "@/lib/admin/order-admin"

export default async function AdminOrdersPage() {
  const { orders } = await getAdminOrdersState()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Orders" description="Create, update, fulfil, and delete orders." />
        <Button asChild>
          <Link href="/admin/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-4">
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </td>
                    <td className="px-4 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4 capitalize">{order.paymentStatus}</td>
                    <td className="px-4 py-4">{formatPrice(order.total, order.currency)}</td>
                    <td className="px-4 py-4 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/orders/${order.id}`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No orders yet.
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
