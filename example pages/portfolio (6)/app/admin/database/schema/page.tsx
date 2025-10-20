"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Copy, Download } from "lucide-react"

export default function SchemaPage() {
  const sqlSchema = `-- Create prompt_configs table
CREATE TABLE prompt_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_prompt TEXT NOT NULL,
  welcome_message TEXT NOT NULL,
  user_profiling BOOLEAN DEFAULT true,
  contextual_responses BOOLEAN DEFAULT true,
  feedback_encouragement BOOLEAN DEFAULT true,
  model VARCHAR(50) DEFAULT 'gpt-4o',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
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
CREATE TABLE user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ab_tests table
CREATE TABLE ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed')),
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ab_test_results table
CREATE TABLE ab_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES ab_tests(id),
  variant VARCHAR(10) NOT NULL CHECK (variant IN ('A', 'B')),
  session_id VARCHAR(255) NOT NULL,
  converted BOOLEAN DEFAULT false,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_started_at ON conversations(started_at);
CREATE INDEX idx_conversations_user_type ON conversations(user_type);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_prompt_configs_active ON prompt_configs(is_active);
CREATE INDEX idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX idx_ab_test_results_test_id ON ab_test_results(test_id);

-- Insert default prompt configuration
INSERT INTO prompt_configs (
  system_prompt,
  welcome_message,
  is_active
) VALUES (
  'You are the Station Innovation Zone (SIZ) Assistant, a helpful and engaging prototype chatbot designed to support a wide range of users interacting with the UK''s Station Innovation Zone platform.

Your goal is to identify the user type early in the conversation (e.g. startup/SME, station manager, member of the public, transport planner, tech provider, investor, or policymaker) and respond accordingly with tone, language, and suggestions tailored to their needs.

You can draw on the Station Innovation Zone''s key themes:

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
• Kindly state that you''re a prototype assistant still learning
• Offer to log feedback or suggest where the user might go instead

Always keep a tone that is:
• Curious, encouraging, concise
• Helpful to both newcomers and experts
• Open to feedback ("Let me know if this helped or if you''d like more detail.")

Begin by gently asking something like:
"Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I''ll do my best to guide you based on your interests."',
  'Hello! I''m your Station Innovation Zone assistant. Before we dive in, may I ask—are you a business, transport professional, station manager, investor, or someone just exploring? I''ll do my best to guide you based on your interests.',
  true
);`

  return (
    <div className="container py-12 max-w-6xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database Schema</h1>
            <p className="text-gray-600">SQL script to initialize your Supabase database</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/database">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(sqlSchema)
                alert("SQL schema copied to clipboard!")
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy SQL
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([sqlSchema], { type: "text/plain" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "supabase_schema.sql"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download SQL
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-auto">
          <pre className="text-sm whitespace-pre-wrap">{sqlSchema}</pre>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">How to use this SQL script:</h3>
          <ol className="space-y-2 text-sm text-blue-700">
            <li>
              1. Go to your Supabase project dashboard at{" "}
              <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">
                app.supabase.com
              </a>
            </li>
            <li>2. Click on "SQL Editor" in the left sidebar</li>
            <li>3. Create a "New Query"</li>
            <li>4. Paste the entire SQL script above</li>
            <li>5. Click "Run" to execute the script</li>
            <li>6. Verify the tables were created by checking the "Table Editor" section in the Supabase dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
