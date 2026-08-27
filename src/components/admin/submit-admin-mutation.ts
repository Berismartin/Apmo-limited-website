"use client"

import { unstable_rethrow } from "next/navigation"
import { toast } from "sonner"
import type { MutationResult } from "@/lib/admin/mutation-result"

function isRedirectError(error: unknown) {
  if (typeof error !== "object" || error === null) return false
  const digest =
    "digest" in error && typeof error.digest === "string" ? error.digest : ""
  if (digest.startsWith("NEXT_REDIRECT")) return true
  return error instanceof Error && error.message === "NEXT_REDIRECT"
}

function userFacingError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  const { message } = error
  if (
    message === "NEXT_REDIRECT" ||
    message.includes("omitted in production") ||
    message.includes("Server Components render")
  ) {
    return fallback
  }
  return message
}

export async function submitAdminMutation(
  run: () => Promise<MutationResult | void>,
  messages: { success: string; failure: string }
) {
  try {
    const result = await run()
    if (result?.error) {
      toast.error(result.error)
      return false
    }
    toast.success(messages.success)
    return true
  } catch (error) {
    if (isRedirectError(error)) {
      toast.success(messages.success)
      throw error
    }
    unstable_rethrow(error)
    toast.error(userFacingError(error, messages.failure))
    return false
  }
}
