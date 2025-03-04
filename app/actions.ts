"use server"

import crypto from "crypto"
import { sendDiscordNotification } from "./utils/discord"
import { cookies } from "next/headers"

// Environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ""
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

// Types
interface OrderDetails {
  customerName: string
  phoneNumber: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

// Create a Razorpay order securely on the server
export async function createOrder(orderDetails: OrderDetails) {
  try {
    // Calculate total amount on the server side
    const subtotal = orderDetails.items.reduce((total, item) => total + item.price * item.quantity, 0)

    // Add 2% convenience fee
    const convenienceFee = subtotal * 0.02
    const totalAmount = Math.round((subtotal + convenienceFee) * 100) // Convert to paise and round

    // Create a unique receipt ID
    const receiptId = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    // Store order details in a secure server-side session
    // This prevents tampering with order details between creation and verification
    const orderData = {
      customerName: orderDetails.customerName,
      phoneNumber: orderDetails.phoneNumber,
      items: orderDetails.items,
      subtotal,
      convenienceFee,
      totalAmount: totalAmount / 100, // Store in rupees for easier reading
      receiptId,
    }

    // Store in an encrypted cookie
    cookies().set(`order_${receiptId}`, JSON.stringify(orderData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 hour expiry
      path: "/",
    })

    // Create Razorpay order
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "INR",
        receipt: receiptId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Razorpay order creation failed:", errorData)
      throw new Error(`Failed to create order: ${response.statusText}`)
    }

    const orderResponse = await response.json()

    // Return only what the frontend needs - the order ID and key
    return {
      orderId: orderResponse.id,
      amount: totalAmount,
      keyId: RAZORPAY_KEY_ID,
      receiptId,
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw new Error("Failed to create payment order. Please try again.")
  }
}

// Verify Razorpay payment
export async function verifyPayment(params: {
  paymentId: string
  orderId: string
  signature: string
  receiptId: string
}) {
  const { paymentId, orderId, signature, receiptId } = params

  try {
    // Retrieve the original order details from the secure cookie
    const orderCookie = cookies().get(`order_${receiptId}`)

    if (!orderCookie) {
      console.error("Order details not found")
      return { success: false, error: "Invalid order" }
    }

    const orderData = JSON.parse(orderCookie.value)

    // Generate the expected signature
    const text = `${orderId}|${paymentId}`
    const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(text).digest("hex")

    // Verify the signature
    const isAuthentic = expectedSignature === signature

    if (!isAuthentic) {
      console.error("Payment signature verification failed")
      return { success: false, error: "Invalid payment signature" }
    }

    // Verify payment status with Razorpay
    const paymentVerification = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      },
    })

    if (!paymentVerification.ok) {
      console.error("Failed to verify payment with Razorpay")
      return { success: false, error: "Payment verification failed" }
    }

    const paymentData = await paymentVerification.json()

    // Check if payment is captured/authorized
    if (paymentData.status !== "captured" && paymentData.status !== "authorized") {
      console.error(`Payment not completed. Status: ${paymentData.status}`)
      return { success: false, error: "Payment not completed" }
    }

    // Send Discord notification
    await sendDiscordNotification({
      customerName: orderData.customerName,
      phoneNumber: orderData.phoneNumber,
      items: orderData.items,
      total: orderData.subtotal,
      convenienceFee: orderData.convenienceFee,
      orderId: orderId,
    })

    // Clear the order cookie after successful verification
    cookies().delete(`order_${receiptId}`)

    return {
      success: true,
      orderDetails: {
        items: orderData.items,
        subtotal: orderData.subtotal,
        convenienceFee: orderData.convenienceFee,
        total: orderData.totalAmount,
      },
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return { success: false, error: "Payment verification failed" }
  }
}

// Handle Razorpay webhook
export async function handleRazorpayWebhook(request: Request) {
  try {
    const payload = await request.json()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("Webhook secret not configured")
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(payload)).digest("hex")

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature")
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Process the webhook event
    const event = payload.event

    if (event === "payment.captured" || event === "payment.authorized") {
      const paymentId = payload.payload.payment.entity.id
      const orderId = payload.payload.payment.entity.order_id

      // Here you would update your database to mark the order as paid
      console.log(`Payment ${paymentId} for order ${orderId} was successful`)

      // You could also send notifications, update inventory, etc.
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

