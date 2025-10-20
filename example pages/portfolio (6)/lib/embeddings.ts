import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

export class EmbeddingService {
  private static instance: EmbeddingService
  private readonly model = "text-embedding-ada-002"

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService()
    }
    return EmbeddingService.instance
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      // Clean and prepare text
      const cleanText = this.cleanText(text)

      const response = await openai.embeddings.create({
        model: this.model,
        input: cleanText,
      })

      return {
        embedding: response.data[0].embedding,
        tokens: response.usage.total_tokens,
      }
    } catch (error) {
      console.error("Error generating embedding:", error)
      throw new Error("Failed to generate embedding")
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      // Clean texts and split into batches (OpenAI has limits)
      const cleanTexts = texts.map((text) => this.cleanText(text))
      const batchSize = 100 // OpenAI's batch limit
      const results: EmbeddingResult[] = []

      for (let i = 0; i < cleanTexts.length; i += batchSize) {
        const batch = cleanTexts.slice(i, i + batchSize)

        const response = await openai.embeddings.create({
          model: this.model,
          input: batch,
        })

        const batchResults = response.data.map((item, index) => ({
          embedding: item.embedding,
          tokens: Math.ceil(response.usage.total_tokens / batch.length), // Approximate tokens per text
        }))

        results.push(...batchResults)
      }

      return results
    } catch (error) {
      console.error("Error generating batch embeddings:", error)
      throw new Error("Failed to generate batch embeddings")
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim()
      .substring(0, 8000) // Limit to ~8000 characters to stay within token limits
  }

  // Calculate cosine similarity between two embeddings
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same length")
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }
}

export const embeddingService = EmbeddingService.getInstance()
