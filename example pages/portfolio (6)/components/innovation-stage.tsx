"use client"

import { motion } from "framer-motion"

interface InnovationStageProps {
  stage: number
  title: string
  description: string
}

export function InnovationStage({ stage, title, description }: InnovationStageProps) {
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
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#006E51] text-white flex items-center justify-center font-bold text-lg mr-4">
              {stage}
            </div>
            <h3 className="text-xl font-bold text-[#2E2D2B]">{title}</h3>
          </div>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
