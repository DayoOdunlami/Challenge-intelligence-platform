"use client"

import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

const journeySteps = [
  {
    year: "2024",
    title: "Making greener, safer, more accessible stations",
    description:
      "Expanding the innovation zone to focus on sustainability, safety improvements, and accessibility enhancements across station environments.",
  },
  {
    year: "2023",
    title: "Running & Evaluating the First Trials",
    description:
      "Successfully launched pilot programs and conducted comprehensive evaluations of initial technology implementations in live station environments.",
  },
  {
    year: "2022",
    title: "Building the Foundations of the Innovation Zone",
    description:
      "Established the core infrastructure, partnerships, and frameworks necessary to support station-based innovation testing and development.",
  },
]

export function StationTimeline() {
  const isMobile = useMobile()

  return (
    <div
      className={`space-y-12 relative ${
        !isMobile
          ? "before:absolute before:inset-0 before:left-1/2 before:ml-0 before:-translate-x-px before:border-l-2 before:border-[#CCE2DC] before:h-full before:z-0"
          : ""
      }`}
    >
      {journeySteps.map((step, index) => (
        <div
          key={index}
          className={`relative z-10 flex items-center ${index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}
        >
          <motion.div
            className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-10" : "md:pr-10"}`}
            initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-[#006E51] hover:shadow-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

              <div className="relative">
                <div className="text-3xl font-bold text-[#006E51] mb-2">{step.year}</div>
                <h3 className="text-xl font-bold text-[#2E2D2B] mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          </motion.div>

          {!isMobile && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <motion.div
                className="w-6 h-6 rounded-full bg-[#006E51] z-10 flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </motion.div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
