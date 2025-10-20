"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, Key, CreditCard, Zap } from "lucide-react"

interface APIStatus {
  isValid: boolean
  model: string
  organization?: string
  usage?: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
  error?: string
  rateLimits?: {
    requests_per_minute: number
    tokens_per_minute: number
  }
}

export function APIKeyTester() {
  const [status, setStatus] = useState<APIStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testMessage, setTestMessage] = useState("")

  const testAPIKey = async () => {
    setIsLoading(true)
    setStatus(null)

    try {
      const response = await fetch("/api/test-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testMessage || "Hello, this is a test message to verify the API key is working.",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          isValid: true,
          model: data.model,
          organization: data.organization,
          usage: data.usage,
          rateLimits: data.rateLimits,
        })
      } else {
        setStatus({
          isValid: false,
          model: "",
          error: data.error || "Unknown error occurred",
        })
      }
    } catch (error) {
      setStatus({
        isValid: false,
        model: "",
        error: "Failed to connect to API",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkAccountLimits = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/check-limits")
      const data = await response.json()

      if (response.ok) {
        alert(
          `Account Info:\n- Plan: ${data.plan}\n- Usage: $${data.usage_this_month}\n- Limit: $${data.hard_limit_usd}`,
        )
      } else {
        alert("Could not fetch account information")
      }
    } catch (error) {
      alert("Error checking account limits")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testAPIKey} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test API Key"
              )}
            </Button>
            <Button onClick={checkAccountLimits} variant="outline" disabled={isLoading}>
              <CreditCard className="mr-2 h-4 w-4" />
              Check Limits
            </Button>
          </div>

          {status && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {status.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={status.isValid ? "text-green-700" : "text-red-700"}>
                  {status.isValid ? "API Key is working!" : "API Key failed"}
                </span>
              </div>

              {status.isValid && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Model Information</h4>
                    <Badge variant="secondary">{status.model}</Badge>
                    {status.organization && <p className="text-sm text-gray-600">Org: {status.organization}</p>}
                  </div>

                  {status.usage && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Token Usage</h4>
                      <div className="text-sm space-y-1">
                        <div>Total: {status.usage.total_tokens}</div>
                        <div>Prompt: {status.usage.prompt_tokens}</div>
                        <div>Completion: {status.usage.completion_tokens}</div>
                      </div>
                    </div>
                  )}

                  {status.rateLimits && (
                    <div className="space-y-2 md:col-span-2">
                      <h4 className="font-medium">Rate Limits</h4>
                      <div className="text-sm space-y-1">
                        <div>Requests/min: {status.rateLimits.requests_per_minute}</div>
                        <div>Tokens/min: {status.rateLimits.tokens_per_minute}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {status.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{status.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Features Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">GPT-4 Models</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• gpt-4o (latest, multimodal)</li>
                <li>• gpt-4o-mini (faster, cheaper)</li>
                <li>• gpt-4-turbo (previous generation)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Advanced Capabilities</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Function calling</li>
                <li>• JSON mode</li>
                <li>• Vision (image analysis)</li>
                <li>• Structured outputs</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Streaming Features</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Real-time responses</li>
                <li>• Token-by-token streaming</li>
                <li>• Partial message updates</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Usage Monitoring</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Token counting</li>
                <li>• Cost tracking</li>
                <li>• Rate limit monitoring</li>
                <li>• Usage analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
