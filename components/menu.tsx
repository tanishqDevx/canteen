"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CartItem } from "@/app/page"

// Sample menu data
const menuItems = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Classic cheese pizza with tomato sauce",
    price: 199,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Veggie Burger",
    description: "Plant-based patty with lettuce, tomato, and special sauce",
    price: 149,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Chicken Biryani",
    description: "Fragrant rice dish with chicken and aromatic spices",
    price: 249,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "4",
    name: "Pasta Alfredo",
    description: "Creamy pasta with parmesan cheese sauce",
    price: 179,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "5",
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie with vanilla ice cream",
    price: 99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "6",
    name: "Mango Smoothie",
    description: "Refreshing mango smoothie with a hint of mint",
    price: 79,
    image: "/placeholder.svg?height=100&width=100",
  },
]

interface MenuProps {
  addToCart: (item: CartItem) => void
  cartItems: CartItem[]
  onViewCart: () => void
}

export function Menu({ addToCart, cartItems, onViewCart }: MenuProps) {
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    })

    // Show toast notification
    toast(`Added 1x ${item.name} to cart`, {
      description: "Click 'View Cart' to checkout",
      duration: 3000,
      action: {
        label: "View Cart",
        onClick: onViewCart,
      },
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-2xl font-bold">
          Our Menu
        </motion.h1>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={onViewCart} variant="outline" className="relative">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
            <AnimatePresence>
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge variant="destructive">{getTotalItems()}</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, zIndex: 1 }}
            className="relative"
          >
            <Card className="overflow-hidden bg-card transform transition-all duration-300 hover:shadow-xl">
              <motion.div
                className="aspect-video w-full overflow-hidden"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              </motion.div>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
                <p className="mt-2 font-bold">₹{item.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => handleAddToCart(item)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

