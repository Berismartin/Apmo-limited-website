"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/server"
import { requireAdmin } from "./require-admin"
import { runAdminMutation } from "./mutation-result"

export type ContactMessageStatus = "new" | "read" | "archived"

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactMessageStatus
  createdAt: string
}

interface ContactMessageRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactMessageStatus
  created_at: string
}

export interface AdminContactMessagesState {
  messages: ContactMessage[]
  configured: boolean
}

export async function getAdminContactMessages(): Promise<AdminContactMessagesState> {
  if (!isSupabaseAdminConfigured()) {
    return { messages: [], configured: false }
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return {
    messages: ((data ?? []) as ContactMessageRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    })),
    configured: true,
  }
}

export async function updateContactMessageStatusAction(formData: FormData) {
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const id = String(formData.get("id") ?? "")
    const status = String(formData.get("status") ?? "")
    if (!id) throw new Error("Missing message id")
    if (status !== "new" && status !== "read" && status !== "archived") {
      throw new Error("Invalid status")
    }

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id)

    if (error) throw new Error(error.message)
  })
  if (result?.error) return result
  revalidatePath("/admin/contact")
}

export async function deleteContactMessageAction(formData: FormData) {
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing message id")

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from("contact_messages").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
  if (result?.error) return result
  revalidatePath("/admin/contact")
}
