export async function GET() {
  try {
    // Check subscription and usage
    const subscriptionResponse = await fetch("https://api.openai.com/v1/dashboard/billing/subscription", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    if (!subscriptionResponse.ok) {
      throw new Error("Failed to fetch subscription info")
    }

    const subscription = await subscriptionResponse.json()

    // Get current usage
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const usageResponse = await fetch(
      `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startOfMonth.toISOString().split("T")[0]}&end_date=${endOfMonth.toISOString().split("T")[0]}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    )

    if (!usageResponse.ok) {
      throw new Error("Failed to fetch usage info")
    }

    const usage = await usageResponse.json()

    return Response.json({
      plan: subscription.plan?.title || "Unknown",
      hard_limit_usd: subscription.hard_limit_usd || 0,
      usage_this_month: (usage.total_usage || 0) / 100, // Convert from cents
      access_until: subscription.access_until,
      has_payment_method: subscription.has_payment_method,
    })
  } catch (error: any) {
    console.error("Error checking limits:", error)
    return Response.json(
      {
        error: "Could not fetch account information. This might be due to API permissions.",
        details: error.message,
      },
      { status: 400 },
    )
  }
}
