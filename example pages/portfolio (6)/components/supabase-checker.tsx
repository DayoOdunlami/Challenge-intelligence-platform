"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, RefreshCw } from "lucide-react"

interface SupabaseStatus {
  connected: boolean
  initialized?: boolean
  message: string
  missingVars?: {
    NEXT_PUBLIC_SUPABASE_URL: boolean
    NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean
  }
  tables?: {
    prompt_configs: boolean
  }
  error?: any
}

export function SupabaseChecker() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [detailedStatus, setDetailedStatus] = useState<any>(null)

  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/supabase-test")
      const data = await response.json()
      setStatus(data)
      setDetailedStatus(data)
    } catch (error) {
      setStatus({
        connected: false,
        message: "Failed to check Supabase connection",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2">Checking Supabase connection...</span>
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {status.connected ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="font-medium">{status.connected ? "Connected" : "Not Connected"}</h3>
                <p className="text-sm text-gray-600">{status.message}</p>
              </div>
            </div>

            {detailedStatus?.envVars && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Environment Variables Status:</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(detailedStatus.envVars).map(([key, value]: [string, any]) => (
                    <li key={key} className="flex items-center gap-2">
                      {value.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>
                        {key}: {value.exists ? "Exists" : "Missing"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailedStatus?.tableStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Table Status:</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(detailedStatus.tableStatus).map(([key, value]: [string, any]) => (
                    <li key={key} className="flex items-center gap-2">
                      {value.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>
                        {key}: {value.exists ? "Exists" : "Missing"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailedStatus?.writePermissions && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Write Permissions Test:</h4>
                <p className="text-sm">
                  {detailedStatus.writePermissions.canWrite ? (
                    <span className="text-green-600">Write permissions are working correctly.</span>
                  ) : (
                    <span className="text-red-600">Write permissions are not working.</span>
                  )}
                </p>
              </div>
            )}

            {status.connected && status.initialized !== undefined && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Database Tables:</span>
                  <Badge variant={status.initialized ? "default" : "outline"} className="ml-2">
                    {status.initialized ? "Initialized" : "Not Initialized"}
                  </Badge>
                </div>
              </div>
            )}

            {status.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-1">Error Details:</h4>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">{JSON.stringify(status.error, null, 2)}</pre>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={checkSupabaseConnection} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Failed to check Supabase status</div>
        )}
      </CardContent>
    </Card>
  )
}
