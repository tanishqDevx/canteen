"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import type { UserInfo } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UserFormProps {
  onSubmit: (data: UserInfo) => void
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    phone: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { name: "", phone: "" }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      valid = false
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
      valid = false
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Food Ordering</CardTitle>
          <CardDescription className="text-center">Please enter your details to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="bg-background"
              />
              {errors.name && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                type="tel"
                className="bg-background"
              />
              {errors.phone && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {errors.phone}
                </motion.p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button type="submit" className="w-full">
                Continue to Menu
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

