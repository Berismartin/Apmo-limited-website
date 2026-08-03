"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { siteConfig } from "@/lib/config"

interface OrderFormProps {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

/** Minimal form for creating a manual order. Editing uses OrderDetail. */
export function OrderForm({ action, submitLabel }: OrderFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="currency" value={siteConfig.currency} />
      <input type="hidden" name="status" value="pending" />
      <input type="hidden" name="payment_status" value="pending" />
      <input type="hidden" name="tax" value="0" />
      <input type="hidden" name="shipping" value="0" />

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Name</Label>
            <Input id="customer_name" name="customer_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_email">Email</Label>
            <Input id="customer_email" name="customer_email" type="email" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shipping_line1">Address</Label>
            <Input id="shipping_line1" name="shipping_line1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_city">City</Label>
            <Input id="shipping_city" name="shipping_city" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_phone">Phone</Label>
            <Input id="shipping_phone" name="shipping_phone" />
          </div>
          <input type="hidden" name="shipping_state" value="" />
          <input type="hidden" name="shipping_postal_code" value="" />
          <input type="hidden" name="shipping_country" value="UG" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="item_name">Product name</Label>
            <Input id="item_name" name="item_name" required />
          </div>
          <input type="hidden" name="item_variant_name" value="Default" />
          <input type="hidden" name="item_sku" value="MANUAL" />
          <input
            type="hidden"
            name="item_image_url"
            value="/images/products/placeholder.svg"
          />
          <div className="space-y-2">
            <Label htmlFor="item_price">Price ({siteConfig.currency})</Label>
            <Input
              id="item_price"
              name="item_price"
              type="number"
              step="any"
              min="0"
              defaultValue={0}
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
              defaultValue={1}
              required
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
