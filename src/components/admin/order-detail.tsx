"use client"

import { useTransition } from "react"
import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { formatDate, formatPrice } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types"

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

interface OrderDetailProps {
  order: Order
  updateStatusAction: (formData: FormData) => Promise<void>
}

export function OrderDetail({ order, updateStatusAction }: OrderDetailProps) {
  const [isPending, startTransition] = useTransition()
  const address = order.shippingAddress

  const handleStatus = (status: OrderStatus) => {
    const formData = new FormData()
    formData.set("id", order.id)
    formData.set("status", status)
    startTransition(async () => {
      await updateStatusAction(formData)
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">{order.orderNumber}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-[#351426]">Update status</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isActive = order.status === option.value
              const cannotCancelDelivered =
                order.status === "delivered" && option.value === "cancelled"
              const disabled = isPending || isActive || cannotCancelDelivered

              return (
                <Button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  variant={isActive ? "default" : "outline"}
                  className={
                    option.value === "cancelled" && !isActive
                      ? "border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                      : option.value === "delivered" && !isActive
                        ? "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                        : undefined
                  }
                  onClick={() => handleStatus(option.value)}
                >
                  {isActive
                    ? `${option.label} (current)`
                    : cannotCancelDelivered
                      ? "Cancel (locked)"
                      : option.label}
                </Button>
              )
            })}
          </div>
          {order.status === "delivered" ? (
            <p className="text-xs text-muted-foreground">
              Delivered orders can’t be cancelled.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-[#351426]">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
            {address?.phone ? (
              <p className="text-muted-foreground">{address.phone}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{address?.line1}</p>
            {address?.line2 ? <p>{address.line2}</p> : null}
            <p>
              {[address?.city, address?.state, address?.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>{address?.country}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items on this order.</p>
          ) : (
            order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-rose-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
                  <AppImage
                    src={item.image?.url || PLACEHOLDER_IMAGE}
                    alt={item.image?.alt || item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#351426]">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantName}
                    {item.sku ? ` · ${item.sku}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Qty {item.quantity} × {formatPrice(item.price, order.currency)}
                  </p>
                </div>
                <p className="shrink-0 font-medium">
                  {formatPrice(item.total, order.currency)}
                </p>
              </div>
            ))
          )}

          <div className="space-y-2 border-t border-rose-100 pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            {order.shipping > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping, order.currency)}</span>
              </div>
            ) : null}
            {order.tax > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatPrice(order.tax, order.currency)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-semibold text-[#351426]">
              <span>Total</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    </div>
  )
}
