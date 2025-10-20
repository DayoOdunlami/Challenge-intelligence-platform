import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return Response.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Use Firecrawl API if available, otherwise fallback to basic scraping
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY

    if (firecrawlApiKey) {
      return await scrapeWithFirecrawl(url, firecrawlApiKey)
    } else {
      return await scrapeWithFetch(url)
    }
  } catch (error) {
    console.error("Error in scrape-website:", error)
    return Response.json({ error: "Failed to scrape website" }, { status: 500 })
  }
}

async function scrapeWithFirecrawl(url: string, apiKey: string) {
  try {
    const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        pageOptions: {
          onlyMainContent: true,
          includeHtml: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`)
    }

    const data = await response.json()

    return Response.json({
      title: data.data?.metadata?.title || "Untitled",
      content: data.data?.content || "",
      metadata: {
        description: data.data?.metadata?.description,
        keywords: data.data?.metadata?.keywords,
        author: data.data?.metadata?.author,
        scraped_with: "firecrawl",
        source_url: url,
      },
    })
  } catch (error) {
    console.error("Firecrawl scraping failed:", error)
    // Fallback to basic scraping
    return await scrapeWithFetch(url)
  }
}

async function scrapeWithFetch(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KnowledgeBot/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const html = await response.text()

    // Basic HTML parsing (you might want to use a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : "Untitled"

    // Remove HTML tags and extract text content
    const content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Extract meta description
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
    const description = descriptionMatch ? descriptionMatch[1] : ""

    return Response.json({
      title,
      content,
      metadata: {
        description,
        scraped_with: "basic",
        source_url: url,
        content_length: content.length,
      },
    })
  } catch (error) {
    console.error("Basic scraping failed:", error)
    throw error
  }
}
