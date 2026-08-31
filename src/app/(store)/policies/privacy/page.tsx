import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Apmo collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: August 31, 2026
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          Information We Collect
        </h2>
        <p>
          We collect information you give us directly — like your name,
          email address, delivery address, and order details — when you
          place an order, sign up for our newsletter, or contact us. We also
          collect basic information about how you use our site, such as
          pages viewed, to help us improve it.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          How We Use Your Information
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>To process, fulfill, and deliver your orders</li>
          <li>To communicate with you about your orders and questions</li>
          <li>To send you newsletter and promotional emails, only if you&apos;ve subscribed</li>
          <li>To improve our products, site, and customer experience</li>
          <li>To detect and prevent fraud or misuse</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">
          Cookies
        </h2>
        <p>
          We use essential cookies to keep your cart, wishlist, and account
          session working while you browse. We do not sell your personal
          information to third parties.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Sharing Your Information
        </h2>
        <p>
          We only share your information with service providers who help us
          run our business — such as delivery partners and payment
          processors — and only to the extent needed to fulfill your order.
          We do not store your full payment card details on our servers.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
        <p>
          You can ask us to access, update, or delete your personal
          information at any time, and you can unsubscribe from marketing
          emails whenever you like. Contact us at {siteConfig.contact.email}{" "}
          with any requests.
        </p>
      </div>
    </div>
  )
}
