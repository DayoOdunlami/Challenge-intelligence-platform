"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Database, CheckCircle, AlertCircle } from "lucide-react"

export default function SetupDatabasePage() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Station Innovation Zone Database Schema
-- Run this in your Supabase SQL Editor

-- Create prompt_configs table
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
);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE prompt_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on prompt_configs" ON prompt_configs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on conversations" ON conversations FOR UPDATE USING (true);
CREATE POLICY "Allow public insert access on user_feedback" ON user_feedback FOR INSERT WITH CHECK (true);`

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
          <p className="text-gray-600">
            Follow these steps to set up your Supabase database for the Station Innovation Zone project.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Step 1: Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">
                  1
                </span>
                Set Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Add these environment variables to your Vercel project:</p>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-700">
                    Replace with your actual Supabase project URL and anon key
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: SQL Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">
                  2
                </span>
                Run SQL Migration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Copy this SQL script and run it in your Supabase SQL Editor:</p>

                <div className="flex justify-between items-center">
                  <Badge variant="outline">SQL Migration Script</Badge>
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied!" : "Copy SQL"}
                  </Button>
                </div>

                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">{sqlScript}</pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">How to run this script:</h4>
                  <ol className="space-y-1 text-sm text-blue-700">
                    <li>1. Go to your Supabase project dashboard</li>
                    <li>2. Click on "SQL Editor" in the left sidebar</li>
                    <li>3. Click "New Query"</li>
                    <li>4. Paste the SQL script above</li>
                    <li>5. Click "Run" to execute</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Verify Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">
                  3
                </span>
                Verify Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">After running the SQL script, verify your setup:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" asChild>
                    <a href="/supabase-status" target="_blank" rel="noreferrer">
                      <Database className="mr-2 h-4 w-4" />
                      Check Connection Status
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/admin" target="_blank" rel="noreferrer">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Test Admin Panel
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Common Issues:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>
                      • Make sure environment variables are set in all environments (Production, Preview, Development)
                    </li>
                    <li>• Verify the Supabase URL doesn't have trailing slashes</li>
                    <li>• Use the "anon" key, not the "service_role" key for the ANON_KEY</li>
                    <li>• Redeploy your Vercel project after adding environment variables</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
