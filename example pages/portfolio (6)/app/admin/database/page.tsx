import { SupabaseChecker } from "@/components/supabase-checker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Code, Table } from "lucide-react"

export default function DatabasePage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database Configuration</h1>
            <p className="text-gray-600">Set up and manage your Supabase database connection</p>
          </div>
          <Button asChild>
            <Link href="/admin">
              Back to Admin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <SupabaseChecker />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Create a Supabase Project</h3>
                <p className="text-sm text-gray-600">
                  Go to{" "}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                    supabase.com
                  </a>{" "}
                  and create a new project.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">2. Get Your API Keys</h3>
                <p className="text-sm text-gray-600">
                  In your Supabase dashboard, go to Project Settings → API and copy the URL and anon key.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">3. Add Environment Variables</h3>
                <p className="text-sm text-gray-600">Add these to your .env.local file:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=your-project-url
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">4. Run Database Migrations</h3>
                <p className="text-sm text-gray-600">
                  Run the SQL script in the Supabase SQL Editor to create your tables.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/admin/database/schema" className="w-full">
                    <Code className="mr-2 h-4 w-4" />
                    View Schema SQL
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Database Tables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">prompt_configs</h3>
                <p className="text-sm text-gray-600">Stores chatbot prompt configurations</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">conversations</h3>
                <p className="text-sm text-gray-600">Stores user chat conversations</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">user_feedback</h3>
                <p className="text-sm text-gray-600">Stores user ratings and comments</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">ab_tests</h3>
                <p className="text-sm text-gray-600">Stores A/B test configurations</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">ab_test_results</h3>
                <p className="text-sm text-gray-600">Stores A/B test performance data</p>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can view and manage your data directly in the Supabase dashboard after
                  setup.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
