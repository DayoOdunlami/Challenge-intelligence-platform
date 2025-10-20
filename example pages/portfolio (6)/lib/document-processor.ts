import { embeddingService } from "./embeddings"
import { supabase } from "./supabase"

export interface ProcessedDocument {
  title: string
  content: string
  chunks: DocumentChunk[]
  metadata: Record<string, any>
}

export interface DocumentChunk {
  content: string
  index: number
  wordCount: number
  metadata: Record<string, any>
}

export class DocumentProcessor {
  private readonly chunkSize = 1000 // words per chunk
  private readonly chunkOverlap = 200 // words overlap between chunks

  async processDocument(
    sourceId: string,
    content: string,
    title: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    try {
      // Create document record
      const { data: document, error: docError } = await supabase
        .from("knowledge_documents")
        .insert({
          source_id: sourceId,
          title,
          content,
          word_count: this.countWords(content),
          metadata,
        })
        .select()
        .single()

      if (docError) throw docError

      // Split content into chunks
      const chunks = this.createChunks(content)

      // Process chunks with embeddings
      await this.processChunks(document.id, chunks)

      return document.id
    } catch (error) {
      console.error("Error processing document:", error)
      throw error
    }
  }

  async processWebContent(url: string, sourceId: string): Promise<string> {
    try {
      // Use Firecrawl to scrape the website
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Failed to scrape website")
      }

      const { title, content, metadata } = await response.json()

      return await this.processDocument(sourceId, content, title, {
        ...metadata,
        url,
        scraped_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error processing web content:", error)
      throw error
    }
  }

  async processPDFDocument(file: File, sourceId: string): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("sourceId", sourceId)

      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process PDF")
      }

      const { documentId } = await response.json()
      return documentId
    } catch (error) {
      console.error("Error processing PDF:", error)
      throw error
    }
  }

  async processWordDocument(file: File, sourceId: string): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("sourceId", sourceId)

      const response = await fetch("/api/process-docx", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process Word document")
      }

      const { documentId } = await response.json()
      return documentId
    } catch (error) {
      console.error("Error processing Word document:", error)
      throw error
    }
  }

  private createChunks(content: string): DocumentChunk[] {
    const words = content.split(/\s+/)
    const chunks: DocumentChunk[] = []
    let chunkIndex = 0

    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunkWords = words.slice(i, i + this.chunkSize)
      const chunkContent = chunkWords.join(" ")

      if (chunkContent.trim().length > 0) {
        chunks.push({
          content: chunkContent,
          index: chunkIndex++,
          wordCount: chunkWords.length,
          metadata: {
            start_word: i,
            end_word: i + chunkWords.length,
          },
        })
      }
    }

    return chunks
  }

  private async processChunks(documentId: string, chunks: DocumentChunk[]): Promise<void> {
    const batchSize = 10

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      // Generate embeddings for the batch
      const embeddings = await embeddingService.generateBatchEmbeddings(batch.map((chunk) => chunk.content))

      // Insert chunks with embeddings
      const chunkRecords = batch.map((chunk, index) => ({
        document_id: documentId,
        content: chunk.content,
        chunk_index: chunk.index,
        word_count: chunk.wordCount,
        embedding: embeddings[index].embedding,
        metadata: chunk.metadata,
      }))

      const { error } = await supabase.from("knowledge_chunks").insert(chunkRecords)

      if (error) {
        console.error("Error inserting chunks:", error)
        throw error
      }
    }
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length
  }
}

export const documentProcessor = new DocumentProcessor()
