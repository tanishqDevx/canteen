import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CartItem, UserInfo } from "@/app/page"
import { Minus, Plus, ArrowLeft, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface CartProps {
  items: CartItem[]
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  onBackToMenu: () => void
  onCheckout: () => void
  total: number
  userInfo: UserInfo | null
}

export function Cart({ items, updateQuantity, removeFromCart, onBackToMenu, onCheckout, total, userInfo }: CartProps) {
  return (
    <div className="container mx-auto max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBackToMenu} className="p-0 mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <Card className="text-center p-8">
          <p className="mb-4">Your cart is empty</p>
          <Button onClick={onBackToMenu}>Browse Menu</Button>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span>₹{(total * 0.02).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{(total + total * 0.02).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {userInfo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Name:</span>
                    <span className="col-span-2">{userInfo.name}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Phone:</span>
                    <span className="col-span-2">{userInfo.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onCheckout} size="lg" className="px-8">
              Proceed to Payment
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

