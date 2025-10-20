import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { sessionId, rating, comment } = await req.json()

    if (!sessionId || !rating || rating < 1 || rating > 5) {
      return Response.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    // Find the conversation by session ID
    const { data: conversation, error: findError } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", sessionId)
      .limit(1)
      .single()

    if (findError) {
      console.error("Error finding conversation:", findError)
      return Response.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Update the conversation with the satisfaction rating
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        satisfaction_rating: rating,
        feedback: comment,
      })
      .eq("id", conversation.id)

    if (updateError) {
      console.error("Error updating conversation:", updateError)
      return Response.json({ error: "Failed to save feedback" }, { status: 500 })
    }

    // Also save to the user_feedback table for more detailed analysis
    const { error: feedbackError } = await supabase.from("user_feedback").insert({
      conversation_id: conversation.id,
      rating,
      comment,
    })

    if (feedbackError) {
      console.error("Error saving feedback:", feedbackError)
      // Continue anyway since we already updated the conversation
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error in feedback API:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
