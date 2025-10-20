"use client"

import { motion } from "framer-motion"
import { CheckCircle, ChevronRight } from "lucide-react"

interface FeedbackResponseCardProps {
  feedback: string
  response: string
  evidence: string
  sectionId: string
  status: "complete" | "in-progress" | "planned"
  category: string
}

export function FeedbackResponseCard({ 
  feedback, 
  response, 
  evidence, 
  sectionId, 
  status, 
  category 
}: FeedbackResponseCardProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 h-full transition-all duration-300 hover:border-[#006E51] hover:shadow-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#006E51] flex-shrink-0" />
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                {status === 'complete' ? 'Addressed' : status === 'in-progress' ? 'In Progress' : 'Planned'}
              </span>
            </div>
            <button
              onClick={() => scrollToSection(sectionId)}
              className="text-xs text-[#006E51] hover:text-[#005A42] flex items-center font-medium transition-colors"
            >
              View Details <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{category}</span>
          </div>

          <h3 className="text-lg font-bold text-[#2E2D2B] mb-3 leading-tight">
            "{feedback}"
          </h3>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {response}
          </p>

          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">EVIDENCE</div>
            <div className="text-xs text-gray-600">{evidence}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}