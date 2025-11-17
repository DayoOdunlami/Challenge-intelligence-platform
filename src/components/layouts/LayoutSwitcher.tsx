'use client';

import React, { useState } from 'react';
import { Settings, Layout, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LayoutOption = 'option1' | 'option2' | 'option3' | 'option4' | 'option5';

interface LayoutSwitcherProps {
  currentLayout: LayoutOption;
  onLayoutChange: (layout: LayoutOption) => void;
}

const layoutOptions = [
  {
    id: 'option1' as LayoutOption,
    name: 'Bottom Panel',
    description: 'AI Chat in bottom panel (collapsible)',
    icon: Layout
  },
  {
    id: 'option2' as LayoutOption,
    name: 'Floating Assistant',
    description: 'Floating AI button, opens side panel',
    icon: Maximize2
  },
  {
    id: 'option3' as LayoutOption,
    name: 'Split Panel',
    description: 'Insights + AI in right panel with tabs',
    icon: Settings
  },
  {
    id: 'option4' as LayoutOption,
    name: 'Dynamic Morphing',
    description: 'Layout adapts to user actions',
    icon: Layout
  },
  {
    id: 'option5' as LayoutOption,
    name: 'Left Column AI',
    description: 'AI Chat in left column, Insights in bottom',
    icon: Minimize2
  }
];

export function LayoutSwitcher({ currentLayout, onLayoutChange }: LayoutSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white"
      >
        <Layout className="h-4 w-4 mr-2" />
        Layout: {layoutOptions.find(o => o.id === currentLayout)?.name}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50 w-80 bg-white rounded-xl shadow-lg border border-[#CCE2DC] p-4">
            <h3 className="font-semibold text-[#006E51] mb-3">Choose Layout</h3>
            <div className="space-y-2">
              {layoutOptions.map((option) => {
                const Icon = option.icon;
                const isActive = currentLayout === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onLayoutChange(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#006E51]/10 border-2 border-[#006E51]'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-[#006E51]' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className={`font-medium ${isActive ? 'text-[#006E51]' : 'text-gray-800'}`}>
                          {option.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {option.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-[#006E51] rounded-full" />
                      )}
                </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

