import { SupabaseChecker } from "@/components/supabase-checker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, AlertCircle } from "lucide-react"

export default function SupabaseStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Connection Status</h1>
          <p className="text-gray-600">
            Check your Supabase integration status and verify that all components are working correctly.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Main Connection Status */}
          <SupabaseChecker />

          {/* Environment Variables Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Required Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Supabase Variables:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>
                      • <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL
                    </li>
                    <li>
                      • <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Other Required Variables:</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>
                      • <code>NEXT_PUBLIC_APP_URL</code> - Your application URL
                    </li>
                    <li>
                      • <code>ADMIN_PASSWORD</code> - Admin panel password
                    </li>
                    <li>
                      • <code>JWT_SECRET</code> - JWT signing secret
                    </li>
                    <li>
                      • <code>OPENAI_API_KEY</code> - OpenAI API key
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Get Supabase Credentials</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to your Supabase project dashboard and find these values:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Project URL: Found in Settings → API</li>
                    <li>• Anon Key: Found in Settings → API</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Add Environment Variables</h4>
                  <p className="text-sm text-gray-600 mb-2">Add these to your Vercel project environment variables:</p>
                  <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Initialize Database</h4>
                  <p className="text-sm text-gray-600">
                    Run the SQL migration script in your Supabase SQL editor to create the required tables.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
