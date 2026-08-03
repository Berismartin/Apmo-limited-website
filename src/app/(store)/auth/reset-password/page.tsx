"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AuthCardLayout } from "@/components/auth/auth-card-layout"
import { PasswordInput } from "@/components/auth/password-input"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth"
import { resetPasswordSchema } from "@/lib/validators"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createSupabaseBrowserClient()

    async function prepareSession() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error && active) {
          setInvalidLink(true)
          return
        }
        // Clean the code from the URL without a full reload
        url.searchParams.delete("code")
        window.history.replaceState({}, "", url.pathname)
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) return

      if (session) {
        setReady(true)
        return
      }

      // Hash-based recovery links are parsed by the client; wait briefly then re-check
      if (window.location.hash.includes("type=recovery")) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const {
          data: { session: recoverySession },
        } = await supabase.auth.getSession()
        if (!active) return
        if (recoverySession) {
          setReady(true)
          return
        }
      }

      setInvalidLink(true)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true)
        setInvalidLink(false)
      }
    })

    void prepareSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setLoading(true)
    const response = await updatePassword(password)
    setLoading(false)

    if (!response.ok) {
      toast.error(response.error ?? "Could not update password")
      return
    }

    toast.success("Password updated. You can sign in now.")
    router.push("/auth/login")
  }

  if (invalidLink && !ready) {
    return (
      <AuthCardLayout
        title="Reset link invalid"
        subtitle="This password reset link is invalid or has expired."
        footerText="Need a new link?"
        footerLinkText="Request again"
        footerLinkHref="/auth/forgot-password"
      >
        <Button className="w-full" onClick={() => router.push("/auth/forgot-password")}>
          Request a new reset link
        </Button>
      </AuthCardLayout>
    )
  }

  if (!ready) {
    return (
      <AuthCardLayout
        title="Reset your password"
        subtitle="Confirming your reset link…"
        footerText="Remember your password?"
        footerLinkText="Sign in"
        footerLinkHref="/auth/login"
      >
        <p className="text-center text-sm text-muted-foreground">Please wait a moment.</p>
      </AuthCardLayout>
    )
  }

  return (
    <AuthCardLayout
      title="Choose a new password"
      subtitle="Enter a new password for your account"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
