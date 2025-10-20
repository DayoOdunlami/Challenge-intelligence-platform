import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const days = Number.parseInt(url.searchParams.get("days") || "30")

    // Calculate the date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total conversations
    const { count: totalConversations } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .gte("started_at", startDate.toISOString())

    // Get total messages
    const { data: conversations } = await supabase
      .from("conversations")
      .select("messages")
      .gte("started_at", startDate.toISOString())

    let totalMessages = 0
    if (conversations) {
      totalMessages = conversations.reduce((sum, conv) => {
        return sum + (Array.isArray(conv.messages) ? conv.messages.length : 0)
      }, 0)
    }

    // Get user types distribution
    const { data: userTypesData } = await supabase
      .from("conversations")
      .select("user_type")
      .gte("started_at", startDate.toISOString())
      .not("user_type", "is", null)

    const userTypes: Record<string, number> = {}
    if (userTypesData) {
      userTypesData.forEach((item) => {
        if (item.user_type) {
          userTypes[item.user_type] = (userTypes[item.user_type] || 0) + 1
        }
      })
    }

    // Get average session length (in minutes)
    const { data: sessionData } = await supabase
      .from("conversations")
      .select("started_at, ended_at")
      .gte("started_at", startDate.toISOString())
      .not("ended_at", "is", null)

    let averageSessionLength = 0
    if (sessionData && sessionData.length > 0) {
      const totalMinutes = sessionData.reduce((sum, session) => {
        if (session.started_at && session.ended_at) {
          const start = new Date(session.started_at)
          const end = new Date(session.ended_at)
          const minutes = (end.getTime() - start.getTime()) / (1000 * 60)
          return sum + minutes
        }
        return sum
      }, 0)
      averageSessionLength = Math.round(totalMinutes / sessionData.length)
    }

    // Get popular questions (simplified implementation)
    const popularQuestions = [
      { question: "How do I set up a steering group?", count: 12 },
      { question: "What are the key challenges in implementing station innovations?", count: 8 },
      { question: "How do I manage data access and security requirements?", count: 7 },
      { question: "What budget should I plan for a Station Innovation Zone?", count: 5 },
      { question: "How do I communicate with station users about trials?", count: 4 },
    ]

    // Get daily usage data
    const dailyUsage = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // In a real implementation, you would query the database for each day
      // For now, we'll generate random data
      dailyUsage.push({
        date: dateStr,
        conversations: Math.floor(Math.random() * 10) + 1,
      })
    }

    return Response.json({
      totalConversations: totalConversations || 0,
      totalMessages,
      averageSessionLength,
      userTypes,
      popularQuestions,
      dailyUsage: dailyUsage.reverse(),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return Response.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
