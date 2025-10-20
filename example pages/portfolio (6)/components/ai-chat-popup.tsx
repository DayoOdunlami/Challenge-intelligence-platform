"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User, Lightbulb, AlertCircle, ExternalLink } from "lucide-react"
import { useChat } from "ai/react"
import { nanoid } from "nanoid"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AIChatPopupProps {
  triggerElement?: React.ReactNode
  defaultOpen?: boolean
  mode?: "floating" | "panel"
}

export function AIChatPopup({ triggerElement, defaultOpen = false, mode = "floating" }: AIChatPopupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize session ID from localStorage or create a new one
  useEffect(() => {
    const storedSessionId = localStorage.getItem("chat_session_id")
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      const newSessionId = nanoid()
      localStorage.setItem("chat_session_id", newSessionId)
      setSessionId(newSessionId)
    }
  }, [])

  // Listen for toggle event from floating button
  useEffect(() => {
    const handleToggleChat = () => {
      setIsOpen(true)
    }

    window.addEventListener("toggle-ai-chat", handleToggleChat)

    return () => {
      window.removeEventListener("toggle-ai-chat", handleToggleChat)
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      sessionId,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your Station Innovation Zone assistant. I have comprehensive knowledge about setting up and running Station Innovation Zones based on the Bristol Temple Meads experience.\n\nI can help you with:\n• Understanding the fundamentals of Station Innovation Zones\n• Setting up steering groups and governance\n• Developing innovation challenges\n• Managing stakeholder relationships\n• Navigating regulatory requirements\n• Learning from real-world implementation experiences\n\nWhat would you like to know about Station Innovation Zones?",
      },
    ],
    onResponse: (response) => {
      // Clear any previous errors on successful response
      setError(null)

      // Extract session ID from response headers if available
      const responseSessionId = response.headers.get("X-Session-Id")
      if (responseSessionId && responseSessionId !== sessionId) {
        localStorage.setItem("chat_session_id", responseSessionId)
        setSessionId(responseSessionId)
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setError("I'm having trouble connecting right now. Please try again in a moment.")
    },
    onFinish: (message) => {
      // Clear error on successful completion
      setError(null)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, error])

  const handleClose = () => {
    setIsOpen(false)

    // If conversation had meaningful interaction and feedback wasn't given, ask for it
    if (messages.length > 3 && !feedbackGiven) {
      promptForFeedback()
    }
  }

  const promptForFeedback = () => {
    // In a real implementation, you would show a feedback dialog
    // For now, we'll just log that we should ask for feedback
    console.log("Should prompt for feedback")
  }

  const submitFeedback = async (rating: number, comment?: string) => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          rating,
          comment,
        }),
      })
      setFeedbackGiven(true)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      setError(null) // Clear any previous errors
      handleSubmit(e)
    }
  }

  const retryLastMessage = () => {
    setError(null)
    // Retry the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    if (lastUserMessage) {
      // Create a synthetic event to retry
      const syntheticEvent = {
        target: { value: lastUserMessage.content },
      } as any
      handleInputChange(syntheticEvent)

      setTimeout(() => {
        const form = document.querySelector("form")
        if (form) {
          const submitEvent = new Event("submit", { cancelable: true })
          form.dispatchEvent(submitEvent)
        }
      }, 100)
    }
  }

  // Suggested questions for quick start
  const suggestedQuestions = [
    "How do I set up a steering group for a Station Innovation Zone?",
    "What are the key challenges in implementing station innovations?",
    "How do I manage data access and security requirements?",
    "What budget should I plan for a Station Innovation Zone?",
    "How do I communicate with station users about trials?",
  ]

  const handleSuggestedQuestion = (question: string) => {
    setError(null) // Clear any errors

    // Set the input value to the suggested question
    const syntheticEvent = {
      target: { value: question },
    } as any
    handleInputChange(syntheticEvent)

    // Submit the form after a short delay to ensure the input is updated
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        const submitEvent = new Event("submit", { cancelable: true })
        form.dispatchEvent(submitEvent)
      }
    }, 100)
  }

  // Panel mode animations
  const panelVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  }

  const TriggerButton = triggerElement || (
    <Button
      onClick={() => {
        setIsOpen(true)
      }}
      className="bg-[#006E51] hover:bg-[#005A42] text-white rounded-full p-3 shadow-lg"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )

  return (
    <>
      {/* Trigger Element */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {TriggerButton}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for panel mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleClose}
            />

            {/* Chat Container */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed z-50 bg-white border border-gray-200 shadow-2xl ${
                mode === "floating"
                  ? "top-0 right-0 h-full w-full max-w-lg"
                  : "bottom-4 right-4 h-[600px] w-[512px] rounded-lg"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between p-4 border-b border-gray-200 bg-[#006E51] text-white ${
                  mode === "panel" ? "rounded-t-lg" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Station Innovation Assistant</h3>
                    <p className="text-xs text-white/80">Expert knowledge from Bristol Temple Meads</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Open chat in new window with proper dimensions and features
                      const width = 500
                      const height = 700
                      const left = window.screen.width / 2 - width / 2
                      const top = window.screen.height / 2 - height / 2

                      const chatWindow = window.open(
                        "/chat",
                        "StationInnovationChat",
                        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no`,
                      )

                      if (chatWindow) {
                        chatWindow.focus()

                        // Pass session data if needed
                        chatWindow.sessionId = sessionId
                      }
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8"
                    title="Open in new window"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea
                className={`flex-1 p-4 ${mode === "floating" ? "h-[calc(100vh-140px)]" : "h-[calc(600px-140px)]"}`}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-[#006E51] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user" ? "bg-[#006E51] text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Error Message */}
                  {error && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="max-w-[80%] p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm text-red-700">{error}</p>
                        <Button
                          onClick={retryLastMessage}
                          size="sm"
                          variant="outline"
                          className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Questions (only show when no user messages yet) */}
                  {messages.length === 1 && !error && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Quick start questions:</p>
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="w-full text-left p-2 text-sm bg-[#CCE2DC]/30 hover:bg-[#CCE2DC]/50 rounded-lg transition-colors border border-[#006E51]/20"
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-[#006E51] mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{question}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isLoading && !error && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-[#006E51] flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className={`p-4 border-t border-gray-200 ${mode === "panel" ? "rounded-b-lg" : ""}`}>
                <form onSubmit={onSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about Station Innovation Zones..."
                    className="flex-1 border-gray-300 focus:border-[#006E51] focus:ring-[#006E51]/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-[#006E51] hover:bg-[#005A42] text-white"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
