"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface EnvStatus {
  success: boolean
  environment: {
    OPENAI_API_KEY: string
    OPENAI_ORG_ID: string
  }
  next_steps: string
}

export function EnvChecker() {
  const [status, setStatus] = useState<EnvStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkEnvironment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/verify-env")

      if (!response.ok) {
        throw new Error("Failed to verify environment variables")
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError("Could not verify environment variables. Please check your server logs.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2">Checking environment...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
        ) : status ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                {status.environment.OPENAI_API_KEY.includes("✓") ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>OPENAI_API_KEY: {status.environment.OPENAI_API_KEY}</span>
              </div>

              <div className="flex items-center">
                {status.environment.OPENAI_ORG_ID.includes("✓") ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <span className="text-gray-400 mr-2">○</span>
                )}
                <span>OPENAI_ORG_ID: {status.environment.OPENAI_ORG_ID}</span>
                {status.environment.OPENAI_ORG_ID.includes("Missing") && (
                  <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                )}
              </div>
            </div>

            <div
              className={`p-3 rounded-md ${status.environment.OPENAI_API_KEY.includes("✓") ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}
            >
              {status.next_steps}
            </div>

            <div className="flex justify-end">
              <Button onClick={checkEnvironment} size="sm" variant="outline">
                Refresh Status
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
