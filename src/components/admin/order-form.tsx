"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
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
      try {
        await action(formData)
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") {
          toast.success("Order created successfully")
          throw err
        }
        toast.error(err instanceof Error ? err.message : "Failed to save order")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="currency" value={siteConfig.currency} />
      <input type="hidden" name="status" value="pending" />
      <input type="hidden" name="payment_status" value="pending" />

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
          <div className="space-y-2">
            <Label htmlFor="shipping_state">State / Region</Label>
            <Input id="shipping_state" name="shipping_state" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_postal_code">Postal code</Label>
            <Input id="shipping_postal_code" name="shipping_postal_code" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_country">Country</Label>
            <Input id="shipping_country" name="shipping_country" defaultValue="UG" required />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="tax">Tax ({siteConfig.currency})</Label>
            <Input
              id="tax"
              name="tax"
              type="number"
              step="any"
              min="0"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping">Shipping ({siteConfig.currency})</Label>
            <Input
              id="shipping"
              name="shipping"
              type="number"
              step="any"
              min="0"
              defaultValue={0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/admin/orders">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
