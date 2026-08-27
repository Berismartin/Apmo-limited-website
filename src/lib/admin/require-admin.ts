"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

/**
 * Verifies the caller is an authenticated admin by reading the auth cookie,
 * validating the Supabase JWT, and checking `profiles.role`.
 */
export async function requireAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials are not configured")
  }

  const cookieStore = await cookies()
  const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
  let token = ""
  if (rawToken) {
    try {
      token = decodeURIComponent(rawToken)
    } catch {
      token = rawToken
    }
  }

  if (!token) {
    throw new Error("Authentication required. Please sign in again.")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error("Invalid or expired session. Please sign in again.")
  }

  const admin = createSupabaseAdminClient()
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (profile?.role !== "admin") {
    throw new Error("Admin access required")
  }

  return user
}
