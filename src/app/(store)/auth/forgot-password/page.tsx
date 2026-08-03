"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCardLayout } from "@/components/auth/auth-card-layout"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"
import { forgotPasswordSchema } from "@/lib/validators"

export default function ForgotPasswordPage() {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setLoading(true)
    const response = await requestPasswordReset(email.trim())
    setLoading(false)

    if (!response.ok) {
      toast.error(response.error ?? "Could not send reset email")
      return
    }

    setSent(true)
    toast.success("If an account exists for that email, a reset link is on its way.")
  }

  return (
    <AuthCardLayout
      title="Reset your password"
      subtitle={
        sent
          ? "Check your inbox for the reset link."
          : "Enter your email and we'll send you a reset link"
      }
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/login"
    >
      {sent ? (
        <div className="space-y-4 text-center text-sm text-muted-foreground">
          <p>
            We sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            It may take a minute to arrive.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  )
}
