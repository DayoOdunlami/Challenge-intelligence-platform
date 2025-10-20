"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Database, Cloud, HardDrive } from "lucide-react"

export function StorageStatus() {
  const storageItems = [
    {
      item: "Prompt Configuration",
      status: "temporary",
      description: "Stored in memory - resets on server restart",
      icon: HardDrive,
    },
    {
      item: "Chat Conversations",
      status: "not-stored",
      description: "Not being saved anywhere",
      icon: Database,
    },
    {
      item: "User Analytics",
      status: "mock-data",
      description: "Showing placeholder/demo data",
      icon: Cloud,
    },
    {
      item: "A/B Test Results",
      status: "not-stored",
      description: "Not being saved anywhere",
      icon: Database,
    },
    {
      item: "User Feedback",
      status: "not-stored",
      description: "Not being saved anywhere",
      icon: Database,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "temporary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "not-stored":
        return "bg-red-100 text-red-800 border-red-200"
      case "mock-data":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Current Storage Status
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your data is currently not being permanently stored. Here's what needs a database:
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {storageItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(item.status)} border`}>{item.status.replace("-", " ")}</Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
