"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReviewerFloatingNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Overview", href: "#hero" },
    { name: "Platform Analysis", href: "#platform-comparison" },
    { name: "Risk Assessment", href: "#risk-mitigation" },
    { name: "Why CPC", href: "#why-cpc" },
    { name: "Phase 1 Plan", href: "#phase-1-feasibility" },
    { name: "Vision", href: "#audio-explainer" },
  ]

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <motion.div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative px-4 py-3 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#006E51]/20 to-[#CCE2DC]/20 rounded-full blur opacity-50"></div>

          {isMobile ? (
            <div className="relative flex items-center justify-between">
              <span className="font-bold text-lg">
                <span className="text-[#006E51]">Reviewer</span>
                <span className="text-[#2E2D2B]"> Response</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-[#006E51] hover:bg-[#CCE2DC]/50"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            <div className="relative flex items-center gap-1">
              <span className="font-bold text-lg mr-4">
                <span className="text-[#006E51]">Reviewer</span>
                <span className="text-[#2E2D2B]"> Response</span>
              </span>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-[#006E51] transition-colors"
                  onClick={handleNavClick}
                >
                  {item.name}
                </a>
              ))}
              <Button size="sm" className="ml-2 bg-[#006E51] hover:bg-[#005A42] text-white border-0">
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile menu */}
      {isMobile && (
        <motion.div
          className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-md ${isOpen ? "block" : "hidden"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-8 py-4 text-2xl font-medium text-white hover:text-[#CCE2DC] transition-colors"
                onClick={handleNavClick}
              >
                {item.name}
              </a>
            ))}
            <Button className="mt-6 bg-[#006E51] hover:bg-[#005A42] text-white border-0">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </motion.div>
      )}
    </>
  )
}