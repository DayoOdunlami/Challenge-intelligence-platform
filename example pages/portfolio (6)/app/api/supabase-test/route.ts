import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const results = {
    connection: false,
    tables: {},
    errors: [],
    environment: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "..."
        : "Not set",
    },
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    results.errors.push("Missing Supabase environment variables")
    return NextResponse.json(results)
  }

  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from("prompt_configs")
      .select("count", { count: "exact", head: true })

    if (healthError) {
      if (healthError.code === "PGRST116") {
        results.errors.push("Tables not initialized - run the migration script")
      } else {
        results.errors.push(`Connection error: ${healthError.message}`)
      }
      return NextResponse.json(results)
    }

    results.connection = true

    // Test each table
    const tables = ["prompt_configs", "conversations", "user_feedback"]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (error) {
          results.tables[table] = { exists: false, error: error.message }
        } else {
          results.tables[table] = { exists: true, count: data?.length || 0 }
        }
      } catch (err) {
        results.tables[table] = { exists: false, error: (err as Error).message }
      }
    }

    // Test write permissions
    try {
      const testConfig = {
        system_prompt: "Test prompt",
        welcome_message: "Test message",
        user_profiling: true,
        contextual_responses: true,
        feedback_encouragement: true,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 1000,
        is_active: false,
      }

      const { data, error } = await supabase.from("prompt_configs").insert(testConfig).select().single()

      if (error) {
        results.errors.push(`Write test failed: ${error.message}`)
      } else {
        // Clean up test record
        await supabase.from("prompt_configs").delete().eq("id", data.id)
        results.writePermissions = true
      }
    } catch (err) {
      results.errors.push(`Write test error: ${(err as Error).message}`)
    }
  } catch (error) {
    results.errors.push(`General error: ${(error as Error).message}`)
  }

  return NextResponse.json(results)
}
