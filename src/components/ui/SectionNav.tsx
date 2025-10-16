'use client'

import { useState, useEffect } from 'react'

const sections = [
  { id: 'hero', label: 'Problem' },
  { id: 'stress-test', label: 'Data' },
  { id: 'solution', label: 'Solution' },
  { id: 'prototype', label: 'Demo' },
  { id: 'impact', label: 'Impact' },
  { id: 'engage', label: 'Engage' },
  { id: 'cta', label: 'Join' }
]

export default function SectionNav() {
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-white rounded-full shadow-lg p-2">
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`block w-3 h-3 rounded-full transition-all ${
                activeSection === section.id 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={section.label}
            />
          ))}
        </div>
      </div>
    </div>
  )
}