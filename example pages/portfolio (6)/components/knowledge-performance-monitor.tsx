"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, Activity, Clock, Database } from "lucide-react"

interface CacheEntry {
  query: string
  ageMinutes: number
  resultsCount: number
}

interface CacheStats {
  cacheSize: number
  entries: CacheEntry[]
}

export function KnowledgePerformanceMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/knowledge/cache-stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error loading cache stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    setClearing(true)
    try {
      const response = await fetch("/api/knowledge/cache-stats", {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        await loadStats() // Reload stats
      }
    } catch (error) {
      console.error("Error clearing cache:", error)
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    loadStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Knowledge Base Performance
            </CardTitle>
            <CardDescription>Monitor search cache and performance metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={clearCache} disabled={clearing || !stats?.cacheSize}>
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats ? (
          <>
            {/* Cache Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Cache Size</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.cacheSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Age</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.entries.length > 0
                      ? Math.round(
                          stats.entries.reduce((sum, entry) => sum + entry.ageMinutes, 0) / stats.entries.length,
                        )
                      : 0}
                    m
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Activity className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Results</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.entries.reduce((sum, entry) => sum + entry.resultsCount, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cache Entries */}
            {stats.entries.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3">Recent Cached Queries</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.entries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.query}</p>
                        <p className="text-xs text-gray-500">{entry.resultsCount} results</p>
                      </div>
                      <Badge variant={entry.ageMinutes < 2 ? "default" : "secondary"}>{entry.ageMinutes}m ago</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No cached queries yet</p>
                <p className="text-sm">Cache will populate as users ask questions</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500">Loading performance data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
