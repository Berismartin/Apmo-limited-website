"use server"

import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/server"
import { contactFormSchema, newsletterSchema } from "@/lib/validators"
import { mutationError, type MutationResult } from "@/lib/admin/mutation-result"

export async function submitContactMessageAction(
  input: unknown
): Promise<MutationResult | void> {
  const parsed = contactFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission" }
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      error: "The contact form isn't connected yet — please email us directly instead.",
    }
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    })
    if (error) throw new Error(error.message)
  } catch (error) {
    return mutationError(error)
  }
}

export async function subscribeToNewsletterAction(
  input: unknown
): Promise<MutationResult | void> {
  const parsed = newsletterSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email" }
  }

  if (!isSupabaseAdminConfigured()) {
    return { error: "Newsletter signup isn't connected yet." }
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: parsed.data.email }, { onConflict: "email", ignoreDuplicates: true })
    if (error) throw new Error(error.message)
  } catch (error) {
    return mutationError(error)
  }
}
