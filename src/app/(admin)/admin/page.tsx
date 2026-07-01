import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { getAdminCatalogState } from "@/lib/admin/product-admin"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

export default async function AdminDashboardPage() {
  const { configured, products } = await getAdminCatalogState()
  const stats = [
    { name: "Total Revenue", value: "$0", icon: DollarSign },
    { name: "Orders", value: "0", icon: ShoppingCart },
    { name: "Products", value: configured ? String(products.length) : "Setup required", icon: Package },
    { name: "Customers", value: "0", icon: Users },
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
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No orders yet. Orders will appear here once customers start purchasing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
