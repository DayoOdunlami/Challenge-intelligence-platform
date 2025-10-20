import { embeddingService } from "./embeddings"
import { supabase } from "./supabase"

export interface SearchResult {
  chunkId: string
  documentId: string
  sourceId: string
  title: string
  content: string
  similarity: number
  sourceName: string
  sourceType: string
  tags: string[]
}

export interface SearchOptions {
  threshold?: number
  limit?: number
  sourceTypes?: string[]
  tags?: string[]
}

export interface CachedResult {
  results: SearchResult[]
  context: string
  timestamp: number
  query: string
}

export class KnowledgeSearch {
  private cache = new Map<string, CachedResult>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly SIMILARITY_THRESHOLD = 0.85 // For cache reuse

  // Keywords that suggest knowledge base search is needed
  private readonly knowledgeKeywords = [
    "station",
    "innovation",
    "transport",
    "funding",
    "pilot",
    "case study",
    "project",
    "commercial",
    "passenger",
    "siz",
    "railway",
    "train",
    "platform",
    "infrastructure",
    "mobility",
    "startup",
    "sme",
    "business",
    "investor",
    "policy",
    "guidance",
    "opportunity",
    "partnership",
    "technology",
    "digital",
    "smart",
  ]

  // Question patterns that typically need knowledge base
  private readonly knowledgePatterns = [
    /how do i/i,
    /what is/i,
    /tell me about/i,
    /explain/i,
    /where can i find/i,
    /who can help/i,
    /what are the/i,
    /how can i/i,
    /what funding/i,
    /case studies/i,
    /examples of/i,
    /guidance on/i,
  ]

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const { threshold = 0.7, limit = 10, sourceTypes, tags } = options

      // Check cache first
      const cachedResult = this.getCachedResult(query)
      if (cachedResult) {
        console.log("🚀 Using cached knowledge search result")
        return cachedResult.results
      }

      // Generate embedding for the search query
      const { embedding } = await embeddingService.generateEmbedding(query)

      // Log the search query
      await this.logSearchQuery(query)

      // Search using the database function
      const { data, error } = await supabase.rpc("search_knowledge_base", {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit,
      })

      if (error) {
        console.error("Error searching knowledge base:", error)
        throw error
      }

      let results = data || []

      // Apply additional filters
      if (sourceTypes && sourceTypes.length > 0) {
        results = results.filter((result: any) => sourceTypes.includes(result.source_type))
      }

      if (tags && tags.length > 0) {
        results = results.filter((result: any) => tags.some((tag) => result.tags.includes(tag)))
      }

      const searchResults = results.map((result: any) => ({
        chunkId: result.chunk_id,
        documentId: result.document_id,
        sourceId: result.source_id,
        title: result.title,
        content: result.content,
        similarity: result.similarity,
        sourceName: result.source_name,
        sourceType: result.source_type,
        tags: result.tags,
      }))

      // Cache the results
      this.cacheResult(query, searchResults)

