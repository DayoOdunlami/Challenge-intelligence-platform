"use client"

import { motion } from "framer-motion"

interface ReviewerSectionHeadingProps {
  title: string
  subtitle: string
  badge?: string
}

export function ReviewerSectionHeading({ title, subtitle, badge }: ReviewerSectionHeadingProps) {
  return (
    <div className="text-center space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="inline-block">
          <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
            <span className="relative z-10 text-[#006E51]">{subtitle}</span>
            {badge && (
              <motion.span 
                className="ml-2 px-2 py-0.5 bg-[#006E51] text-white text-xs rounded-full"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {badge}
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl font-bold text-[#2E2D2B]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        viewport={{ once: true }}
      />
    </div>
  )
}