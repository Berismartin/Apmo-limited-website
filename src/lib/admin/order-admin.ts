"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { siteConfig } from "@/lib/config"
import { normalizeCurrencyCode } from "@/lib/utils"
import type {
  Address,
  Order,
  OrderLineItem,
  OrderStatus,
  PaymentStatus,
  ProductImage,
} from "@/types"
import { requireAdmin } from "./require-admin"
import { runAdminMutation } from "./mutation-result"

interface SupabaseOrderLineItemRow {
  id: string
  product_id: string | null
  variant_id: string | null
  name: string
  variant_name: string
  sku: string
  image: ProductImage
  price: number
  quantity: number
  total: number
}

interface SupabaseOrderRow {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  customer_email: string
  customer_name: string
  shipping_address: Address
  billing_address: Address | null
  created_at: string
  updated_at: string
  order_line_items?: SupabaseOrderLineItemRow[]
}

const orderSelect = `
  *,
  order_line_items (*)
`

export interface AdminOrdersState {
  orders: Order[]
}

export async function getAdminOrdersState(): Promise<AdminOrdersState> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return {
    orders: ((data ?? []) as SupabaseOrderRow[]).map(mapOrder),
  }
}

export async function getAdminOrder(id: string): Promise<Order | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapOrder(data as SupabaseOrderRow) : null
}

export async function createOrderAction(formData: FormData) {
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    await upsertOrder(formData)
  })
  if (result?.error) return result
  revalidateOrders()
  redirect("/admin/orders")
}

export async function updateOrderAction(formData: FormData) {
  let id = ""
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing order id")
    await upsertOrder(formData, id)
  })
  if (result?.error) return result
  revalidateOrders()
  redirect("/admin/orders")
}

export async function updateOrderStatusAction(formData: FormData) {
  return runAdminMutation(async () => {
    await requireAdmin()
    const id = String(formData.get("id") ?? "")
    const status = String(formData.get("status") ?? "") as OrderStatus

    if (!id) throw new Error("Missing order id")
    const validStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status")
    }

    const supabase = createSupabaseAdminClient()

    const { data: existing, error: existingError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .maybeSingle()

    if (existingError) throw new Error(existingError.message)
    if (!existing) throw new Error("Order not found")

    const terminalStatuses: OrderStatus[] = ["delivered", "refunded"]
    if (terminalStatuses.includes(existing.status as OrderStatus)) {
      throw new Error(`${existing.status} orders cannot be transitioned to another status`)
    }

    const paymentStatusMap: Record<OrderStatus, PaymentStatus> = {
      pending: "pending",
      processing: "authorized",
      shipped: "captured",
      delivered: "captured",
      cancelled: "failed",
      refunded: "refunded",
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        payment_status: paymentStatusMap[status],
      })
      .eq("id", id)

    if (error) throw new Error(error.message)

    revalidateOrders()
    revalidatePath(`/admin/orders/${id}`)
  })
}

export async function deleteOrderAction(formData: FormData) {
  const result = await runAdminMutation(async () => {
    await requireAdmin()
    const id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Missing order id")

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from("orders").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
  if (result?.error) return result
  revalidateOrders()
  redirect("/admin/orders")
}

async function upsertOrder(formData: FormData, orderId?: string) {
  const supabase = createSupabaseAdminClient()
  const itemQuantity = Number(formData.get("item_quantity") ?? 1)
  const itemPrice = parseMoneyToCents(String(formData.get("item_price") ?? "0"))
  const qty = Number.isFinite(itemQuantity) && itemQuantity > 0 ? itemQuantity : 1
  const itemTotal = itemPrice * qty
  const subtotalInput = String(formData.get("subtotal") ?? "").trim()
  const subtotal = subtotalInput ? parseMoneyToCents(subtotalInput) : itemTotal
  const tax = parseMoneyToCents(String(formData.get("tax") ?? "0"))
  const shipping = parseMoneyToCents(String(formData.get("shipping") ?? "0"))
  const totalInput = String(formData.get("total") ?? "").trim()
  const total = totalInput ? parseMoneyToCents(totalInput) : subtotal + tax + shipping
  const orderNumber =
    String(formData.get("order_number") ?? "").trim() || `APMO-${Date.now()}`
  const status = normalizeSimpleStatus(String(formData.get("status") ?? "pending"))

  const payload = {
    order_number: orderNumber,
    status,
    payment_status: String(formData.get("payment_status") ?? "pending") as PaymentStatus,
    subtotal,
    tax,
    shipping,
    total,
    currency: normalizeCurrencyCode(String(formData.get("currency") || siteConfig.currency)),
    customer_email: requiredText(formData, "customer_email"),
    customer_name: requiredText(formData, "customer_name"),
    shipping_address: buildAddress(formData),
    billing_address: null,
  }

  const orderResult = orderId
    ? await supabase.from("orders").update(payload).eq("id", orderId).select("id").single()
    : await supabase.from("orders").insert(payload).select("id").single()

  if (orderResult.error) throw new Error(orderResult.error.message)
  const id = orderResult.data.id as string

  await supabase.from("order_line_items").delete().eq("order_id", id)

  const itemName = requiredText(formData, "item_name")

  const { error: itemError } = await supabase.from("order_line_items").insert({
    order_id: id,
    product_id: null,
    variant_id: null,
    name: itemName,
    variant_name: String(formData.get("item_variant_name") || "Default"),
    sku: String(formData.get("item_sku") || "MANUAL"),
    image: {
      url: String(formData.get("item_image_url") || "/images/products/placeholder.svg"),
      alt: itemName,
    },
    price: itemPrice,
    quantity: qty,
    total: itemTotal,
  })

  if (itemError) throw new Error(itemError.message)
  return id
}

function normalizeSimpleStatus(value: string): OrderStatus {
  const valid: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
  return valid.includes(value as OrderStatus) ? (value as OrderStatus) : "pending"
}

function mapOrder(row: SupabaseOrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id ?? undefined,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotal: row.subtotal,
    tax: row.tax,
    shipping: row.shipping,
    total: row.total,
    currency: row.currency,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: row.order_line_items?.map(mapOrderLineItem) ?? [],
  }
}

function mapOrderLineItem(row: SupabaseOrderLineItemRow): OrderLineItem {
  const image =
    row.image && typeof row.image === "object" && "url" in row.image
      ? row.image
      : {
          url: "/images/products/placeholder.svg",
          alt: row.name,
        }

  return {
    id: row.id,
    productId: row.product_id ?? "",
    variantId: row.variant_id ?? "",
    name: row.name,
    variantName: row.variant_name,
    sku: row.sku,
    image,
    price: row.price,
    quantity: row.quantity,
    total: row.total,
  }
}

function buildAddress(formData: FormData): Address {
  const customerName = requiredText(formData, "customer_name")
  const [firstName, ...rest] = customerName.split(" ")

  return {
    id: "admin-address",
    type: "shipping",
    firstName: firstName || customerName,
    lastName: rest.join(" ") || "-",
    line1: requiredText(formData, "shipping_line1"),
    city: requiredText(formData, "shipping_city"),
    state: String(formData.get("shipping_state") || ""),
    postalCode: String(formData.get("shipping_postal_code") || ""),
    country: String(formData.get("shipping_country") || "UG"),
    phone: String(formData.get("shipping_phone") || ""),
    isDefault: true,
  }
}

function requiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function parseMoneyToCents(value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100)
}

function revalidateOrders() {
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
}
