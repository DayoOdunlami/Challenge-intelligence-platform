"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, RotateCcw, Eye, Settings, MessageSquare, User, Database } from "lucide-react"
import { AIChatPopup } from "@/components/ai-chat-popup"
import { SupabaseConnectionStatus } from "@/components/supabase-connection-status"
import KnowledgeBaseManager from "@/components/knowledge-base-manager"

const DEFAULT_SYSTEM_PROMPT = `You are the Station Innovation Zone (SIZ) Assistant, a helpful and engaging prototype chatbot designed to support a wide range of users interacting with the UK's Station Innovation Zone platform.

Your goal is to identify the user type early in the conversation (e.g. startup/SME, station manager, member of the public, transport planner, tech provider, investor, or policymaker) and respond accordingly with tone, language, and suggestions tailored to their needs.

You can draw on the Station Innovation Zone's key themes:

• Station innovation opportunities
• Project case studies and guidance tools
• Commercial and operational insights
• Passenger experience and community impact
• Access to funding, pilots, and policy direction

Use this knowledge to offer:
• Quick answers
• Guidance on where to go next
• Summaries of relevant SIZ content
• Suggestions for innovation participation or exploration

If a question is beyond your scope or knowledge:
• Kindly state that you're a prototype assistant still learning
• Offer to log feedback or suggest where the user might go instead

Always keep a tone that is:
• Curious, encouraging, concise
• Helpful to both newcomers and experts
• Open to feedback ("Let me know if this helped or if you'd like more detail.")

Begin by gently asking something like:
"Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests."`

interface PromptConfig {
  systemPrompt: string
  welcomeMessage: string
  userProfiling: boolean
  contextualResponses: boolean
  feedbackEncouragement: boolean
  model: string
  temperature: number
  maxTokens: number
}

export default function AdminPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState<PromptConfig>({
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    welcomeMessage:
      "Hello! I'm your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests.",
    userProfiling: true,
    contextualResponses: true,
    feedbackEncouragement: true,
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 1000,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load saved configuration on mount
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const response = await fetch("/api/admin/prompt-config")
      if (response.ok) {
        const savedConfig = await response.json()
        setConfig(savedConfig)
      }
    } catch (error) {
      console.error("Failed to load configuration:", error)
    }
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/prompt-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Configuration saved!",
          description: "Your chatbot prompt configuration has been updated.",
        })
        setHasChanges(false)
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefault = () => {
    setConfig({
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      welcomeMessage:
        "Hello! I'm your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I'll do my best to guide you based on your interests.",
      userProfiling: true,
      contextualResponses: true,
      feedbackEncouragement: true,
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
    })
    setHasChanges(true)
  }

  const updateConfig = (key: keyof PromptConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const userTypes = [
    "Startup/SME",
    "Station Manager",
    "Member of Public",
    "Transport Planner",
    "Tech Provider",
    "Investor",
    "Policymaker",
  ]

  return (
    <div className="container py-12 max-w-6xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Station Innovation Zone - Admin Panel</h1>
            <p className="text-gray-600">Configure your AI chatbot's behavior, responses, and knowledge base</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
            <AIChatPopup
              triggerElement={
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Chat
                </Button>
              }
            />
          </div>
        </div>

        {/* Add Supabase Connection Status */}
        <SupabaseConnectionStatus />

        <Tabs defaultValue="prompt" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompt Engineering
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Behavior Settings
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Model Configuration
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview & Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Prompt Configuration</CardTitle>
                <p className="text-sm text-gray-600">
                  Define how your chatbot behaves and responds to users. This is the core instruction set.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={config.systemPrompt}
                    onChange={(e) => updateConfig("systemPrompt", e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter your system prompt here..."
                  />
                  <p className="text-xs text-gray-500">
                    This prompt defines the chatbot's personality, knowledge scope, and response style.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => updateConfig("welcomeMessage", e.target.value)}
                    rows={3}
                    placeholder="Enter the initial message users see..."
                  />
                  <p className="text-xs text-gray-500">The first message users see when they open the chat.</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={resetToDefault} variant="outline" size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Behavior Settings</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure how the chatbot interacts with different types of users.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>User Profiling</Label>
                    <p className="text-sm text-gray-500">Ask users about their role to provide tailored responses</p>
                  </div>
                  <Switch
                    checked={config.userProfiling}
                    onCheckedChange={(checked) => updateConfig("userProfiling", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Contextual Responses</Label>
                    <p className="text-sm text-gray-500">
                      Use Station Innovation Zone knowledge to provide relevant answers
                    </p>
                  </div>
                  <Switch
                    checked={config.contextualResponses}
                    onCheckedChange={(checked) => updateConfig("contextualResponses", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Feedback Encouragement</Label>
                    <p className="text-sm text-gray-500">Actively ask for feedback and offer to help further</p>
                  </div>
                  <Switch
                    checked={config.feedbackEncouragement}
                    onCheckedChange={(checked) => updateConfig("feedbackEncouragement", checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Supported User Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {userTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    The chatbot will adapt its responses based on these user categories.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="model" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
                <p className="text-sm text-gray-600">Fine-tune the AI model parameters for optimal performance.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <select
                      id="model"
                      value={config.model}
                      onChange={(e) => updateConfig("model", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="gpt-4o">GPT-4o (Latest, Multimodal)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Faster, Cheaper)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Most Economical)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => updateConfig("temperature", Number.parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Lower = more focused, Higher = more creative</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => updateConfig("maxTokens", Number.parseInt(e.target.value))}
                      min="100"
                      max="4000"
                    />
                    <p className="text-xs text-gray-500">Maximum length of AI responses (100-4000)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Knowledge Base Management</h3>
              <p className="text-sm text-gray-600 mb-6">
                Manage the chatbot's knowledge base with websites, documents, and manual content. The chatbot will use
                this information to provide more accurate and contextual responses.
              </p>
            </div>
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview & Test Configuration</CardTitle>
                <p className="text-sm text-gray-600">Test your chatbot configuration before saving changes.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Current Configuration Summary:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Model:</span> {config.model}
                    </div>
                    <div>
                      <span className="font-medium">Temperature:</span> {config.temperature}
                    </div>
                    <div>
                      <span className="font-medium">Max Tokens:</span> {config.maxTokens}
                    </div>
                    <div>
                      <span className="font-medium">User Profiling:</span>{" "}
                      {config.userProfiling ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Welcome Message Preview:</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm">{config.welcomeMessage}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <AIChatPopup
                    triggerElement={
                      <Button className="bg-[#006E51] hover:bg-[#005A42] text-white">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Test Chat with Current Settings
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button onClick={saveConfiguration} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