      return searchResults
    } catch (error) {
      console.error("Error in knowledge search:", error)
      throw error
    }
  }

  async getRelevantContext(query: string, maxTokens = 2000): Promise<string> {
    try {
      // Quick relevance check
      const relevanceScore = this.calculateRelevanceScore(query)

      console.log(`📊 Query relevance score: ${relevanceScore.toFixed(2)} for: "${query.substring(0, 50)}..."`)

      // If relevance is low, return empty context (skip knowledge search)
      if (relevanceScore < 0.3) {
        console.log("⚡ Skipping knowledge search - low relevance score")
        return ""
      }

      // Check for cached context first
      const cachedResult = this.getCachedResult(query)
      if (cachedResult) {
        console.log("🚀 Using cached context")
        return cachedResult.context
      }

      // Perform full knowledge search
      console.log("🔍 Performing full knowledge base search")
      const results = await this.search(query, { limit: 20 })

      if (results.length === 0) {
        console.log("📭 No relevant knowledge found")
        return ""
      }

      // Build context from search results
      let context = ""
      let tokenCount = 0

      for (const result of results) {
        const resultText = `Source: ${result.sourceName} (${result.sourceType})\nContent: ${result.content}\n\n`
        const resultTokens = this.estimateTokens(resultText)

        if (tokenCount + resultTokens > maxTokens) {
          break
        }

        context += resultText
        tokenCount += resultTokens
      }

      // Cache the context
      this.cacheContext(query, results, context)

      console.log(`✅ Generated context: ${tokenCount} tokens from ${results.length} sources`)
      return context
    } catch (error) {
      console.error("Error getting relevant context:", error)
      return ""
    }
  }

  private calculateRelevanceScore(query: string): number {
    const lowerQuery = query.toLowerCase()
    let score = 0

    // Check for knowledge keywords (0.4 max)
    const keywordMatches = this.knowledgeKeywords.filter((keyword) => lowerQuery.includes(keyword)).length
    score += Math.min(keywordMatches * 0.1, 0.4)

    // Check for question patterns (0.3 max)
    const patternMatches = this.knowledgePatterns.filter((pattern) => pattern.test(query)).length
    score += Math.min(patternMatches * 0.15, 0.3)

    // Length bonus for detailed questions (0.2 max)
    if (query.length > 50) score += 0.1
    if (query.length > 100) score += 0.1

    // Question mark bonus (0.1)
    if (query.includes("?")) score += 0.1

    return Math.min(score, 1.0)
  }

  private getCachedResult(query: string): CachedResult | null {
    // Clean up expired cache entries
    this.cleanupCache()

    // Check for exact match first
    const exactMatch = this.cache.get(this.normalizeQuery(query))
    if (exactMatch) return exactMatch

    // Check for similar queries
    for (const [cachedQuery, result] of this.cache.entries()) {
      if (this.calculateQuerySimilarity(query, result.query) > this.SIMILARITY_THRESHOLD) {
        return result
      }
    }

    return null
  }

  private cacheResult(query: string, results: SearchResult[]): void {
    const context = this.buildContextFromResults(results)
    this.cacheContext(query, results, context)
  }

  private cacheContext(query: string, results: SearchResult[], context: string): void {
    const normalizedQuery = this.normalizeQuery(query)
    this.cache.set(normalizedQuery, {
      results,
      context,
      timestamp: Date.now(),
      query: query,
    })

    // Limit cache size
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  private buildContextFromResults(results: SearchResult[], maxTokens = 2000): string {
    let context = ""
    let tokenCount = 0

    for (const result of results) {
      const resultText = `Source: ${result.sourceName} (${result.sourceType})\nContent: ${result.content}\n\n`
      const resultTokens = this.estimateTokens(resultText)

      if (tokenCount + resultTokens > maxTokens) {
        break
      }

      context += resultText
      tokenCount += resultTokens
    }

    return context
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, result] of this.cache.entries()) {
      if (now - result.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
  }

  private calculateQuerySimilarity(query1: string, query2: string): number {
    const normalized1 = this.normalizeQuery(query1)
    const normalized2 = this.normalizeQuery(query2)

    const words1 = new Set(normalized1.split(" "))
    const words2 = new Set(normalized2.split(" "))

    const intersection = new Set([...words1].filter((x) => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size // Jaccard similarity
  }

  private async logSearchQuery(query: string): Promise<void> {
    try {
      await supabase.from("search_queries").insert({
        query,
        user_session: "anonymous", // You can enhance this with actual session tracking
      })
    } catch (error) {
      console.error("Error logging search query:", error)
      // Don't throw - this is not critical
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }

  // Public method to get cache stats for monitoring
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        query: key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
        resultsCount: value.results.length,
      })),
    }
  }

  // Public method to clear cache if needed
  clearCache() {
    this.cache.clear()
    console.log("🗑️ Knowledge search cache cleared")
  }
}

export const knowledgeSearch = new KnowledgeSearch()
