import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const result = await generateText({
      model: openai("gpt-4o"),
      prompt: message || "Hello, this is a test message.",
      maxTokens: 50,
    })

    return Response.json({
      success: true,
      model: "gpt-4o",
      response: result.text,
      usage: result.usage,
      organization: process.env.OPENAI_ORG_ID || "Not specified",
      rateLimits: {
        requests_per_minute: 500, // Default for paid accounts
        tokens_per_minute: 30000, // Default for paid accounts
      },
    })
  } catch (error: any) {
    console.error("OpenAI API Error:", error)

    let errorMessage = "Unknown error"
    let errorCode = "unknown"

    if (error.message) {
      errorMessage = error.message
    }

    // Common error patterns
    if (error.message?.includes("401")) {
      errorMessage = "Invalid API key. Please check your OPENAI_API_KEY in .env.local"
      errorCode = "invalid_api_key"
    } else if (error.message?.includes("429")) {
      errorMessage = "Rate limit exceeded. Please wait and try again."
      errorCode = "rate_limit"
    } else if (error.message?.includes("insufficient_quota")) {
      errorMessage = "Insufficient quota. Please check your OpenAI billing."
      errorCode = "insufficient_quota"
    }

    return Response.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 400 },
    )
  }
}
