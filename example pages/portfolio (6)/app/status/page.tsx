import { EnvChecker } from "@/components/env-checker"
import { Button } from "@/components/ui/button"
import { AIChatPopup } from "@/components/ai-chat-popup"
import Link from "next/link"

export default function StatusPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Station Innovation Zone AI Status</h1>
          <p className="text-gray-600">Check your AI configuration and test the chat functionality</p>
        </div>

        <EnvChecker />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Test AI Chat</h2>
            <p className="text-gray-600 mb-4">
              Try out the AI chat to verify it's working correctly with your OpenAI API key.
            </p>
            <AIChatPopup
              triggerElement={<Button className="bg-[#006E51] hover:bg-[#005A42] text-white">Open AI Chat</Button>}
              defaultOpen={false}
            />
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Advanced Features</h2>
            <p className="text-gray-600 mb-4">
              Explore advanced AI features like vision analysis, function calling, and more.
            </p>
            <Button asChild>
              <Link href="/test">View Advanced Features</Link>
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-800 mb-2">Next Steps</h2>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>
                Visit the <strong>/status</strong> page anytime to check your API configuration
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Test the AI chat to ensure it's responding correctly</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>
                Explore advanced features on the <strong>/test</strong> page
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Integrate the AI chat component into your main application pages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
