import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { getAdminCustomer } from "@/lib/admin/customer-admin"
import { formatPrice, formatDate } from "@/lib/utils"
import { siteConfig } from "@/lib/config"
import { CustomerRoleForm } from "./customer-role-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params
  const customer = await getAdminCustomer(id)

  if (!customer) notFound()

  const displayName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Unknown"

  return (
    <div>
      <PageHeader
        title={displayName}
        description={`Customer since ${formatDate(customer.created_at)}`}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Customer Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{displayName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant={customer.role === "admin" ? "default" : "secondary"} className="mt-1">
                {customer.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">{formatDate(customer.created_at)}</p>
            </div>

            <div className="border-t border-rose-100 pt-4">
              <CustomerRoleForm
                customerId={customer.id}
                currentRole={customer.role}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats + Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-[#351426]">{customer.order_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-[#351426]">
                  {formatPrice(customer.total_spent, siteConfig.currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-rose-50/50 transition-colors">
                        <td className="px-4 py-4 font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-[#351426] hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatPrice(order.total, order.currency || siteConfig.currency)}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                    {customer.orders.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
