'use client'

import { useState } from 'react'

export type SortOption = 'alphabetical' | 'count' | 'funding' | 'cross-sector'

interface HeatmapControlsProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function HeatmapControls({ sortBy, onSortChange }: HeatmapControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sortOptions = [
    { value: 'alphabetical' as SortOption, label: 'A-Z', icon: '🔤' },
    { value: 'count' as SortOption, label: 'Challenge Count', icon: '📊' },
    { value: 'funding' as SortOption, label: 'Total Funding', icon: '💰' },
    { value: 'cross-sector' as SortOption, label: 'Cross-Sector', icon: '🔗' }
  ]

  const currentOption = sortOptions.find(opt => opt.value === sortBy)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm"
      >
        <span>{currentOption?.icon}</span>
        <span className="font-medium">Sort: {currentOption?.label}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                {sortBy === option.value && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}