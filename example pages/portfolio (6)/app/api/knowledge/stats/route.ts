import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      console.log("Supabase not available, returning default stats")
      return Response.json({
        total_sources: 0,
        total_documents: 0,
        total_chunks: 0,
        sources_by_type: {},
        recent_updates: 0,
      })
    }

    const { data, error } = await supabase.rpc("get_knowledge_stats")

    if (error) {
      console.log("Supabase RPC error, returning default stats:", error.message)
      return Response.json({
        total_sources: 0,
        total_documents: 0,
        total_chunks: 0,
        sources_by_type: {},
        recent_updates: 0,
      })
    }

    return Response.json(
      data[0] || {
        total_sources: 0,
        total_documents: 0,
        total_chunks: 0,
        sources_by_type: {},
        recent_updates: 0,
      },
    )
  } catch (error) {
    console.error("Error fetching knowledge stats:", error)
    return Response.json(
      {
        total_sources: 0,
        total_documents: 0,
        total_chunks: 0,
        sources_by_type: {},
        recent_updates: 0,
      },
      { status: 200 },
    ) // Return 200 with default data instead of 500 error
  }
}
