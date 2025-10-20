import { APIKeyTester } from "@/components/api-key-tester"

export default function TestPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">OpenAI API Testing</h1>
          <p className="text-gray-600">Test your OpenAI API key and check available features</p>
        </div>

        <APIKeyTester />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Getting Started with OpenAI</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>1. Free Tier:</strong> $5 in free credits for new accounts (expires after 3 months)
            </p>
            <p>
              <strong>2. Pay-as-you-go:</strong> Add payment method for continued usage
            </p>
            <p>
              <strong>3. Rate Limits:</strong> Free tier has lower limits, paid accounts get higher limits
            </p>
            <p>
              <strong>4. Models:</strong> GPT-4o is the latest and most capable model
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">Advanced Features You Can Use</h3>
          <div className="text-sm text-green-800 space-y-2">
            <p>
              <strong>Function Calling:</strong> Let the AI call specific functions in your app
            </p>
            <p>
              <strong>Vision:</strong> Upload images and ask questions about them
            </p>
            <p>
              <strong>JSON Mode:</strong> Get structured responses in JSON format
            </p>
            <p>
              <strong>Streaming:</strong> Get responses token-by-token for better UX
            </p>
            <p>
              <strong>Custom Instructions:</strong> Fine-tune behavior with system prompts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
