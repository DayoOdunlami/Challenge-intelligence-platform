'use client'

import { useState, useEffect } from 'react'

const visualizations = [
  {
    name: 'Network Graph',
    description: 'Discover connections between challenges and innovations',
    svg: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        {/* Animated connections */}
        <g className="animate-pulse">
          <line x1="40" y1="30" x2="80" y2="50" stroke="#e5e7eb" strokeWidth="1" opacity="0.6" />
          <line x1="80" y1="50" x2="120" y2="30" stroke="#e5e7eb" strokeWidth="1" opacity="0.6" />
          <line x1="120" y1="30" x2="160" y2="70" stroke="#e5e7eb" strokeWidth="1" opacity="0.6" />
          <line x1="40" y1="30" x2="60" y2="90" stroke="#e5e7eb" strokeWidth="1" opacity="0.6" />
        </g>
        {/* Animated nodes */}
        <circle cx="40" cy="30" r="8" fill="url(#nodeGradient)" className="animate-bounce" style={{animationDelay: '0s'}} />
        <circle cx="80" cy="50" r="10" fill="url(#nodeGradient)" className="animate-bounce" style={{animationDelay: '0.2s'}} />
        <circle cx="120" cy="30" r="6" fill="url(#nodeGradient)" className="animate-bounce" style={{animationDelay: '0.4s'}} />
        <circle cx="160" cy="70" r="9" fill="url(#nodeGradient)" className="animate-bounce" style={{animationDelay: '0.6s'}} />
        <circle cx="60" cy="90" r="7" fill="url(#nodeGradient)" className="animate-bounce" style={{animationDelay: '0.8s'}} />
      </svg>
    )
  },
  {
    name: 'Heatmap',
    description: 'Visualize challenge density across sectors',
    svg: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id="heatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Animated heatmap cells */}
        <g className="animate-pulse">
          <rect x="20" y="20" width="25" height="20" fill="#22c55e" opacity="0.8" rx="2" />
          <rect x="50" y="20" width="25" height="20" fill="#f59e0b" opacity="0.6" rx="2" />
          <rect x="80" y="20" width="25" height="20" fill="#ef4444" opacity="0.9" rx="2" />
          <rect x="110" y="20" width="25" height="20" fill="#22c55e" opacity="0.4" rx="2" />
          <rect x="140" y="20" width="25" height="20" fill="#f59e0b" opacity="0.7" rx="2" />
          
          <rect x="20" y="45" width="25" height="20" fill="#f59e0b" opacity="0.5" rx="2" />
          <rect x="50" y="45" width="25" height="20" fill="#ef4444" opacity="0.8" rx="2" />
          <rect x="80" y="45" width="25" height="20" fill="#22c55e" opacity="0.6" rx="2" />
          <rect x="110" y="45" width="25" height="20" fill="#f59e0b" opacity="0.9" rx="2" />
          <rect x="140" y="45" width="25" height="20" fill="#ef4444" opacity="0.4" rx="2" />
          
          <rect x="20" y="70" width="25" height="20" fill="#ef4444" opacity="0.7" rx="2" />
          <rect x="50" y="70" width="25" height="20" fill="#22c55e" opacity="0.8" rx="2" />
          <rect x="80" y="70" width="25" height="20" fill="#f59e0b" opacity="0.5" rx="2" />
          <rect x="110" y="70" width="25" height="20" fill="#ef4444" opacity="0.6" rx="2" />
          <rect x="140" y="70" width="25" height="20" fill="#22c55e" opacity="0.9" rx="2" />
        </g>
      </svg>
    )
  },
  {
    name: 'Sunburst',
    description: 'Explore hierarchical relationships in data',
    svg: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id="sunburstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <g transform="translate(100,60)" className="animate-spin" style={{animationDuration: '20s'}}>
          {/* Outer ring */}
          <path d="M 0,-40 A 40,40 0 0,1 28.28,-28.28 L 21.21,-21.21 A 30,30 0 0,0 0,-30 Z" fill="#a855f7" opacity="0.8" />
          <path d="M 28.28,-28.28 A 40,40 0 0,1 40,0 L 30,0 A 30,30 0 0,0 21.21,-21.21 Z" fill="#7c3aed" opacity="0.8" />
          <path d="M 40,0 A 40,40 0 0,1 28.28,28.28 L 21.21,21.21 A 30,30 0 0,0 30,0 Z" fill="#a855f7" opacity="0.6" />
          <path d="M 28.28,28.28 A 40,40 0 0,1 0,40 L 0,30 A 30,30 0 0,0 21.21,21.21 Z" fill="#7c3aed" opacity="0.6" />
          <path d="M 0,40 A 40,40 0 0,1 -28.28,28.28 L -21.21,21.21 A 30,30 0 0,0 0,30 Z" fill="#a855f7" opacity="0.9" />
          <path d="M -28.28,28.28 A 40,40 0 0,1 -40,0 L -30,0 A 30,30 0 0,0 -21.21,21.21 Z" fill="#7c3aed" opacity="0.9" />
          <path d="M -40,0 A 40,40 0 0,1 -28.28,-28.28 L -21.21,-21.21 A 30,30 0 0,0 -30,0 Z" fill="#a855f7" opacity="0.7" />
          <path d="M -28.28,-28.28 A 40,40 0 0,1 0,-40 L 0,-30 A 30,30 0 0,0 -21.21,-21.21 Z" fill="#7c3aed" opacity="0.7" />
          
          {/* Inner ring */}
          <circle cx="0" cy="0" r="20" fill="url(#sunburstGradient)" opacity="0.5" />
        </g>
      </svg>
    )
  },
  {
    name: 'Sankey Flow',
    description: 'Track challenge flows between sectors',
    svg: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {/* Animated flow paths */}
        <g className="animate-pulse">
          <path d="M 20,30 Q 100,20 180,40" stroke="url(#flowGradient)" strokeWidth="8" fill="none" opacity="0.7" />
          <path d="M 20,50 Q 100,45 180,60" stroke="url(#flowGradient)" strokeWidth="12" fill="none" opacity="0.8" />
          <path d="M 20,70 Q 100,80 180,80" stroke="url(#flowGradient)" strokeWidth="6" fill="none" opacity="0.6" />
        </g>
        {/* Source and target nodes */}
        <rect x="15" y="25" width="10" height="50" fill="#0891b2" rx="2" />
        <rect x="175" y="35" width="10" height="50" fill="#0891b2" rx="2" />
      </svg>
    )
  }
]

export default function VisualizationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visualizations.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-md mx-auto h-64 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Visualization Display */}
      <div className="relative h-full">
        {visualizations.map((viz, index) => (
          <div
            key={viz.name}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 transform translate-x-0' 
                : index < currentIndex 
                  ? 'opacity-0 transform -translate-x-full'
                  : 'opacity-0 transform translate-x-full'
            }`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-48 h-24">
                  {viz.svg}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{viz.name}</h3>
                <p className="text-sm text-gray-600">{viz.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {visualizations.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Auto-progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-4000 ease-linear"
           style={{ width: `${((currentIndex + 1) / visualizations.length) * 100}%` }} />
    </div>
  )
}