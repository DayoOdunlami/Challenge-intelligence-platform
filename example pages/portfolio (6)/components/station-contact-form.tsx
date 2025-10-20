"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function StationContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Message sent!",
      description: "Thanks for your interest. We'll get back to you soon.",
    })

    setIsSubmitting(false)
    e.currentTarget.reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-[#006E51] hover:shadow-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

        <div className="relative">
          <h3 className="text-2xl font-bold mb-6 text-[#2E2D2B]">Get Involved</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="Your Name"
                required
                className="bg-white border-gray-300 focus:border-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Your Email"
                required
                className="bg-white border-gray-300 focus:border-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Organization"
                className="bg-white border-gray-300 focus:border-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Tell us about your innovation or how you'd like to get involved"
                rows={5}
                required
                className="bg-white border-gray-300 focus:border-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#006E51] hover:bg-[#005A42] text-white border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  Send Message <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
