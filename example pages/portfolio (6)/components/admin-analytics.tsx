"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, TrendingUp, Clock } from "lucide-react"

interface AnalyticsData {
  totalConversations: number
  totalMessages: number
  averageSessionLength: number
  userTypes: Record<string, number>
  popularQuestions: Array<{ question: string; count: number }>
  dailyUsage: Array<{ date: string; conversations: number }>
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#006E51]" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalConversations}</p>
                <p className="text-sm text-gray-600">Total Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#006E51]" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#006E51]" />
              <div>
                <p className="text-2xl font-bold">{analytics.averageSessionLength}m</p>
                <p className="text-sm text-gray-600">Avg Session Length</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#006E51]" />
              <div>
                <p className="text-2xl font-bold">+23%</p>
                <p className="text-sm text-gray-600">Growth This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Types */}
      <Card>
        <CardHeader>
          <CardTitle>User Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.userTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#006E51] h-2 rounded-full"
                      style={{ width: `${(count / analytics.totalConversations) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Most Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.popularQuestions.map((item, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm flex-1">{item.question}</p>
                <Badge variant="outline">{item.count} times</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
