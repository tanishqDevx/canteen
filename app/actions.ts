"use server"

import crypto from "crypto"
import { sendDiscordNotification } from "./utils/discord"

// This would typically come from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ""
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

// Create a Razorpay order
export async function createOrder(amount: number) {
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw error
  }
}

// Verify Razorpay payment
export async function verifyPayment(params: {
  paymentId: string
  orderId: string
  signature: string
  orderDetails?: {
    customerName: string
    phoneNumber: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    total: number
    address: string
  }
}) {
  const { paymentId, orderId, signature, orderDetails } = params

  // Generate the expected signature
  const text = `${orderId}|${paymentId}`
  const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(text).digest("hex")

  // Verify the signature
  const isAuthentic = expectedSignature === signature

  if (isAuthentic) {
    // Send Discord notification if order details are provided
    if (orderDetails) {
      await sendDiscordNotification({
        ...orderDetails,
        orderId,
      })
    }
    return { success: true }
  } else {
    return { success: false, error: "Invalid payment signature" }
  }
}

