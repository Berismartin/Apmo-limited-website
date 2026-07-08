"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/server"

interface SubmitOrderPayload {
  customerEmail: string
  customerName: string
  shippingAddress: any
  subtotal: number
  tax: number
  shipping: number
  total: number
  items: Array<{
    productId: string
    variantId: string
    name: string
    variantName: string
    sku: string
    image: any
    price: number
    quantity: number
    total: number
  }>
}

export async function submitGuestOrderAction(payload: SubmitOrderPayload) {
  const supabase = createSupabaseAdminClient()
  
  // Create a unique order number
  const orderNumber = `APMO-${Date.now().toString(36).toUpperCase()}`

  // Insert Order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      payment_status: "pending",
      subtotal: payload.subtotal,
      tax: payload.tax,
      shipping: payload.shipping,
      total: payload.total,
      currency: "USD",
      customer_email: payload.customerEmail,
      customer_name: payload.customerName,
      shipping_address: payload.shippingAddress,
      billing_address: null,
    })
    .select("id")
    .single()

  if (orderError || !orderData) {
    throw new Error(orderError?.message || "Failed to create order")
  }

  const orderId = orderData.id

  // Insert Line Items
  const lineItemsToInsert = payload.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId || null,
    variant_id: item.variantId || null,
    name: item.name,
    variant_name: item.variantName,
    sku: item.sku || "MANUAL",
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    total: item.total,
  }))

  const { error: itemsError } = await supabase
    .from("order_line_items")
    .insert(lineItemsToInsert)

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  return { success: true, orderId: orderNumber }
}
