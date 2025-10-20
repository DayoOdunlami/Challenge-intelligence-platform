"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ColorPaletteComparison() {
  const [showCPCColors, setShowCPCColors] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Color Palette</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCPCColors(!showCPCColors)}
            className="text-xs"
          >
            {showCPCColors ? 'Show Original' : 'Show CPC Colors'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2">
            {showCPCColors ? 'CPC Brand Colors' : 'Original Portfolio Colors'}
          </div>
          
          {showCPCColors ? (
            // CPC Color Palette
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="w-full h-8 bg-cpc-green-600 rounded"></div>
                <div className="text-xs text-center">#007060</div>
                <div className="text-xs text-center font-medium">Primary</div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-cpc-green-100 rounded"></div>
                <div className="text-xs text-center">#CCE2DC</div>
                <div className="text-xs text-center font-medium">Secondary</div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-gray-800 rounded"></div>
                <div className="text-xs text-center">#2E2D2B</div>
                <div className="text-xs text-center font-medium">Text</div>
              </div>
            </div>
          ) : (
            // Original Portfolio Colors
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="w-full h-8 rounded" style={{ backgroundColor: '#006E51' }}></div>
                <div className="text-xs text-center">#006E51</div>
                <div className="text-xs text-center font-medium">Primary</div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 rounded" style={{ backgroundColor: '#CCE2DC' }}></div>
                <div className="text-xs text-center">#CCE2DC</div>
                <div className="text-xs text-center font-medium">Secondary</div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 rounded" style={{ backgroundColor: '#2E2D2B' }}></div>
                <div className="text-xs text-center">#2E2D2B</div>
                <div className="text-xs text-center font-medium">Text</div>
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {showCPCColors 
                ? 'CPC brand colors with full palette range (50-900)' 
                : 'Original portfolio colors - very similar to CPC!'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}