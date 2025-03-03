"use client"

import { useState, useEffect } from "react"
import { UserForm } from "@/components/user-form"
import { Menu } from "@/components/menu"
import { Cart } from "@/components/cart"
import { PaymentStatus } from "@/components/payment-status"
import { createOrder, verifyPayment } from "@/app/actions"
import { Toaster } from "sonner"

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export type UserInfo = {
  name: string
  phone: string
}

export default function Home() {
  const [step, setStep] = useState<"user-form" | "menu" | "cart" | "payment-status">("user-form")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null)

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id)
      if (existingItem) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const getTotalAmount = () => {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const convenienceFee = subtotal * 0.02
    return subtotal + convenienceFee
  }

  const handleUserSubmit = (data: UserInfo) => {
    setUserInfo(data)
    setStep("menu")
  }

  const handleCheckout = async () => {
    if (!userInfo) return

    try {
      const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
      const convenienceFee = subtotal * 0.02
      const totalAmount = (subtotal + convenienceFee) * 100 // Razorpay uses amount in paise

      const order = await createOrder(totalAmount)

      if (!order.id) {
        throw new Error("Failed to create order")
      }

      setOrderId(order.id)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount,
        currency: "INR",
        name: "Food Ordering",
        description: "Food Order Payment (including 2% convenience fee)",
        order_id: order.id,
        handler: async (response: any) => {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response

          const verification = await verifyPayment({
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            orderDetails: {
              customerName: userInfo.name,
              phoneNumber: userInfo.phone,
              items: cartItems,
              total: subtotal,
              convenienceFee: convenienceFee,
            },
          })

          if (verification.success) {
            setPaymentId(razorpay_payment_id)
            setPaymentStatus("success")
          } else {
            setPaymentStatus("failed")
          }

          setStep("payment-status")
        },
        prefill: {
          name: userInfo.name,
          contact: userInfo.phone,
        },
        theme: {
          color: "#000000",
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
      setStep("payment-status")
    }
  }

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Toaster position="top-center" />
      {step === "user-form" && <UserForm onSubmit={handleUserSubmit} />}

      {step === "menu" && <Menu addToCart={addToCart} cartItems={cartItems} onViewCart={() => setStep("cart")} />}

      {step === "cart" && (
        <Cart
          items={cartItems}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          onBackToMenu={() => setStep("menu")}
          onCheckout={handleCheckout}
          total={cartItems.reduce((total, item) => total + item.price * item.quantity, 0)}
          userInfo={userInfo}
        />
      )}

      {step === "payment-status" && (
        <PaymentStatus
          status={paymentStatus}
          paymentId={paymentId}
          orderId={orderId}
          amount={getTotalAmount()}
          items={cartItems}
          onOrderAgain={() => {
            setCartItems([])
            setStep("menu")
            setPaymentStatus(null)
            setPaymentId(null)
            setOrderId(null)
          }}
        />
      )}
    </main>
  )
}

