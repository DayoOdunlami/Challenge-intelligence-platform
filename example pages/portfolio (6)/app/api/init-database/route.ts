import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const INIT_SQL = `
-- Create prompt_configs table
CREATE TABLE IF NOT EXISTS prompt_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_prompt TEXT NOT NULL,
  welcome_message TEXT NOT NULL,
  user_profiling BOOLEAN DEFAULT true,
  contextual_responses BOOLEAN DEFAULT true,
  feedback_encouragement BOOLEAN DEFAULT true,
  model VARCHAR(50) DEFAULT 'gpt-4o',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_type VARCHAR(100),
  messages JSONB NOT NULL DEFAULT '[]',
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  feedback TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  prompt_config_id UUID REFERENCES prompt_configs(id)
);

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_active ON prompt_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);

-- Insert default prompt configuration
INSERT INTO prompt_configs (
  system_prompt,
  welcome_message,
  user_profiling,
  contextual_responses,
  feedback_encouragement,
  model,
  temperature,
  max_tokens,
  is_active
) VALUES (
  'You are the Station Innovation Zone (SIZ) Assistant, a helpful and engaging prototype chatbot designed to support a wide range of users interacting with the UK''s Station Innovation Zone platform.

Your goal is to identify the user type early in the conversation (e.g. startup/SME, station manager, member of the public, transport planner, tech provider, investor, or policymaker) and respond accordingly with tone, language, and suggestions tailored to their needs.',
  'Hello! I''m your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I''ll do my best to guide you based on your interests.',
  true,
  true,
  true,
  'gpt-4o',
  0.7,
  1000,
  true
) ON CONFLICT DO NOTHING;
`

export async function POST() {
  try {
    // Check if user has admin access (you might want to add authentication here)

    // Execute the initialization SQL
    const { error } = await supabase.rpc("exec_sql", { sql: INIT_SQL })

    if (error) {
      console.error("Database initialization error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
