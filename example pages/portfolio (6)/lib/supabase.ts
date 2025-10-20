// Conditional Supabase client that gracefully handles missing environment variables

let supabase: any = null

try {
  // Only create Supabase client if environment variables are available
  if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const { createClient } = require("@supabase/supabase-js")
      supabase = createClient(supabaseUrl, supabaseKey)
    }
  }
} catch (error) {
  console.log("Supabase not available:", error)
}

// Export a proxy that handles missing Supabase gracefully
export { supabase }

// Database schema types
export interface PromptConfig {
  id: string
  system_prompt: string
  welcome_message: string
  user_profiling: boolean
  contextual_responses: boolean
  feedback_encouragement: boolean
  model: string
  temperature: number
  max_tokens: number
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Conversation {
  id: string
  session_id: string
  user_type?: string
  messages: any[]
  satisfaction_rating?: number
  feedback?: string
  started_at: string
  ended_at?: string
  prompt_config_id: string
}

export interface UserFeedback {
  id: string
  conversation_id: string
  rating: number
  comment?: string
  user_type?: string
  created_at: string
}

// Database operations with error handling
export class SupabaseService {
  private isAvailable(): boolean {
    return supabase !== null
  }

  // Prompt Configuration
  async savePromptConfig(config: Omit<PromptConfig, "id" | "created_at" | "updated_at">) {
    if (!this.isAvailable()) {
      throw new Error("Supabase not configured")
    }

    const { data, error } = await supabase.from("prompt_configs").insert([config]).select().single()

    if (error) throw error
    return data
  }

  async getActivePromptConfig(): Promise<PromptConfig | null> {
    if (!this.isAvailable()) {
      return null
    }

    const { data, error } = await supabase
      .from("prompt_configs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  // Conversations
  async saveConversation(conversation: Omit<Conversation, "id" | "started_at">) {
    if (!this.isAvailable()) {
      console.log("Supabase not available, skipping conversation save")
      return null
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert([{ ...conversation, started_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateConversation(id: string, updates: Partial<Conversation>) {
    if (!this.isAvailable()) {
      console.log("Supabase not available, skipping conversation update")
      return null
    }

    const { data, error } = await supabase.from("conversations").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  // Analytics
  async getAnalytics(days = 30) {
    if (!this.isAvailable()) {
      // Return mock data if Supabase is not available
      return {
        totalConversations: 0,
        userTypes: {},
        averageSatisfaction: 0,
      }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get conversation count
    const { count: totalConversations } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .gte("started_at", startDate.toISOString())

    // Get user types distribution
    const { data: userTypes } = await supabase
      .from("conversations")
      .select("user_type")
      .gte("started_at", startDate.toISOString())
      .not("user_type", "is", null)

    // Get average satisfaction
    const { data: satisfactionData } = await supabase
      .from("conversations")
      .select("satisfaction_rating")
      .gte("started_at", startDate.toISOString())
      .not("satisfaction_rating", "is", null)

    return {
      totalConversations: totalConversations || 0,
      userTypes: this.groupBy(userTypes || [], "user_type"),
      averageSatisfaction: this.calculateAverage(satisfactionData || [], "satisfaction_rating"),
    }
  }

  // User Feedback
  async saveFeedback(feedback: Omit<UserFeedback, "id" | "created_at">) {
    if (!this.isAvailable()) {
      console.log("Supabase not available, skipping feedback save")
      return null
    }

    const { data, error } = await supabase
      .from("user_feedback")
      .insert([{ ...feedback, created_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Helper methods
  private groupBy(array: any[], key: string) {
    return array.reduce((result, item) => {
      const group = item[key]
      result[group] = (result[group] || 0) + 1
      return result
    }, {})
  }

  private calculateAverage(array: any[], key: string) {
    if (array.length === 0) return 0
    const sum = array.reduce((total, item) => total + (item[key] || 0), 0)
    return sum / array.length
  }
}

export const db = new SupabaseService()
