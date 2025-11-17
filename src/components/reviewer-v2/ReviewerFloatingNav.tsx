"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X, Download, ChevronDown, Home, Target, Users, BarChart3, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ReviewerFloatingNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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

  const pageItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "NAVIGATE", href: "/navigate", icon: Network },
    { name: "Visualizations", href: "/visualizations", icon: BarChart3 },
    { name: "Pitch Deck", href: "/pitch", icon: Target },
    { name: "SME Profiles", href: "/profile/sme-profile", icon: Users },
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
              
              {/* Pages Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-[#006E51] transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                >
                  Pages
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    {pageItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-[#006E51] hover:bg-[#CCE2DC]/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </div>

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
            {/* Page Navigation for Mobile */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#CCE2DC] mb-4 text-center">Navigate to</h3>
              {pageItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center px-8 py-3 text-xl font-medium text-white hover:text-[#CCE2DC] transition-colors"
                    onClick={handleNavClick}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Section Navigation for Mobile */}
            <div className="border-t border-gray-600 pt-8">
              <h3 className="text-lg font-semibold text-[#CCE2DC] mb-4 text-center">Sections</h3>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-8 py-3 text-xl font-medium text-white hover:text-[#CCE2DC] transition-colors text-center"
                  onClick={handleNavClick}
                >
                  {item.name}
                </a>
              ))}
            </div>

            <Button className="mt-8 bg-[#006E51] hover:bg-[#005A42] text-white border-0">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </motion.div>
      )}
    </>
  )
}