"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronRight, AlertTriangle, Shield, Target } from "lucide-react"

interface RiskAssessmentCardProps {
  id: number
  risk: string
  description: string
  impact: string
  probability: string
  redTeamQuote: string
  ourMitigation: string[]
  phase1Test: string
  mitigationEvidence?: string
}

export function RiskAssessmentCard({ 
  id, 
  risk, 
  description, 
  impact, 
  probability, 
  redTeamQuote, 
  ourMitigation, 
  phase1Test, 
  mitigationEvidence 
}: RiskAssessmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'border-red-500 bg-red-50'
      case 'High': return 'border-orange-500 bg-orange-50'
      case 'Medium-High': return 'border-yellow-500 bg-yellow-50'
      case 'Medium': return 'border-yellow-400 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-600 text-white'
      case 'Medium-High': return 'bg-yellow-600 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getProbabilityBadgeColor = (probability: string) => {
    switch (probability) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <div className={`border-l-4 rounded-lg transition-all duration-300 ${getRiskColor(impact)}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 text-left hover:bg-white/50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <h3 className="text-lg font-bold text-[#2E2D2B]">{risk}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getImpactBadgeColor(impact)}`}>
                {impact}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProbabilityBadgeColor(probability)}`}>
                {probability} Probability
              </span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <p className="text-gray-700 mt-2">{description}</p>
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6 space-y-6 bg-white/70"
          >
            {/* Red Team Quote */}
            <blockquote className="border-l-4 border-yellow-400 pl-4 py-2 bg-yellow-50 italic text-gray-700">
              <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-600" />
              "{redTeamQuote}"
            </blockquote>

            {/* Our Mitigation */}
            <div>
              <h4 className="font-bold text-[#2E2D2B] mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-[#006E51]" />
                Our Mitigation Strategy
              </h4>
              <ul className="space-y-2">
                {ourMitigation.map((mitigation, idx) => (
                  <li key={idx} className="flex items-start text-gray-700">
                    <div className="w-2 h-2 bg-[#006E51] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    {mitigation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Phase 1 Test */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Phase 1 Test
              </h4>
              <p className="text-blue-800 text-sm">{phase1Test}</p>
            </div>

            {/* Evidence */}
            {mitigationEvidence && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Evidence:</strong> {mitigationEvidence}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}