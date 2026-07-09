"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Order } from "@/types"

interface OrderFormProps {
  action: (formData: FormData) => Promise<void>
  order?: Order | null
  submitLabel: string
}

export function OrderForm({ action, order, submitLabel }: OrderFormProps) {
  const item = order?.items[0]
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {order ? <input type="hidden" name="id" value={order.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="order_number">Order number</Label>
            <Input
              id="order_number"
              name="order_number"
              defaultValue={order?.orderNumber}
              placeholder="Auto-generated if empty"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={order?.currency ?? "USD"} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Order status</Label>
            <select
              id="status"
              name="status"
              defaultValue={order?.status ?? "pending"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment status</Label>
            <select
              id="payment_status"
              name="payment_status"
              defaultValue={order?.paymentStatus ?? "pending"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="authorized">Authorized</option>
              <option value="captured">Captured</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer and shipping</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer name</Label>
            <Input id="customer_name" name="customer_name" defaultValue={order?.customerName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_email">Customer email</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              defaultValue={order?.customerEmail}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shipping_line1">Shipping address</Label>
            <Input
              id="shipping_line1"
              name="shipping_line1"
              defaultValue={order?.shippingAddress.line1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_city">City</Label>
            <Input id="shipping_city" name="shipping_city" defaultValue={order?.shippingAddress.city} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_state">State/Region</Label>
            <Input id="shipping_state" name="shipping_state" defaultValue={order?.shippingAddress.state} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_postal_code">Postal code</Label>
            <Input
              id="shipping_postal_code"
              name="shipping_postal_code"
              defaultValue={order?.shippingAddress.postalCode}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_country">Country</Label>
            <Input id="shipping_country" name="shipping_country" defaultValue={order?.shippingAddress.country ?? "UG"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_phone">Phone</Label>
            <Input id="shipping_phone" name="shipping_phone" defaultValue={order?.shippingAddress.phone} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line item and totals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="item_name">Item name</Label>
            <Input id="item_name" name="item_name" defaultValue={item?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_variant_name">Variant</Label>
            <Input id="item_variant_name" name="item_variant_name" defaultValue={item?.variantName ?? "Default"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_sku">SKU</Label>
            <Input id="item_sku" name="item_sku" defaultValue={item?.sku ?? "MANUAL"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_image_url">Item image URL</Label>
            <Input
              id="item_image_url"
              name="item_image_url"
              defaultValue={item?.image.url ?? "/images/products/placeholder.svg"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_price">Item price</Label>
            <Input
              id="item_price"
              name="item_price"
              type="number"
              step="any"
              min="0"
              defaultValue={item ? item.price / 100 : 0}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_quantity">Quantity</Label>
            <Input
              id="item_quantity"
              name="item_quantity"
              type="number"
              min="1"
              defaultValue={item?.quantity ?? 1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtotal">Subtotal</Label>
            <Input
              id="subtotal"
              name="subtotal"
              type="number"
              step="any"
              min="0"
              defaultValue={order ? order.subtotal / 100 : item ? item.total / 100 : 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Tax</Label>
            <Input id="tax" name="tax" type="number" step="any" min="0" defaultValue={order ? order.tax / 100 : 0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping">Shipping</Label>
            <Input
              id="shipping"
              name="shipping"
              type="number"
              step="any"
              min="0"
              defaultValue={order ? order.shipping / 100 : 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              name="total"
              type="number"
              step="any"
              min="0"
              defaultValue={order ? order.total / 100 : ""}
              placeholder="Auto-calculated if empty"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/admin/orders">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
