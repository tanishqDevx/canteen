"use client"

import { useState, useEffect } from "react"
import { UserForm } from "@/components/user-form"
import { Menu } from "@/components/menu"
import { Cart } from "@/components/cart"
import { PaymentStatus } from "@/components/payment-status"
import { createOrder, verifyPayment } from "@/app/actions"
import { Toaster } from "sonner"
import { toast } from "sonner"

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
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptId, setReceiptId] = useState<string | null>(null)

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
    if (!userInfo || cartItems.length === 0) {
      toast.error("Please add items to your cart")
      return
    }

    try {
      setIsProcessing(true)

      // Create order on the server
      const orderResponse = await createOrder({
        customerName: userInfo.name,
        phoneNumber: userInfo.phone,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })

      if (!orderResponse.orderId) {
        throw new Error("Failed to create order")
      }

      setOrderId(orderResponse.orderId)
      setReceiptId(orderResponse.receiptId)

      // Initialize Razorpay with only the order ID from the server
      const options = {
        key: orderResponse.keyId,
        order_id: orderResponse.orderId,
        name: "Food Ordering",
        description: "Food Order Payment",
        handler: async (response: any) => {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response

          try {
            const verification = await verifyPayment({
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              signature: razorpay_signature,
              receiptId: orderResponse.receiptId,
            })

            if (verification.success) {
              setPaymentId(razorpay_payment_id)
              setPaymentStatus("success")
              setOrderDetails(verification.orderDetails)
            } else {
              console.error("Payment verification failed:", verification.error)
              setPaymentStatus("failed")
              toast.error(verification.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("Error during payment verification:", error)
            setPaymentStatus("failed")
            toast.error("An error occurred during payment verification")
          } finally {
            setStep("payment-status")
            setIsProcessing(false)
          }
        },
        prefill: {
          name: userInfo.name,
          contact: userInfo.phone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.info("Payment cancelled")
          },
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
      setIsProcessing(false)
      toast.error("Failed to initialize payment. Please try again.")
    }
  }

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Toaster position="top-center" richColors />
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
          isProcessing={isProcessing}
        />
      )}

      {step === "payment-status" && (
        <PaymentStatus
          status={paymentStatus}
          paymentId={paymentId}
          orderId={orderId}
          amount={orderDetails?.total || 0}
          convenienceFee={orderDetails?.convenienceFee || 0}
          items={orderDetails?.items || cartItems}
          onOrderAgain={() => {
            setCartItems([])
            setStep("menu")
            setPaymentStatus(null)
            setPaymentId(null)
            setOrderId(null)
            setOrderDetails(null)
            setReceiptId(null)
          }}
        />
      )}
    </main>
  )
}

