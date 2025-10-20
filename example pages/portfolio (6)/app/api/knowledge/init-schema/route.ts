import { supabase } from "@/lib/supabaseClient"

export async function POST() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return Response.json(
        { error: "Supabase not available. Please configure Supabase environment variables." },
        { status: 503 },
      )
    }

    // Create knowledge_sources table
    const { error: sourcesError } = await supabase.rpc("create_knowledge_sources_if_not_exists")
    if (sourcesError) {
      // If RPC doesn't exist, create table directly
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS knowledge_sources (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          url TEXT,
          description TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      if (createError) {
        console.error("Error creating knowledge_sources table:", createError)
        return Response.json({ error: "Failed to create knowledge_sources table" }, { status: 500 })
      }
    }

    // Create knowledge_documents table
    const { error: docsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (docsError) {
      console.error("Error creating knowledge_documents table:", docsError)
      return Response.json({ error: "Failed to create knowledge_documents table" }, { status: 500 })
    }

    // Create knowledge_chunks table
    const { error: chunksError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS knowledge_chunks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (chunksError) {
      console.error("Error creating knowledge_chunks table:", chunksError)
      return Response.json({ error: "Failed to create knowledge_chunks table" }, { status: 500 })
    }

    return Response.json({ success: true, message: "Knowledge base schema initialized successfully" })
  } catch (error) {
    console.error("Error initializing knowledge base schema:", error)
    return Response.json({ error: "Failed to initialize knowledge base schema" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return Response.json({ exists: false, error: "Supabase not available" })
    }

    // Check if knowledge_sources table exists
    const { data, error } = await supabase.from("knowledge_sources").select("id").limit(1).maybeSingle()

    if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
      return Response.json({ exists: false })
    }

    return Response.json({ exists: true })
  } catch (error) {
    console.error("Error checking schema:", error)
    return Response.json({ exists: false, error: "Failed to check schema" })
  }
}
