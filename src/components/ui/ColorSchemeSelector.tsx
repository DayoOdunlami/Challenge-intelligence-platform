'use client'

import { useState, useEffect } from 'react'

const colorSchemes = {
  default: {
    name: 'Default',
    primary: 'blue',
    secondary: 'indigo',
    accent: 'purple',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1', 
      accent: '#8b5cf6',
      background: '#f8fafc'
    }
  },
  cpc: {
    name: 'Connected Places Catapult',
    primary: 'teal',
    secondary: 'mint',
    accent: 'blue',
    colors: {
      primary: '#006E51',      // Deep Teal - Brand identity
      secondary: '#CCE2DC',    // Mint Green - Backgrounds  
      accent: '#4A90E2',       // Slate Blue - Hyperlinks
      background: '#F9F9F9',   // Off-White - Main background
      text: '#2E2D2B',         // Charcoal - Text, icons
      success: '#50C878',      // Fresh Green - Success
      warning: '#F5A623'       // Amber - Notifications
    }
  },
  corporate: {
    name: 'Corporate Blue',
    primary: 'slate',
    secondary: 'blue',
    accent: 'indigo',
    colors: {
      primary: '#475569',
      secondary: '#2563eb',
      accent: '#4f46e5',
      background: '#f1f5f9'
    }
  },
  warm: {
    name: 'Warm Orange',
    primary: 'orange',
    secondary: 'amber',
    accent: 'yellow',
    colors: {
      primary: '#ea580c',
      secondary: '#f59e0b',
      accent: '#eab308',
      background: '#fffbeb'
    }
  }
}

export default function ColorSchemeSelector() {
  const [selectedScheme, setSelectedScheme] = useState<keyof typeof colorSchemes>('default')
  const [isOpen, setIsOpen] = useState(false)

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cpc-color-scheme') as keyof typeof colorSchemes
    if (savedTheme && colorSchemes[savedTheme]) {
      setSelectedScheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Apply CSS custom properties to the document root
    const scheme = colorSchemes[selectedScheme]
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', scheme.colors.primary)
    root.style.setProperty('--color-secondary', scheme.colors.secondary)
    root.style.setProperty('--color-accent', scheme.colors.accent)
    root.style.setProperty('--color-background', scheme.colors.background)
    
    // Update Tailwind classes dynamically by adding data attributes
    root.setAttribute('data-theme', selectedScheme)
  }, [selectedScheme])

  const currentScheme = colorSchemes[selectedScheme]

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Demo indicator */}
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Demo Feature" />
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          title="Change Color Scheme"
        >
          <div className="flex gap-1">
            <div 
              className="w-3 h-3 rounded-full border border-gray-200" 
              style={{ backgroundColor: currentScheme.colors.primary }}
            />
            <div 
              className="w-3 h-3 rounded-full border border-gray-200" 
              style={{ backgroundColor: currentScheme.colors.secondary }}
            />
            <div 
              className="w-3 h-3 rounded-full border border-gray-200" 
              style={{ backgroundColor: currentScheme.colors.accent }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{currentScheme.name}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Color Schemes
              </div>
              <div className="space-y-2">
                {Object.entries(colorSchemes).map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const newScheme = key as keyof typeof colorSchemes
                      setSelectedScheme(newScheme)
                      localStorage.setItem('cpc-color-scheme', newScheme)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedScheme === key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: scheme.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: scheme.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: scheme.colors.accent }}
                      />
                    </div>
                    <span className="font-medium">{scheme.name}</span>
                    {selectedScheme === key && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 px-3 py-2">
              <div className="text-xs text-gray-400 text-center">
                Perfect for demos & presentations
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}