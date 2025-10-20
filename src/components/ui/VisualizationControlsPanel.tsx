'use client';

import React, { useState } from 'react';

interface VisualizationControlsPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function VisualizationControlsPanel({
  title,
  children,
  className = ''
}: VisualizationControlsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Toggle Button - positioned to avoid nav overlap */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed top-20 z-50 bg-blue-600 border border-blue-700 rounded-r-lg shadow-lg p-3 transition-all duration-300 hover:bg-blue-700 text-white ${
          isExpanded ? 'left-80' : 'left-0'
        }`}
        title={isExpanded ? 'Hide Controls' : 'Show Controls'}
      >
        <svg 
          className={`w-5 h-5 text-white transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {!isExpanded && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Controls
          </div>
        )}
      </button>

      {/* Sliding Controls Panel - starts below nav */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300 ${
        isExpanded ? 'translate-x-0' : '-translate-x-full'
      } ${className}`}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Light backdrop - doesn't block interaction */}
      {isExpanded && (
        <div 
          className="fixed top-16 left-80 right-0 bottom-0 bg-black bg-opacity-5 z-30 pointer-events-none"
        />
      )}
    </>
  );
}

export default VisualizationControlsPanel;