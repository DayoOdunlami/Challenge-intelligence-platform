"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TechnologyCardProps {
  title: string
  description: string
  category: string
  status: string
  image: string
  demoUrl: string
}

export function TechnologyCard({ title, description, category, status, image, demoUrl }: TechnologyCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pilot":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "development":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group"
    >
      <div
        className="relative h-full overflow-hidden rounded-xl bg-white border border-gray-200 transition-all duration-300 group-hover:border-[#006E51] group-hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>

        <div className="relative h-full flex flex-col">
          <div className="relative overflow-hidden h-48">
            <img
              src={image || "/placeholder.svg?height=300&width=400"}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
            />
            <div className="absolute top-3 right-3">
              <Badge className={`${getStatusColor(status)} border`}>{status}</Badge>
            </div>
          </div>

          <div className="p-6 flex-grow">
            <div className="mb-2">
              <Badge variant="outline" className="text-[#006E51] border-[#006E51]">
                {category}
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#2E2D2B]">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>

            <div className="flex justify-end mt-auto pt-4">
              <Button size="sm" className="bg-[#006E51] hover:bg-[#005A42] text-white border-0" asChild>
                <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
                  Learn More
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
