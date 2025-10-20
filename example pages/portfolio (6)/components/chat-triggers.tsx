"use client"

import { MessageCircle } from 'lucide-react'
import { AIChatPopup } from "./ai-chat-popup"
import { Button } from "@/components/ui/button"

export function ChatTriggers() {
  return (
    <div className="space-y-4">
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <AIChatPopup mode="floating" />
      </div>

      {/* Panel Chat Trigger (can be placed anywhere) */}
      <AIChatPopup 
        mode="panel"
        triggerElement={
          <Button className="bg-[#006E51] hover:bg-[#005A42] text-white">
            <MessageCircle className="mr-2 h-4 w-4" />
            Ask the AI Assistant
          </Button>
        }
      />

      {/* Chatbot Image Trigger */}
      <AIChatPopup 
        mode="floating"
        triggerElement={
          <div className="relative group cursor-pointer">
            <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center transition-all duration-500">
              {/* Your existing chatbot illustration */}
              <div className="relative transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 transform-gpu">
                {/* Chatbot illustration code here */}
                <div className="w-32 h-32 bg-[#006E51] rounded-full flex items-center justify-center">
                  <MessageCircle className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
