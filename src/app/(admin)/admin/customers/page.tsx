import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { CustomerSearch } from "@/components/admin/customer-search"
import { getAdminCustomers } from "@/lib/admin/customer-admin"
import { formatPrice, formatDate } from "@/lib/utils"
import { siteConfig } from "@/lib/config"

interface Props {
  searchParams: Promise<{ search?: string }>
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { search } = await searchParams
  const { customers, total } = await getAdminCustomers(search)

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${total} registered user${total !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}.`}
      />

      <div className="mt-6">
        <CustomerSearch defaultValue={search ?? ""} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Total Spent</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-rose-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-[#351426] hover:underline"
                      >
                        {[customer.first_name, customer.last_name].filter(Boolean).join(" ") || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {customer.email ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={customer.role === "admin" ? "default" : "secondary"}>
                        {customer.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {customer.order_count}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatPrice(customer.total_spent, siteConfig.currency)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      {search ? `No customers found matching "${search}".` : "No registered users yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
