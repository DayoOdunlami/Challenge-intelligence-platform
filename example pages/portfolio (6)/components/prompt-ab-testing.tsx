"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause } from "lucide-react"

interface ABTest {
  id: string
  name: string
  status: "draft" | "running" | "completed"
  variantA: {
    name: string
    prompt: string
    traffic: number
    conversions: number
    satisfaction: number
  }
  variantB: {
    name: string
    prompt: string
    traffic: number
    conversions: number
    satisfaction: number
  }
  startDate?: string
  endDate?: string
}

export function PromptABTesting() {
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: "test-1",
      name: "User Profiling Approach",
      status: "running",
      variantA: {
        name: "Direct Question",
        prompt: "Before we dive in, may I ask—are you a business, transport professional...",
        traffic: 156,
        conversions: 89,
        satisfaction: 4.2,
      },
      variantB: {
        name: "Contextual Discovery",
        prompt: "I'm here to help with Station Innovation Zone questions. What brings you here today?",
        traffic: 144,
        conversions: 102,
        satisfaction: 4.6,
      },
      startDate: "2024-01-15",
    },
  ])

  const [newTest, setNewTest] = useState({
    name: "",
    variantA: { name: "Control", prompt: "" },
    variantB: { name: "Variant", prompt: "" },
  })

  const createTest = () => {
    const test: ABTest = {
      id: `test-${Date.now()}`,
      name: newTest.name,
      status: "draft",
      variantA: { ...newTest.variantA, traffic: 0, conversions: 0, satisfaction: 0 },
      variantB: { ...newTest.variantB, traffic: 0, conversions: 0, satisfaction: 0 },
    }
    setTests([...tests, test])
    setNewTest({ name: "", variantA: { name: "Control", prompt: "" }, variantB: { name: "Variant", prompt: "" } })
  }

  const toggleTest = (testId: string) => {
    setTests(
      tests.map((test) =>
        test.id === testId
          ? {
              ...test,
              status: test.status === "running" ? "completed" : "running",
              startDate: test.status === "draft" ? new Date().toISOString().split("T")[0] : test.startDate,
              endDate: test.status === "running" ? new Date().toISOString().split("T")[0] : undefined,
            }
          : test,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Tests */}
      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        test.status === "running" ? "default" : test.status === "completed" ? "secondary" : "outline"
                      }
                    >
                      {test.status}
                    </Badge>
                    {test.startDate && <span className="text-sm text-gray-500">Started: {test.startDate}</span>}
                  </div>
                </div>
                <Button
                  onClick={() => toggleTest(test.id)}
                  variant={test.status === "running" ? "destructive" : "default"}
                  size="sm"
                >
                  {test.status === "running" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Test
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variant A */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#006E51]">{test.variantA.name}</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{test.variantA.prompt}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">{test.variantA.traffic}</div>
                      <div className="text-xs text-gray-500">Traffic</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{test.variantA.conversions}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{test.variantA.satisfaction}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>

                {/* Variant B */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#006E51]">{test.variantB.name}</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{test.variantB.prompt}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">{test.variantB.traffic}</div>
                      <div className="text-xs text-gray-500">Traffic</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{test.variantB.conversions}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{test.variantB.satisfaction}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
              </div>

              {test.status === "running" && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Winner:</strong> Variant B is performing{" "}
                    {((test.variantB.satisfaction / test.variantA.satisfaction - 1) * 100).toFixed(1)}% better
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New Test */}
      <Card>
        <CardHeader>
          <CardTitle>Create New A/B Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              value={newTest.name}
              onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
              placeholder="e.g., Welcome Message Optimization"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Variant A (Control)</Label>
              <Input
                value={newTest.variantA.name}
                onChange={(e) => setNewTest({ ...newTest, variantA: { ...newTest.variantA, name: e.target.value } })}
                placeholder="Control name"
              />
              <Textarea
                value={newTest.variantA.prompt}
                onChange={(e) => setNewTest({ ...newTest, variantA: { ...newTest.variantA, prompt: e.target.value } })}
                placeholder="Enter control prompt..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Variant B (Test)</Label>
              <Input
                value={newTest.variantB.name}
                onChange={(e) => setNewTest({ ...newTest, variantB: { ...newTest.variantB, name: e.target.value } })}
                placeholder="Variant name"
              />
              <Textarea
                value={newTest.variantB.prompt}
                onChange={(e) => setNewTest({ ...newTest, variantB: { ...newTest.variantB, prompt: e.target.value } })}
                placeholder="Enter test prompt..."
                rows={4}
              />
            </div>
          </div>

          <Button onClick={createTest} disabled={!newTest.name || !newTest.variantA.prompt || !newTest.variantB.prompt}>
            Create A/B Test
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
