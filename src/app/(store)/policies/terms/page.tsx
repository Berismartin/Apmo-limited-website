import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the Apmo website and services.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: August 31, 2026
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          Acceptance of Terms
        </h2>
        <p>
          By browsing or ordering from {siteConfig.name}, you agree to these
          Terms of Service. If you don&apos;t agree with any part of them,
          please don&apos;t use our site or services.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Using Our Site
        </h2>
        <p>
          You agree to use {siteConfig.name} only for lawful purposes. If
          you create an account, you&apos;re responsible for keeping your
          login details secure and for anything that happens under your
          account.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Products, Pricing & Availability
        </h2>
        <p>
          We do our best to keep product descriptions, images, and prices
          accurate and up to date. Prices are listed in Ugandan Shillings
          (UGX). Occasionally an error may slip through — if it does, we
          reserve the right to correct it and to cancel or adjust any order
          placed at an incorrect price, and we&apos;ll always contact you
          first.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Orders & Payment
        </h2>
        <p>
          Placing an order is an offer to buy, which we may accept or
          decline (for example, if a product is out of stock or payment
          can&apos;t be verified). Shipping and returns are covered in our{" "}
          Shipping and Returns &amp; Refunds policies.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Intellectual Property
        </h2>
        <p>
          All content on this site — including product photography, text,
          logos, and branding — belongs to {siteConfig.name} and may not be
          copied or reused without our written permission.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} is not
          liable for any indirect or incidental damages arising from your
          use of our site or products.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p>
          Questions about these terms? Reach us at {siteConfig.contact.email}.
        </p>
      </div>
    </div>
  )
}
