import type { Metadata } from "next"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CoverPhoto } from "@/components/apmo/cover-photo"
import { modelImages } from "@/components/apmo/data"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Apmo products, rituals, guidance, and orders.",
}

const faqs = [
  {
    question: "What hair types are Apmo products designed for?",
    answer:
      "Apmo products are designed for textured hair, curls, coils, relaxed hair, protective styles, and customers who want gentle moisture-first routines.",
  },
  {
    question: "Can I get help choosing the right product?",
    answer:
      "Yes. Use the contact page or book the hair ritual consultation product for guidance based on your texture, routine, and goals.",
  },
  {
    question: "Is the full Apmo website live?",
    answer:
      "Yes — the shop is fully live. Browse products, add them to your cart, and check out directly on the site.",
  },
  {
    question: "How should I use the Petangler Mist?",
    answer:
      "Mist through damp or dry hair section by section before combing, finger detangling, or refreshing curls and protective styles.",
  },
  {
    question: "Do the products work for children?",
    answer:
      "The routines are designed to be practical for family haircare, including easier detangling moments. For sensitivities, contact Apmo before purchase.",
  },
  {
    question: "How do I contact Apmo?",
    answer:
      "You can use the contact form or email hello@apmoug.com for product guidance, launch questions, and support.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Contact Apmo as soon as possible after placing an order. If fulfillment has not started, the team can help adjust the request.",
  },
  {
    question: "Do you offer consultations?",
    answer:
      "Yes. The Apmo Hair Ritual Consultation is available in the shop as a guided service for building a personal routine.",
  },
]

export default function FAQPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <CoverPhoto
          src={modelImages.hairLeaveIn}
          alt=""
          objectPosition="top"
          className="opacity-[0.14]"
        />
        <div className="absolute inset-0 bg-[#fff8f1]/82" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="text-3xl font-bold tracking-tight">
        Frequently Asked Questions
      </h1>
      <p className="mt-4 text-muted-foreground">
        Find answers to common questions about Apmo products, rituals, guidance,
        and ordering.
      </p>

      <Accordion className="mt-8">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-lg border bg-neutral-50 p-6 text-center">
        <h2 className="text-lg font-semibold">Still have questions?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Our support team is
          happy to help.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block text-sm font-medium underline hover:text-foreground"
        >
          Contact Support
        </Link>
      </div>
      </div>
    </div>
  )
}
