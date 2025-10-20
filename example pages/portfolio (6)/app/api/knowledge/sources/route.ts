import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      console.log("Supabase not available, returning empty sources")
      return Response.json([])
    }

    // Check if table exists first
    try {
      const { data, error } = await supabase.from("knowledge_sources").select("*").limit(1)

      if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("knowledge_sources table does not exist")
        return Response.json([])
      }

      // If we get here, table exists, so get all sources
      const { data: sources, error: sourcesError } = await supabase
        .from("knowledge_sources")
        .select("*")
        .order("created_at", { ascending: false })

      if (sourcesError) {
        console.log("Error fetching sources:", sourcesError.message)
        return Response.json([])
      }

      return Response.json(sources || [])
    } catch (error) {
      console.error("Error checking table existence:", error)
      return Response.json([])
    }
  } catch (error) {
    console.error("Error fetching knowledge sources:", error)
    return Response.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, url, description } = body

    // Validate required fields
    if (!name || !type) {
      return Response.json({ error: "Name and type are required" }, { status: 400 })
    }

    if (type === "website" && !url) {
      return Response.json({ error: "URL is required for website sources" }, { status: 400 })
    }

    // Check if Supabase is available
    if (!supabase) {
      console.log("Supabase not available, cannot save knowledge source")
      return Response.json({ error: "Knowledge base not available. Please configure Supabase." }, { status: 503 })
    }

    // Check if table exists first
    try {
      const { data: checkData, error: checkError } = await supabase.from("knowledge_sources").select("id").limit(1)

      if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
        // Table doesn't exist, try to create it
        const initResponse = await fetch("/api/knowledge/init-schema", {
          method: "POST",
        })

        if (!initResponse.ok) {
          return Response.json(
            { error: "Knowledge base tables don't exist. Please initialize the schema first." },
            { status: 500 },
          )
        }
      }
    } catch (error) {
      console.error("Error checking table existence:", error)
    }

    // Now try to insert the record
    try {
      const insertData = {
        name,
        type,
        url: url || null,
        description: description || null,
        status: "pending",
      }

      const { data, error } = await supabase.from("knowledge_sources").insert(insertData).select().single()

      if (error) {
        console.error("Insert error:", error)
        throw error
      }

      return Response.json(data)
    } catch (error: any) {
      console.error("Error creating knowledge source:", error)
      return Response.json({ error: error.message || "Failed to create knowledge source" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in POST handler:", error)
    return Response.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
