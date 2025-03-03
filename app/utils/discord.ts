"use server"

interface OrderDetails {
  customerName: string
  phoneNumber: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  orderId: string
}

export async function sendDiscordNotification(orderDetails: OrderDetails) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.error("Discord webhook URL not configured")
    return
  }

  const convenienceFee = orderDetails.total * 0.02
  const itemsList = orderDetails.items
    .map((item) => `• ${item.quantity}x ${item.name} - ₹${item.price.toFixed(2)}`)
    .join("\n")

  const embed = {
    title: "🍔 New Order Received!",
    color: 0x00ff00,
    fields: [
      {
        name: "📋 Order ID",
        value: orderDetails.orderId,
        inline: true,
      },
      {
        name: "👤 Customer",
        value: orderDetails.customerName,
        inline: true,
      },
      {
        name: "📱 Phone",
        value: orderDetails.phoneNumber,
        inline: true,
      },
      {
        name: "🛒 Order Items",
        value: itemsList,
      },
      {
        name: "💰 Total Amount",
        value: `Subtotal: ₹${orderDetails.total.toFixed(2)}\nConvenience Fee (2%): ₹${convenienceFee.toFixed(2)}\nTotal: ₹${(orderDetails.total + convenienceFee).toFixed(2)}`,
      },
    ],
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send Discord notification: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error sending Discord notification:", error)
    return false
  }
}

