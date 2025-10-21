'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavigationItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/visualizations', label: 'Visualizations', icon: '📊', badge: 'NEW' },
  { href: '/for-reviewers', label: 'For Reviewers', icon: '📋', badge: 'V1' },
  { href: '/for-reviewers-v2', label: 'For Reviewers V2', icon: '✨', badge: 'NEW' },
  { href: '/pitch', label: 'Pitch Deck', icon: '🎤' },
  { href: '/profile/buyer-example', label: 'Buyer Profile', icon: '🏢' },
  { href: '/profile/sme-profile', label: 'SME Profile', icon: '🚀' },
  { href: '/test-network', label: 'Network Graph', icon: '🕸️' },
  { href: '/test-heatmap', label: 'Heatmap', icon: '🗺️' },
  { href: '/test-chord', label: 'Chord Diagram', icon: '🎯' },
  { href: '/test-sunburst', label: 'Sunburst Chart', icon: '☀️' },
  { href: '/test-sankey', label: 'Sankey Flow', icon: '🌊' },
]

export default function QuickNavSidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  return (
    <div 
      className="fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger area - always visible */}
      <div className="relative">
        <div className="w-3 h-24 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-lg opacity-50 hover:opacity-80 transition-opacity cursor-pointer shadow-md" />
        {/* Small arrow hint */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1 text-white text-xs opacity-70">
          ▶
        </div>
      </div>
      
      {/* Navigation panel - slides out on hover */}
      <div 
        className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-r-xl shadow-xl transition-all duration-300 ease-in-out ${
          isHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{ minWidth: '200px' }}
      >
        <div className="p-4">
          <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Quick Navigation
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 bg-cpc-green-600 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Subtle branding */}
        <div className="border-t border-gray-100 px-4 py-2">
          <div className="text-xs text-gray-400 text-center">
            Innovation Atlas Platform
          </div>
        </div>
      </div>
    </div>
  )
}