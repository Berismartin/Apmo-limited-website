import Link from "next/link"
import {
  DollarSign,
  MessageSquareQuote,
  Newspaper,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { getAdminBlogState } from "@/lib/admin/blog-admin"
import { getAdminOrdersState } from "@/lib/admin/order-admin"
import { getAdminCatalogState } from "@/lib/admin/product-admin"
import { getAdminTestimonialsState } from "@/lib/admin/testimonial-admin"
import { siteConfig } from "@/lib/config"
import { formatPrice } from "@/lib/utils"
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/server"

export default async function AdminDashboardPage() {
  const [catalog, ordersState, blogState, testimonialsState, customerCount] =
    await Promise.all([
      getAdminCatalogState(),
      getAdminOrdersState(),
      getAdminBlogState(),
      getAdminTestimonialsState(),
      getCustomerCount(),
    ])

  const products = catalog.products
  const orders = ordersState.orders
  const activeProducts = products.filter((product) => product.status === "active").length
  const pendingOrders = orders.filter((order) =>
    ["pending", "processing"].includes(order.status)
  ).length
  const revenue = orders
    .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
    .reduce((sum, order) => sum + order.total, 0)
  const recentOrders = orders.slice(0, 5)
  const publishedPosts = blogState.posts.filter((post) => Boolean(post.publishedAt)).length
  const publishedTestimonials = testimonialsState.testimonials.filter(
    (item) => item.published
  ).length

  const stats = [
    {
      name: "Total Revenue",
      value: formatPrice(revenue, siteConfig.currency),
      hint: "Completed & open orders",
      icon: DollarSign,
      href: "/admin/orders",
    },
    {
      name: "Orders",
      value: String(orders.length),
      hint: `${pendingOrders} pending / processing`,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      name: "Products",
      value: String(products.length),
      hint: `${activeProducts} active`,
      icon: Package,
      href: "/admin/products",
    },
    {
      name: "Customers",
      value: String(customerCount),
      hint: "Registered profiles",
      icon: Users,
      href: "/admin/customers",
    },
    {
      name: "Blog posts",
      value: String(blogState.posts.length),
      hint: `${publishedPosts} with publish date`,
      icon: Newspaper,
      href: "/admin/blog",
    },
    {
      name: "Testimonials",
      value: String(testimonialsState.testimonials.length),
      hint: `${publishedTestimonials} published`,
      icon: MessageSquareQuote,
      href: "/admin/testimonials",
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Overview of Apmo store activity in ${siteConfig.currency}.`}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block transition-opacity hover:opacity-90">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-rose-700 hover:underline">
            View all
          </Link>
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
                        <div className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(order.total, order.currency || siteConfig.currency)}
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

async function getCustomerCount() {
  if (!isSupabaseAdminConfigured()) return 0

  try {
    const { count, error } = await createSupabaseAdminClient()
      .from("profiles")
      .select("id", { count: "exact", head: true })

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}
