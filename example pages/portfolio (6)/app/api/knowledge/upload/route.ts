import type { NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"
import { documentProcessor } from "@/lib/document-processor"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const sourceId = formData.get("sourceId") as string

    if (!file || !sourceId) {
      return Response.json({ error: "File and source ID are required" }, { status: 400 })
    }

    // Update source status to processing
    await supabase.from("knowledge_sources").update({ status: "processing" }).eq("id", sourceId)

    let documentId: string

    try {
      // Process based on file type
      if (file.type === "application/pdf") {
        documentId = await documentProcessor.processPDFDocument(file, sourceId)
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        documentId = await documentProcessor.processWordDocument(file, sourceId)
      } else {
        throw new Error("Unsupported file type")
      }

      // Update source status to completed
      await supabase
        .from("knowledge_sources")
        .update({
          status: "completed",
          last_updated: new Date().toISOString(),
        })
        .eq("id", sourceId)

      return Response.json({
        success: true,
        documentId,
        message: "File processed successfully",
      })
    } catch (processingError) {
      console.error("Error processing file:", processingError)

      // Update source status to failed
      await supabase.from("knowledge_sources").update({ status: "failed" }).eq("id", sourceId)

      throw processingError
    }
  } catch (error) {
    console.error("Error in file upload:", error)
    return Response.json({ error: "Failed to process file" }, { status: 500 })
  }
}
