"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Home } from "lucide-react"
import Link from "next/link"

interface PaymentStatusProps {
  status: "success" | "failed" | null
  paymentId: string | null
  orderId: string | null
  amount: number
  convenienceFee: number
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
  onOrderAgain: () => void
}

export function PaymentStatus({
  status,
  paymentId,
  orderId,
  amount,
  convenienceFee,
  items = [],
  onOrderAgain,
}: PaymentStatusProps) {
  if (!status) {
    return (
      <Card className="max-w-md mx-auto text-center p-8">
        <CardContent>
          <p>Processing payment...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {status === "success" ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </motion.div>
          <CardTitle className="text-2xl">{status === "success" ? "Payment Successful" : "Payment Failed"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <>
              <motion.div
                className="bg-muted p-4 rounded-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-sm">
                  Your order has been placed successfully. You will receive a confirmation shortly.
                </p>
              </motion.div>
              {items && items.length > 0 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-medium">Ordered Items:</h3>
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    {items.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex justify-between text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              <motion.div
                className="space-y-2 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment ID:</span>
                  <span>{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Convenience Fee (2%):</span>
                  <span>₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="font-medium">Total Amount:</span>
                  <span>₹{(amount + convenienceFee).toFixed(2)}</span>
                </div>
              </motion.div>
            </>
          )}

          {status === "failed" && (
            <motion.div
              className="bg-red-100 p-4 rounded-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm text-red-800">
                Your payment could not be processed. Please try again or use a different payment method.
              </p>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button onClick={onOrderAgain}>{status === "success" ? "Order Again" : "Try Again"}</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

