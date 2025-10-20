"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Code, Zap, BarChart3, FileText, MessageSquare, Upload } from "lucide-react"

export function AdvancedChatFeatures() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const features = [
    {
      id: "vision",
      title: "Vision Analysis",
      description: "Upload images and ask questions about them",
      icon: ImageIcon,
      example: "Upload a station layout and ask for accessibility improvements",
      color: "bg-blue-500",
    },
    {
      id: "function-calling",
      title: "Function Calling",
      description: "AI can trigger specific functions in your app",
      icon: Code,
      example: "AI can search databases, send emails, or update records",
      color: "bg-purple-500",
    },
    {
      id: "json-mode",
      title: "Structured Output",
      description: "Get responses in JSON format for easy parsing",
      icon: FileText,
      example: "Generate structured data for forms or databases",
      color: "bg-green-500",
    },
    {
      id: "streaming",
      title: "Real-time Streaming",
      description: "Get responses token-by-token as they're generated",
      icon: Zap,
      example: "See responses appear in real-time for better UX",
      color: "bg-yellow-500",
    },
    {
      id: "analytics",
      title: "Usage Analytics",
      description: "Track token usage, costs, and performance",
      icon: BarChart3,
      example: "Monitor API usage and optimize costs",
      color: "bg-red-500",
    },
    {
      id: "custom-prompts",
      title: "Custom System Prompts",
      description: "Fine-tune AI behavior for specific use cases",
      icon: MessageSquare,
      example: "Create specialized assistants for different departments",
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedFeature === feature.id ? "ring-2 ring-[#006E51]" : ""
              }`}
              onClick={() => setSelectedFeature(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <Badge variant="outline" className="text-xs">
                  {feature.example}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedFeature && (
        <Card>
          <CardHeader>
            <CardTitle>{features.find((f) => f.id === selectedFeature)?.title} - Implementation Example</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFeature === "vision" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload images to analyze station layouts, identify accessibility issues, or get suggestions for
                  improvements.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drop an image here or click to upload</p>
                  <Button className="mt-2" size="sm">
                    Choose File
                  </Button>
                </div>
                <Textarea placeholder="Ask a question about the uploaded image..." />
              </div>
            )}

            {selectedFeature === "function-calling" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Define functions that the AI can call to perform specific actions in your application.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    {`// Example function definition
const functions = [
  {
    name: "search_station_data",
    description: "Search for station information",
    parameters: {
      type: "object",
      properties: {
        station_name: { type: "string" },
        data_type: { type: "string" }
      }
    }
  }
]`}
                  </code>
                </div>
              </div>
            )}

            {selectedFeature === "json-mode" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Get structured responses that can be easily parsed and used in your application.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    {`// Example JSON response
{
  "station_assessment": {
    "accessibility_score": 8.5,
    "improvements": [
      "Add tactile paving",
      "Install audio announcements"
    ],
    "priority": "high"
  }
}`}
                  </code>
                </div>
              </div>
            )}

            {selectedFeature === "streaming" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Responses appear in real-time as they're generated, providing a better user experience.
                </p>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Streaming response...</span>
                  </div>
                  <p className="text-sm">
                    The AI response appears here word by word as it's being generated, creating a more interactive
                    experience...
                  </p>
                </div>
              </div>
            )}

            {selectedFeature === "analytics" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Monitor your API usage, track costs, and optimize performance.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,234</div>
                    <div className="text-sm text-blue-800">Tokens used today</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$2.45</div>
                    <div className="text-sm text-green-800">Cost this month</div>
                  </div>
                </div>
              </div>
            )}

            {selectedFeature === "custom-prompts" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Create specialized AI assistants with custom system prompts for different use cases.
                </p>
                <Textarea
                  placeholder="Enter your custom system prompt here..."
                  defaultValue="You are a Station Innovation Zone expert specializing in accessibility assessments. Always provide practical, actionable recommendations based on current accessibility standards..."
                  rows={4}
                />
                <Button>Save Custom Prompt</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
