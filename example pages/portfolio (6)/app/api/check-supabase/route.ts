import { NextResponse } from "next/server"

export async function GET() {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Expected values for verification
  const expectedUrl = "https://fvmxqkygofizhjxtnrsb.supabase.co"
  const expectedKeyStart = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!supabaseUrl,
      correct: supabaseUrl === expectedUrl,
      value: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "Not set",
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!supabaseKey,
      correct: supabaseKey?.startsWith(expectedKeyStart) || false,
      value: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : "Not set",
    },
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      connected: false,
      message: "Supabase environment variables are missing",
      envVars: envStatus,
      instructions: "Please add the environment variables in Vercel and redeploy",
    })
  }

  // Verify the values are correct
  if (!envStatus.NEXT_PUBLIC_SUPABASE_URL.correct || !envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.correct) {
    return NextResponse.json({
      connected: false,
      message: "Supabase environment variables are set but values appear incorrect",
      envVars: envStatus,
      instructions: "Please verify the environment variable values match your Supabase project",
    })
  }

  try {
    // Try to import the Supabase client
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test a simple query to verify connection
    const { data, error } = await supabase.from("prompt_configs").select("id").limit(1)

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({
          connected: true,
          initialized: false,
          message: "Connected to Supabase but tables are not set up yet",
          envVars: envStatus,
          instructions: "Run the SQL migration script in your Supabase SQL Editor",
        })
      }

      return NextResponse.json({
        connected: false,
        message: `Error connecting to Supabase: ${error.message}`,
        envVars: envStatus,
        error: error,
      })
    }

    return NextResponse.json({
      connected: true,
      initialized: true,
      message: "Successfully connected to Supabase and tables are set up!",
      envVars: envStatus,
      tables: {
        prompt_configs: data !== null,
      },
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      message: `Failed to initialize Supabase client: ${(error as Error).message}`,
      envVars: envStatus,
      error: error,
    })
  }
}
