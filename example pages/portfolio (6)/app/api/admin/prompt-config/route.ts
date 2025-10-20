import type { NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      console.log("Supabase not available, returning default config")
      // Return default configuration when Supabase is not available
      const defaultConfig = {
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
        welcomeMessage:
          "Hello! I'm your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests.",
        userProfiling: true,
        contextualResponses: true,
        feedbackEncouragement: true,
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 1000,
      }
      return Response.json(defaultConfig)
    }

    // Get the active prompt configuration from Supabase
    const { data, error } = await supabase
      .from("prompt_configs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching prompt config:", error)

      // If no config found, return default
      if (error.code === "PGRST116") {
        const defaultConfig = {
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
          welcomeMessage:
            "Hello! I'm your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests.",
          userProfiling: true,
          contextualResponses: true,
          feedbackEncouragement: true,
          model: "gpt-4o",
          temperature: 0.7,
          maxTokens: 1000,
        }
        return Response.json(defaultConfig)
      }

      return Response.json({ error: "Failed to fetch configuration" }, { status: 500 })
    }

    // Transform the database fields to match the expected format
    const config = {
      systemPrompt: data.system_prompt,
      welcomeMessage: data.welcome_message,
      userProfiling: data.user_profiling,
      contextualResponses: data.contextual_responses,
      feedbackEncouragement: data.feedback_encouragement,
      model: data.model,
      temperature: data.temperature,
      maxTokens: data.max_tokens,
    }

    return Response.json(config)
  } catch (error) {
    console.error("Error in GET prompt config:", error)

    // Return default configuration on any error
    const defaultConfig = {
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
      welcomeMessage:
        "Hello! I'm your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests.",
      userProfiling: true,
      contextualResponses: true,
      feedbackEncouragement: true,
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
    }
    return Response.json(defaultConfig)
  }
}

export async function POST(req: NextRequest) {
  try {
    const newConfig = await req.json()

    // Validate the configuration
    if (!newConfig.systemPrompt || typeof newConfig.systemPrompt !== "string") {
      return Response.json({ error: "System prompt is required and must be a string" }, { status: 400 })
    }

    if (!newConfig.welcomeMessage || typeof newConfig.welcomeMessage !== "string") {
      return Response.json({ error: "Welcome message is required and must be a string" }, { status: 400 })
    }

    if (typeof newConfig.temperature !== "number" || newConfig.temperature < 0 || newConfig.temperature > 1) {
      return Response.json({ error: "Temperature must be a number between 0 and 1" }, { status: 400 })
    }

    if (typeof newConfig.maxTokens !== "number" || newConfig.maxTokens < 100 || newConfig.maxTokens > 4000) {
      return Response.json({ error: "Max tokens must be a number between 100 and 4000" }, { status: 400 })
    }

    // Check if Supabase is available
    if (!supabase) {
      console.log("Supabase not available, configuration saved locally only")
      return Response.json({
        success: true,
        message: "Configuration updated successfully (local storage only - Supabase not configured)",
        config: newConfig,
      })
    }

    // First, set all existing configs to inactive
    const { error: updateError } = await supabase
      .from("prompt_configs")
      .update({ is_active: false })
      .eq("is_active", true)

    if (updateError) {
      console.error("Error deactivating existing configs:", updateError)
      return Response.json({ error: "Failed to update configuration" }, { status: 500 })
    }

    // Then insert the new config as active
    const { data, error: insertError } = await supabase
      .from("prompt_configs")
      .insert({
        system_prompt: newConfig.systemPrompt,
        welcome_message: newConfig.welcomeMessage,
        user_profiling: newConfig.userProfiling,
        contextual_responses: newConfig.contextualResponses,
        feedback_encouragement: newConfig.feedbackEncouragement,
        model: newConfig.model,
        temperature: newConfig.temperature,
        max_tokens: newConfig.maxTokens,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting new config:", insertError)
      return Response.json({ error: "Failed to save configuration" }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: "Configuration updated successfully",
      config: {
        systemPrompt: data.system_prompt,
        welcomeMessage: data.welcome_message,
        userProfiling: data.user_profiling,
        contextualResponses: data.contextual_responses,
        feedbackEncouragement: data.feedback_encouragement,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.max_tokens,
      },
    })
  } catch (error) {
    console.error("Error updating prompt configuration:", error)
    return Response.json({ error: "Failed to update configuration" }, { status: 500 })
  }
}
