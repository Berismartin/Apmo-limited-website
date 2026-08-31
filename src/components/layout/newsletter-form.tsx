"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { newsletterSchema } from "@/lib/validators"
import { subscribeToNewsletterAction } from "@/lib/actions/contact"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = newsletterSchema.safeParse({ email })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const mutation = await subscribeToNewsletterAction(result.data)
      if (mutation?.error) {
        toast.error(mutation.error)
        return
      }
      toast.success("Thanks for subscribing!")
      setEmail("")
    } catch {
      toast.error("Couldn't subscribe right now. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        aria-label="Email address for newsletter"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-70"
      />
      <Button variant="secondary" type="submit" disabled={loading}>
        {loading ? "..." : "Subscribe"}
      </Button>
    </form>
  )
}
