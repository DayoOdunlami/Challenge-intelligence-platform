"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, BarChart3, Users, FileText, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Innovation Atlas homepage"
  },
  {
    name: "Explore Data",
    href: "/visualizations",
    icon: BarChart3,
    description: "Interactive data visualizations"
  },
  {
    name: "For Reviewers",
    href: "/for-reviewers",
    icon: FileText,
    description: "Reviewer resources and tools"
  },
  {
    name: "Profiles",
    href: "/profile/sme-profile",
    icon: Users,
    description: "User profiles and examples"
  }
]

export function TopNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#CCE2DC]/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#006E51] to-[#50C878] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-[#006E51] text-lg">Innovation Atlas</div>
              <div className="text-xs text-gray-600 -mt-1">Cross-sector intelligence platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      active 
                        ? 'bg-[#006E51] text-white' 
                        : 'text-gray-700 hover:bg-[#CCE2DC]/30 hover:text-[#006E51]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                    
                    {active && (
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-[#CCE2DC]"
                        layoutId="activeNavBorder"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              asChild
              className="bg-[#006E51] hover:bg-[#005A42] text-white"
            >
              <Link href="/visualizations">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-[#CCE2DC]/30"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-[#CCE2DC]/30"
          >
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active 
                        ? 'bg-[#006E51] text-white' 
                        : 'text-gray-700 hover:bg-[#CCE2DC]/30'
                    }`}>
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-sm ${active ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
              
              <div className="pt-4 border-t border-[#CCE2DC]/30">
                <Button 
                  asChild
                  className="w-full bg-[#006E51] hover:bg-[#005A42] text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/visualizations">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}