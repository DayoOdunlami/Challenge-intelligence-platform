"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export function StationFloatingNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()

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
    { name: "About", href: "#about" },
    { name: "Technologies", href: "#technologies" },
    { name: "Innovation Stages", href: "#stages" },
    { name: "Journey", href: "#journey" },
    { name: "Contact", href: "#contact" },
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
              <Link href="/" className="font-bold text-lg">
                <span className="text-[#006E51]">Station</span>
                <span className="text-[#2E2D2B]"> Innovation Zone</span>
              </Link>
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
              <Link href="/" className="font-bold text-lg mr-4">
                <span className="text-[#006E51]">Station</span>
                <span className="text-[#2E2D2B]"> Innovation Zone</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-[#006E51] transition-colors"
                  onClick={handleNavClick}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/admin"
                className="px-2 py-1 text-gray-600 hover:text-[#006E51] transition-colors"
                title="Admin Panel"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Button size="sm" className="ml-2 bg-[#006E51] hover:bg-[#005A42] text-white border-0">
                Get Started
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
              <Link
                key={item.name}
                href={item.href}
                className="px-8 py-4 text-2xl font-medium text-white hover:text-[#CCE2DC] transition-colors"
                onClick={handleNavClick}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/admin"
              className="px-8 py-4 text-2xl font-medium text-white hover:text-[#CCE2DC] transition-colors flex items-center gap-3"
              onClick={handleNavClick}
            >
              <Settings className="h-6 w-6" />
              Admin Panel
            </Link>
            <Button className="mt-6 bg-[#006E51] hover:bg-[#005A42] text-white border-0">Get Started</Button>
          </div>
        </motion.div>
      )}
    </>
  )
}
