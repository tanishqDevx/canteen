import { handleRazorpayWebhook } from "@/app/actions"

export async function POST(request: Request) {
  return handleRazorpayWebhook(request)
}

