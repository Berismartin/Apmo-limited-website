import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { getAdminOrdersState } from "@/lib/admin/order-admin"
import { getAdminCatalogState } from "@/lib/admin/product-admin"
import { formatPrice } from "@/lib/utils"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

export default async function AdminDashboardPage() {
  const [{ products }, ordersState, customersResult] = await Promise.all([
    getAdminCatalogState(),
    getAdminOrdersState(),
    createSupabaseAdminClient()
      .from("profiles")
      .select("id", { count: "exact", head: true }),
  ])

  const orders = ordersState.orders
  const revenue = orders.reduce((sum, order) => sum + order.total, 0)
  const recentOrders = orders.slice(0, 5)

  const stats = [
    { name: "Total Revenue", value: formatPrice(revenue, "USD"), icon: DollarSign },
    { name: "Orders", value: String(orders.length), icon: ShoppingCart },
    { name: "Products", value: String(products.length), icon: Package },
    { name: "Customers", value: String(customersResult.count ?? 0), icon: Users },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store performance." />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">
              No orders yet. Orders will appear here once customers start purchasing.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-rose-700 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(order.total, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
