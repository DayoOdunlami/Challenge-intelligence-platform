"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Database, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ConnectionStatus {
  connected: boolean
  mode: "supabase" | "fallback"
  message: string
  lastChecked?: string
}

export function SupabaseConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/check-supabase")
      const data = await response.json()

      setStatus({
        connected: data.connected,
        mode: data.connected ? "supabase" : "fallback",
        message: data.message,
        lastChecked: new Date().toLocaleTimeString(),
      })
    } catch (error) {
      setStatus({
        connected: false,
        mode: "fallback",
        message: "Connection check failed",
        lastChecked: new Date().toLocaleTimeString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-4 border-gray-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Database className="h-4 w-4 animate-pulse" />
            <span>Checking database connection...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  return (
    <Card
      className={`mb-4 ${status.connected ? "border-green-200 bg-green-50/30" : "border-yellow-200 bg-yellow-50/30"}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.connected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-yellow-600" />
            )}

            <span className="text-sm font-medium">Database Status:</span>

            <Badge
              variant={status.connected ? "default" : "secondary"}
              className={
                status.connected
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
              }
            >
              {status.mode === "supabase" ? "Supabase Connected" : "Fallback Mode"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {!status.connected && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
            <span>Last checked: {status.lastChecked}</span>
          </div>
        </div>

        {!status.connected && (
          <div className="mt-2 text-xs text-yellow-700">
            <p>{status.message}</p>
            <p className="mt-1">
              Running in fallback mode - conversations won't be saved.
              <a href="/verify-env" className="underline hover:no-underline ml-1">
                Check configuration →
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
