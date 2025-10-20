"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, FileText, Database, Search, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface KnowledgeSource {
  id: string
  name: string
  type: "website" | "pdf" | "docx" | "manual"
  url?: string
  description?: string
  status?: "pending" | "processing" | "completed" | "failed"
  last_updated?: string
  created_at: string
}

interface KnowledgeStats {
  total_sources: number
  total_documents: number
  total_chunks: number
  sources_by_type: Record<string, number>
  recent_updates: number
}

export default function KnowledgeBaseManager() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [schemaReady, setSchemaReady] = useState(false)
  const [schemaChecked, setSchemaChecked] = useState(false)
  const { toast } = useToast()

  // Form states
  const [newSource, setNewSource] = useState({
    name: "",
    type: "website" as const,
    url: "",
    description: "",
  })

  useEffect(() => {
    checkSchema()
  }, [])

  const checkSchema = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/knowledge/init-schema")
      if (response.ok) {
        const data = await response.json()
        setSchemaReady(data.exists)
        setSchemaChecked(true)

        if (data.exists) {
          loadSources()
          loadStats()
        }
      }
    } catch (error) {
      console.error("Schema check failed:", error)
      setSchemaReady(false)
      setSchemaChecked(true)
    } finally {
      setLoading(false)
    }
  }

  const loadSources = async () => {
    try {
      const response = await fetch("/api/knowledge/sources")
      if (response.ok) {
        const data = await response.json()
        setSources(data)
      }
    } catch (error) {
      console.error("Error loading sources:", error)
      toast({
        title: "Error",
        description: "Failed to load knowledge sources",
        variant: "destructive",
      })
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/knowledge/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.type) {
      toast({
        title: "Error",
        description: "Name and type are required",
        variant: "destructive",
      })
      return
    }

    if (newSource.type === "website" && !newSource.url) {
      toast({
        title: "Error",
        description: "URL is required for website sources",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch("/api/knowledge/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSource.name,
          type: newSource.type,
          url: newSource.url || undefined,
          description: newSource.description || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Knowledge source added successfully",
        })
        setNewSource({ name: "", type: "website", url: "", description: "" })
        loadSources()
        loadStats()
      } else {
        throw new Error(result.error || "Failed to add source")
      }
    } catch (error: any) {
      console.error("Error adding source:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add knowledge source",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const initializeSchema = async () => {
    setProcessing(true)
    try {
      const response = await fetch("/api/knowledge/init-schema", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Knowledge base schema initialized successfully",
        })
        setSchemaReady(true)
        loadSources()
        loadStats()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to initialize schema")
      }
    } catch (error: any) {
      console.error("Error initializing schema:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to initialize knowledge base schema",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>

    const variants = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    } as const

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "website":
        return <Globe className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "docx":
        return <FileText className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading knowledge base...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Schema Status Alert */}
      {schemaChecked && !schemaReady && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Knowledge base tables not found. Initialize the database to get started.</span>
            <Button onClick={initializeSchema} disabled={processing} size="sm" variant="outline">
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Knowledge Base"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && schemaReady && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-[#006E51]" />
                <div>
                  <p className="text-sm font-medium">Total Sources</p>
                  <p className="text-2xl font-bold">{stats.total_sources}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-[#006E51]" />
                <div>
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-2xl font-bold">{stats.total_documents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-[#006E51]" />
                <div>
                  <p className="text-sm font-medium">Text Chunks</p>
                  <p className="text-2xl font-bold">{stats.total_chunks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-[#006E51]" />
                <div>
                  <p className="text-sm font-medium">Recent Updates</p>
                  <p className="text-2xl font-bold">{stats.recent_updates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Knowledge Sources</TabsTrigger>
          <TabsTrigger value="add" disabled={!schemaReady}>
            Add New Source
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          {!schemaReady ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Knowledge Base Not Set Up</h3>
                <p className="text-gray-600 mb-4">
                  You need to initialize the knowledge base tables before you can add sources.
                </p>
                <Button onClick={initializeSchema} disabled={processing}>
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Knowledge Base"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : sources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Knowledge Sources</h3>
                <p className="text-gray-600 mb-4">Add your first knowledge source to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sources.map((source) => (
                <Card key={source.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(source.type)}
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        {getStatusBadge(source.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {source.description && <CardDescription>{source.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {source.url && (
                        <p className="text-sm text-gray-600">
                          <strong>URL:</strong> {source.url}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <strong>Created:</strong> {new Date(source.created_at).toLocaleDateString()}
                      </p>
                      {source.last_updated && (
                        <p className="text-sm text-gray-600">
                          <strong>Last Updated:</strong> {new Date(source.last_updated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          {schemaReady ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Knowledge Source</CardTitle>
                <CardDescription>
                  Add websites, PDFs, or Word documents to enhance the chatbot's knowledge base.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source-name">Source Name</Label>
                    <Input
                      id="source-name"
                      placeholder="e.g., Station Innovation Guide"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source-type">Source Type</Label>
                    <Select
                      value={newSource.type}
                      onValueChange={(value: any) => setNewSource({ ...newSource, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="docx">Word Document</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newSource.type === "website" && (
                  <div className="space-y-2">
                    <Label htmlFor="source-url">Website URL</Label>
                    <Input
                      id="source-url"
                      type="url"
                      placeholder="https://example.com"
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="source-description">Description (Optional)</Label>
                  <Textarea
                    id="source-description"
                    placeholder="Brief description of this knowledge source..."
                    value={newSource.description}
                    onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddSource} disabled={processing} className="w-full">
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Knowledge Source
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Knowledge Base Not Initialized</h3>
                <p className="text-gray-600 mb-4">Please initialize the knowledge base schema before adding sources.</p>
                <Button onClick={initializeSchema} disabled={processing}>
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Knowledge Base"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
