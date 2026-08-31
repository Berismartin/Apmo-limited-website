import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Apmo's return and refund policy — easy 30-day returns.",
}

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Returns & Refunds
      </h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          30-Day Return Policy
        </h2>
        <p>
          We want you to be happy with every Apmo order. If a product
          isn&apos;t right for you, you can return it within 30 days of
          delivery for a refund.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Return Conditions
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Items must be unused, unopened, and in their original packaging</li>
          <li>A proof of purchase (order number or receipt) is required</li>
          <li>Sale and clearance items are final sale and cannot be returned</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">
          How to Return an Item
        </h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            Email {siteConfig.contact.email} with your order number and the
            reason for your return
          </li>
          <li>Our team will confirm your return and share drop-off or pickup instructions</li>
          <li>Pack the item securely in its original packaging</li>
        </ol>

        <h2 className="text-xl font-semibold text-foreground">Refunds</h2>
        <p>
          Once we receive and inspect your returned item, we&apos;ll notify
          you by email and process your refund to your original payment
          method within 5-7 business days.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Questions?</h2>
        <p>
          Reach out to {siteConfig.contact.email} any time and we&apos;ll be
          happy to help.
        </p>
      </div>
    </div>
  )
}
