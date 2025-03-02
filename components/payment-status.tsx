import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Home } from "lucide-react"
import Link from "next/link"

interface PaymentStatusProps {
  status: "success" | "failed" | null
  paymentId: string | null
  orderId: string | null
  amount: number
  onOrderAgain: () => void
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export function PaymentStatus({ status, paymentId, orderId, amount, onOrderAgain, items }: PaymentStatusProps) {
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
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {status === "success" ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        <CardTitle className="text-2xl">{status === "success" ? "Payment Successful" : "Payment Failed"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "success" && (
          <>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm">
                Your order has been placed successfully. You will receive a confirmation shortly.
              </p>
            </div>
            {items && items.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Ordered Items:</h3>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span>{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment ID:</span>
                <span>{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span>₹{((amount * 0.02)+amount).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {status === "failed" && (
          <div className="bg-red-100 p-4 rounded-md">
            <p className="text-sm text-red-800">
              Your payment could not be processed. Please try again or use a different payment method.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onOrderAgain}>{status === "success" ? "Order Again" : "Try Again"}</Button>
      </CardFooter>
    </Card>
  )
}

