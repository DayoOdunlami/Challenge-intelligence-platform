import { NextResponse } from "next/server"
import { knowledgeSearch } from "@/lib/knowledge-search"

export async function GET() {
  try {
    const stats = knowledgeSearch.getCacheStats()

    return NextResponse.json({
      success: true,
      stats: {
        cacheSize: stats.size,
        entries: stats.entries.map((entry) => ({
          query: entry.query.substring(0, 50) + (entry.query.length > 50 ? "..." : ""),
          ageMinutes: Math.round(entry.age / (1000 * 60)),
          resultsCount: entry.resultsCount,
        })),
      },
    })
  } catch (error) {
    console.error("Error getting cache stats:", error)
    return NextResponse.json({ success: false, error: "Failed to get cache stats" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    knowledgeSearch.clearCache()

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ success: false, error: "Failed to clear cache" }, { status: 500 })
  }
}
