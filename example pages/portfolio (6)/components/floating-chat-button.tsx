"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle } from "lucide-react"

export function FloatingChatButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the floating button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51] to-[#4CAF50] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>

            {/* Main button */}
            <div
              className="relative bg-[#006E51] hover:bg-[#005A42] text-white rounded-full p-4 shadow-lg transition-all duration-300 group-hover:scale-110 cursor-pointer"
              onClick={() => {
                // Dispatch custom event to open the main chat panel
                window.dispatchEvent(new CustomEvent("toggle-ai-chat"))
              }}
            >
              <MessageCircle className="h-6 w-6" />

              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-[#006E51] animate-ping opacity-20 pointer-events-none"></div>

              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4CAF50] rounded-full border-2 border-white animate-pulse pointer-events-none"></div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
              Ask the AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
