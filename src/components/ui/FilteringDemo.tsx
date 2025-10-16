'use client'

import { useState, useEffect } from 'react'

const demoSteps = [
  { filter: 'All Sectors', count: 150, color: '#6b7280' },
  { filter: 'Rail', count: 45, color: '#3b82f6' },
  { filter: 'Energy', count: 32, color: '#22c55e' },
  { filter: 'Transport', count: 28, color: '#f59e0b' },
  { filter: 'Cross-Sector', count: 89, color: '#a855f7' }
]

export default function FilteringDemo() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const current = demoSteps[currentStep]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Filtering</h3>
        <p className="text-sm text-gray-600">Watch challenges filter in real-time</p>
      </div>
      
      {/* Filter Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Filter:</span>
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium text-white transition-all duration-500"
            style={{ backgroundColor: current.color }}
          >
            {current.filter}
          </span>
        </div>
        
        {/* Animated Count */}
        <div className="text-center">
          <div 
            className="text-4xl font-bold transition-all duration-500"
            style={{ color: current.color }}
          >
            {current.count}
          </div>
          <div className="text-sm text-gray-500">Matching Challenges</div>
        </div>
      </div>
      
      {/* Visual Representation */}
      <div className="space-y-2">
        {demoSteps.map((step, index) => (
          <div key={step.filter} className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentStep ? 'scale-125' : 'scale-100 opacity-50'
              }`}
              style={{ backgroundColor: step.color }}
            />
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 ease-out"
                style={{ 
                  width: index === currentStep ? `${(step.count / 150) * 100}%` : '0%',
                  backgroundColor: step.color 
                }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">
              {index === currentStep ? step.count : ''}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-4 flex justify-center space-x-1">
        {demoSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}