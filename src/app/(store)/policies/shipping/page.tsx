import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Shipping rates, delivery times, and order tracking for Apmo orders.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Shipping Policy</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          Where We Ship
        </h2>
        <p>
          Apmo ships within Uganda. Shipping cost and estimated delivery time
          are calculated at checkout based on your delivery location. If
          you&apos;re outside Uganda and would like to place an order, email us
          at {siteConfig.contact.email} to confirm availability and rates
          before you check out.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Free Shipping
        </h2>
        <p>
          Orders over UGX 150,000 qualify for free shipping. Orders below that
          threshold have a delivery fee shown at checkout before you pay.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Order Processing
        </h2>
        <p>
          Orders are typically processed and handed to our delivery partner
          within 1-2 business days of being placed. During busy periods
          (restocks, promotions, holidays), processing may take slightly
          longer — we&apos;ll always let you know if there&apos;s a delay.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Tracking</h2>
        <p>
          You&apos;ll receive a confirmation email once your order has been
          placed. If you have any questions about the status of your
          delivery, contact us at {siteConfig.contact.email} with your order
          number and we&apos;ll look into it right away.
        </p>
      </div>
    </div>
  )
}
