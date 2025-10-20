"use client"

import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface PlatformComparisonCardProps {
  platform: string
  model: string
  primaryFunction: string
  strengths: string[]
  limitations: string[]
  whatItDoesnt?: string
  whatItDoes?: string
  isOurPlatform?: boolean
}

export function PlatformComparisonCard({ 
  platform, 
  model, 
  primaryFunction, 
  strengths, 
  limitations, 
  whatItDoesnt, 
  whatItDoes, 
  isOurPlatform = false 
}: PlatformComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className={`relative overflow-hidden rounded-xl border p-6 h-full transition-all duration-300 hover:shadow-lg ${
        isOurPlatform 
          ? 'bg-gradient-to-br from-[#006E51]/5 to-[#CCE2DC]/10 border-[#006E51] shadow-md' 
          : 'bg-white border-gray-200 hover:border-[#006E51]'
      }`}>
        <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#2E2D2B] mb-2">
                {platform}
                {isOurPlatform && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#006E51] text-white">
                    Our Approach
                  </span>
                )}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                model === "Transactional" 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-[#006E51] text-white'
              }`}>
                {model}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{primaryFunction}</p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-800 mb-2 flex items-center text-sm">
                <XCircle className="w-4 h-4 mr-1" />
                Key Limitations
              </h4>
              <ul className="space-y-1 mb-3">
                {limitations.map((limitation, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <XCircle className="w-3 h-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-3 rounded-lg text-sm font-medium ${
              isOurPlatform 
                ? 'bg-[#006E51]/10 text-[#006E51] border border-[#006E51]/20' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              {isOurPlatform ? 'What it does: ' : 'What it doesn\'t do: '}
              {whatItDoesnt || whatItDoes}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}