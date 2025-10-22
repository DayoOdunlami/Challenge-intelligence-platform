"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, BarChart3, Users, FileText, Home, ChevronDown, Archive } from "lucide-react"
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
    href: "/for-reviewers-v2",
    icon: FileText,
    description: "Reviewer resources and tools",
    hasDropdown: true,
    dropdownItems: [
      {
        name: "Current Response",
        href: "/for-reviewers-v2",
        description: "Latest comprehensive response"
      },
      {
        name: "Original Response",
        href: "/for-reviewers",
        description: "Archived initial response",
        isArchived: true
      }
    ]
  },
  {
    name: "Profiles",
    href: "/profile",
    icon: Users,
    description: "User profiles and examples"
  }
]

export function TopNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const isDropdownActive = (item: any) => {
    if (item.hasDropdown && item.dropdownItems) {
      return item.dropdownItems.some((dropdownItem: any) => isActive(dropdownItem.href))
    }
    return isActive(item.href)
  }

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#CCE2DC]/30">
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
              const active = isDropdownActive(item)
              
              if (item.hasDropdown) {
                return (
                  <div key={item.name} className="relative">
                    <motion.button
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        active 
                          ? 'bg-[#006E51] text-white' 
                          : 'text-gray-700 hover:bg-[#CCE2DC]/30 hover:text-[#006E51]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${
                        openDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                      
                      {active && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border-2 border-[#CCE2DC]"
                          layoutId="activeNavBorder"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>

                    {/* Dropdown Menu */}
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        {item.dropdownItems?.map((dropdownItem: any) => (
                          <Link 
                            key={dropdownItem.name} 
                            href={dropdownItem.href}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                              isActive(dropdownItem.href) ? 'bg-[#006E51]/5 border-l-4 border-[#006E51]' : ''
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{dropdownItem.name}</div>
                                  <div className="text-sm text-gray-500">{dropdownItem.description}</div>
                                </div>
                                {dropdownItem.isArchived && (
                                  <Archive className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )
              }
              
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
                const active = isDropdownActive(item)
                
                if (item.hasDropdown) {
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          active 
                            ? 'bg-[#006E51] text-white' 
                            : 'text-gray-700 hover:bg-[#CCE2DC]/30'
                        }`}
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{item.name}</div>
                            <div className={`text-sm ${active ? 'text-white/80' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          openDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {openDropdown === item.name && (
                        <div className="ml-4 space-y-1">
                          {item.dropdownItems?.map((dropdownItem: any) => (
                            <Link 
                              key={dropdownItem.name} 
                              href={dropdownItem.href}
                              onClick={() => {
                                setIsMobileMenuOpen(false)
                                setOpenDropdown(null)
                              }}
                            >
                              <div className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                                isActive(dropdownItem.href) 
                                  ? 'bg-[#006E51]/10 text-[#006E51]' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}>
                                <div>
                                  <div className="font-medium text-sm">{dropdownItem.name}</div>
                                  <div className="text-xs text-gray-500">{dropdownItem.description}</div>
                                </div>
                                {dropdownItem.isArchived && (
                                  <Archive className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                
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