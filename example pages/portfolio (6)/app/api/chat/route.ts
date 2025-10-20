import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { nanoid } from "nanoid"
import { knowledgeSearch } from "@/lib/knowledge-search"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Function to get current prompt configuration
async function getPromptConfig() {
  // For now, let's use a simple fallback approach
  // We'll try Supabase first, but fall back to default if it fails
  try {
    // Only try Supabase if environment variables are set
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from("prompt_configs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        return {
          systemPrompt: data.system_prompt,
          model: data.model,
          temperature: data.temperature,
          maxTokens: data.max_tokens,
        }
      }
    }
  } catch (error) {
    console.log("Supabase not available, using default config:", error)
  }

  // Fallback to default configuration
  return getDefaultConfig()
}

// Default configuration if database fetch fails
function getDefaultConfig() {
  return {
    systemPrompt: `You are the Station Innovation Zone (SIZ) Assistant, a helpful and engaging prototype chatbot designed to support a wide range of users interacting with the UK's Station Innovation Zone platform.

Your goal is to identify the user type early in the conversation (e.g. startup/SME, station manager, member of the public, transport planner, tech provider, investor, or policymaker) and respond accordingly with tone, language, and suggestions tailored to their needs.

You can draw on the Station Innovation Zone's key themes:

• Station innovation opportunities
• Project case studies and guidance tools
• Commercial and operational insights
• Passenger experience and community impact
• Access to funding, pilots, and policy direction

Use this knowledge to offer:
• Quick answers
• Guidance on where to go next
• Summaries of relevant SIZ content
• Suggestions for innovation participation or exploration

If a question is beyond your scope or knowledge:
• Kindly state that you're a prototype assistant still learning
• Offer to log feedback or suggest where the user might go instead

Always keep a tone that is:
• Curious, encouraging, concise
• Helpful to both newcomers and experts
• Open to feedback ("Let me know if this helped or if you'd like more detail.")

Begin by gently asking something like:
"Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests."`,
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 1000,
  }
}

// Extract user type from conversation (basic implementation)
function extractUserType(messages: any[]) {
  // Look for user type mentions in the last few messages
  const userTypes = [
    "startup",
    "sme",
    "business",
    "station manager",
    "transport professional",
    "public",
    "passenger",
    "commuter",
    "planner",
    "tech provider",
    "investor",
    "policymaker",
  ]

  // Check the last 3 user messages
  const userMessages = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content.toLowerCase())

  for (const message of userMessages) {
    for (const type of userTypes) {
      if (message.includes(type)) {
        // Map to standardized categories
        if (type.includes("startup") || type.includes("sme") || type.includes("business")) {
          return "Business/Startup"
        }
        if (type.includes("station manager")) {
          return "Station Manager"
        }
        if (type.includes("public") || type.includes("passenger") || type.includes("commuter")) {
          return "Member of Public"
        }
        if (type.includes("planner")) {
          return "Transport Planner"
        }
        if (type.includes("tech")) {
          return "Tech Provider"
        }
        if (type.includes("investor")) {
          return "Investor"
        }
        if (type.includes("policy")) {
          return "Policymaker"
        }
      }
    }
  }

  return undefined
}

// Save conversation to Supabase (with error handling)
async function saveConversation(sessionId: string, messages: any[], userType?: string, isNew = false) {
  try {
    // Only try Supabase if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("Supabase not configured, skipping conversation save")
      return
    }

    const { supabase } = await import("@/lib/supabase")

    // Get the active prompt config ID
    const { data: promptConfig } = await supabase
      .from("prompt_configs")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single()

    if (isNew) {
      const { error } = await supabase.from("conversations").insert({
        session_id: sessionId,
        user_type: userType,
        messages: messages,
        prompt_config_id: promptConfig?.id,
      })

      if (error) {
        console.error("Error creating conversation:", error)
      }
    } else {
      // Update existing conversation
      const { error } = await supabase
        .from("conversations")
        .update({
          messages: messages,
          user_type: userType || undefined,
        })
        .eq("session_id", sessionId)

      if (error) {
        console.error("Error updating conversation:", error)
      }
    }
  } catch (error) {
    console.error("Error in saveConversation:", error)
    // Don't throw - just log and continue
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, sessionId: providedSessionId } = body

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Generate a session ID if not provided
    const sessionId = providedSessionId || nanoid()

    // Get the current prompt configuration
    const config = await getPromptConfig()

    // Check if this is a new conversation
    const isNewConversation = messages.length <= 2

    // Extract user type if possible
    const userType = extractUserType(messages)

    // Save conversation to database (non-blocking)
    saveConversation(sessionId, messages, userType, isNewConversation)

    // Get relevant context from knowledge base
    const relevantContext = await knowledgeSearch.getRelevantContext(
      messages[messages.length - 1]?.content || "",
      1500, // Max tokens for context
    )

    // Enhanced system prompt with knowledge base context
    const enhancedSystemPrompt = relevantContext
      ? `${config.systemPrompt}

KNOWLEDGE BASE CONTEXT:
The following information from the Station Innovation Zone knowledge base may be relevant to the user's query:

${relevantContext}

Use this context to provide more accurate and detailed responses when relevant. If the context doesn't relate to the user's question, respond normally without referencing it.`
      : config.systemPrompt

    // Generate the AI response with enhanced context
    const result = streamText({
      model: openai(config.model),
      system: enhancedSystemPrompt,
      messages,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    })

    // Update the conversation with the AI response after it's complete (non-blocking)
    result.text
      .then(async (aiResponse) => {
        try {
          const updatedMessages = [...messages, { role: "assistant", content: aiResponse }]
          await saveConversation(sessionId, updatedMessages, userType, false)
        } catch (error) {
          console.error("Error in post-processing:", error)
          // Don't throw - just log
        }
      })
      .catch((error) => {
        console.error("Error getting AI response text:", error)
      })

    // Add session ID to the response headers
    const headers = new Headers()
    headers.append("X-Session-Id", sessionId)

    // Return the streaming response
    return result.toDataStreamResponse({ headers })
  } catch (error) {
    console.error("Error in chat API:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
