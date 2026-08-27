"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { siteConfig } from "@/lib/config"
import type { OrderStatus } from "@/types"
import { requireAdmin } from "./require-admin"

interface CustomerRow {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
}

interface OrderRow {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  currency: string
  customer_email: string
  customer_name: string
  created_at: string
  order_line_items: { id: string; name: string; quantity: number; total: number }[]
}

export interface AdminCustomer extends CustomerRow {
  order_count: number
  total_spent: number
}

export interface AdminCustomerDetail extends CustomerRow {
  orders: OrderRow[]
  order_count: number
  total_spent: number
}

export async function getAdminCustomers(search?: string): Promise<{
  customers: AdminCustomer[]
  total: number
}> {
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false })

  if (search && search.trim()) {
    const term = `%${search.trim()}%`
    query = query.or(`email.ilike.${term},first_name.ilike.${term},last_name.ilike.${term}`)
  }

  const { data: profiles, error } = await query
  if (error) throw new Error(error.message)

  const customers: AdminCustomer[] = []

  if (profiles && profiles.length > 0) {
    const userIds = profiles.map((p) => p.id)
    const { data: orders } = await supabase
      .from("orders")
      .select("user_id, total")
      .in("user_id", userIds)

    const orderStats = new Map<string, { count: number; spent: number }>()
    if (orders) {
      for (const order of orders) {
        if (!order.user_id) continue
        const existing = orderStats.get(order.user_id) ?? { count: 0, spent: 0 }
        existing.count += 1
        existing.spent += order.total ?? 0
        orderStats.set(order.user_id, existing)
      }
    }

    for (const profile of profiles) {
      const stats = orderStats.get(profile.id) ?? { count: 0, spent: 0 }
      customers.push({
        ...profile,
        order_count: stats.count,
        total_spent: stats.spent,
      })
    }
  }

  return { customers, total: customers.length }
}

export async function getAdminCustomer(id: string): Promise<AdminCustomerDetail | null> {
  const supabase = createSupabaseAdminClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at")
    .eq("id", id)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)
  if (!profile) return null

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, total, currency, customer_email, customer_name, created_at,
      order_line_items ( id, name, quantity, total )
    `)
    .eq("user_id", id)
    .order("created_at", { ascending: false })

  if (ordersError) throw new Error(ordersError.message)

  const orderRows = (orders ?? []) as OrderRow[]
  const totalSpent = orderRows.reduce((sum, o) => sum + (o.total ?? 0), 0)

  return {
    ...profile,
    orders: orderRows,
    order_count: orderRows.length,
    total_spent: totalSpent,
  }
}

export async function updateCustomerRoleAction(formData: FormData) {
  const admin = await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const customerId = String(formData.get("customer_id") ?? "").trim()
  const newRole = String(formData.get("role") ?? "").trim()

  if (!customerId) throw new Error("Customer ID is required")
  if (newRole !== "customer" && newRole !== "admin") {
    throw new Error("Role must be 'customer' or 'admin'")
  }

  if (customerId === admin.id) {
    throw new Error("You cannot change your own role")
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", customerId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/customers")
  revalidatePath(`/admin/customers/${customerId}`)
}
