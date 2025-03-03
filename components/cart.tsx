"use client"

import { motion, AnimatePresence } from "framer-motion"
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
  const convenienceFee = total * 0.02

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto max-w-3xl"
    >
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBackToMenu} className="p-0 mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Card className="text-center p-8">
            <p className="mb-4">Your cart is empty</p>
            <Button onClick={onBackToMenu}>Browse Menu</Button>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <motion.img
                            whileHover={{ scale: 1.1 }}
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
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="w-8 text-center"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <motion.div className="flex justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span>Convenience Fee (2%)</span>
                    <span>₹{convenienceFee.toFixed(2)}</span>
                  </motion.div>
                  <Separator className="my-2" />
                  <motion.div
                    className="flex justify-between font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span>Total</span>
                    <span>₹{(total + convenienceFee).toFixed(2)}</span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onCheckout} size="lg" className="px-8">
                Proceed to Payment
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

