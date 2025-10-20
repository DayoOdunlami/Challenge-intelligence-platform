"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react"

interface EnvStatus {
  connected: boolean
  initialized?: boolean
  message: string
  envVars?: {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: boolean
      correct: boolean
      value: string
    }
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: boolean
      correct: boolean
      value: string
    }
  }
  instructions?: string
  error?: any
}

export default function VerifyEnvPage() {
  const [status, setStatus] = useState<EnvStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  // Add this success banner
  const SuccessBanner = () => (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <div>
          <h3 className="font-medium text-green-800">Environment Variables Added!</h3>
          <p className="text-sm text-green-700">
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY have been configured. Let's verify they're
            working correctly.
          </p>
        </div>
      </div>
    </div>
  )

  const checkEnvironmentVariables = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/check-supabase")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        connected: false,
        message: "Failed to check environment variables",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environment Variables Check</h1>
          <p className="text-gray-600">Verify that your Supabase environment variables are properly configured.</p>
        </div>

        <SuccessBanner />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Environment Variables Status
              <Button onClick={checkEnvironmentVariables} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2">Checking environment variables...</span>
              </div>
            ) : status ? (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className="flex items-center gap-3">
                  {status.connected ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {status.connected ? "Environment Variables Configured" : "Configuration Issues"}
                    </h3>
                    <p className="text-sm text-gray-600">{status.message}</p>
                  </div>
                </div>

                {/* Environment Variables Details */}
                {status.envVars && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Environment Variables:</h4>

                    {Object.entries(status.envVars).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm">{key}</span>
                          <div className="flex gap-2">
                            <Badge variant={value.exists ? "default" : "destructive"}>
                              {value.exists ? "Set" : "Missing"}
                            </Badge>
                            {value.exists && (
                              <Badge variant={value.correct ? "default" : "outline"}>
                                {value.correct ? "Correct" : "Check Value"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 font-mono">{value.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Instructions */}
                {status.instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Next Steps:</h4>
                        <p className="text-sm text-blue-700 mt-1">{status.instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database Status */}
                {status.connected && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-800">
                        {status.initialized ? "Database Ready!" : "Database Setup Needed"}
                      </span>
                    </div>
                    {!status.initialized && (
                      <p className="text-sm text-green-700 mt-1">
                        Environment variables are correct. Now run the SQL migration script.
                      </p>
                    )}
                  </div>
                )}

                {/* Error Details */}
                {status.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                    <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                      {JSON.stringify(status.error, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href="/setup-database" target="_blank" rel="noreferrer">
                      Setup Database
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/supabase-status" target="_blank" rel="noreferrer">
                      Full Status Check
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">Failed to check environment variables</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
