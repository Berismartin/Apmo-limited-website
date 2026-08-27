"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const AUTH_COOKIE_NAME = "apmo-auth-token"

/**
 * Verifies the caller is an authenticated admin by reading the auth cookie,
 * validating the Supabase JWT, and checking `profiles.role`.
 * Throws if the caller is not an authenticated admin.
 */
export async function requireAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials are not configured")
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Invalid or expired session")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Admin access required")
  }

  return user
}
