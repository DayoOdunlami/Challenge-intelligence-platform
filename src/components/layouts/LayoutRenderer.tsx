'use client';

import React, { useState } from 'react';
import { MessageCircle, Mic, X, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutOption } from './LayoutSwitcher';

interface LayoutRendererProps {
  layout: LayoutOption;
  controlsPanel: React.ReactNode;
  visualization: React.ReactNode;
  insightsPanel: React.ReactNode;
  aiChatPanel: React.ReactNode;
  quickStats: React.ReactNode;
}

export function LayoutRenderer({
  layout,
  controlsPanel,
  visualization,
  insightsPanel,
  aiChatPanel,
  quickStats
}: LayoutRendererProps) {
  // State for collapsible panels
  const [isAICollapsed, setIsAICollapsed] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false); // For Option 2 (floating)
  const [activeTab, setActiveTab] = useState<'insights' | 'ai'>('insights'); // For Option 3
  const [isLeftAIOpen, setIsLeftAIOpen] = useState(false); // For Option 5

  // Option 1: Bottom Panel
  if (layout === 'option1') {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className="flex flex-1 gap-6 mb-4">
          {/* Controls Panel - Now handled by fixed positioning */}
          {controlsPanel}

          {/* Visualization */}
          <div className="flex-1 min-w-0">
            {visualization}
          </div>

          {/* Insights Panel */}
          <div className="w-80 flex-shrink-0">
            {insightsPanel}
          </div>
        </div>

        {/* AI Chat Panel (Bottom) */}
        <div className={`border-t border-[#CCE2DC] bg-white transition-all duration-300 ${
          isAICollapsed ? 'h-12' : 'h-64'
        }`}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#CCE2DC]">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#006E51]" />
              <span className="font-medium text-[#006E51]">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAICollapsed(!isAICollapsed)}
              className="text-gray-600 hover:text-[#006E51]"
            >
              {isAICollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          {!isAICollapsed && (
            <div className="p-4 h-[calc(100%-48px)] overflow-auto">
              {aiChatPanel}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Option 2: Floating Assistant
  if (layout === 'option2') {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)] relative">
        {/* Main Content Area */}
        <div className="flex flex-1 gap-6">
          {/* Controls Panel - Now handled by fixed positioning in controlsPanel prop */}
          {controlsPanel}

          {/* Visualization (expands to fill space when AI is closed) */}
          <div className={`w-full transition-all duration-300 ${
            isAIOpen ? 'pr-80' : 'pr-0'
          }`}>
            {visualization}
          </div>

          {/* AI Chat Panel (Slides in from right) */}
          <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-[#CCE2DC] shadow-xl transition-transform duration-300 z-50 ${
            isAIOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#CCE2DC]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#006E51]" />
                <span className="font-medium text-[#006E51]">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAIOpen(false)}
                className="text-gray-600 hover:text-[#006E51]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(100%-48px)] overflow-auto">
              {aiChatPanel}
            </div>
          </div>
        </div>

        {/* Floating AI Button */}
        {!isAIOpen && (
          <button
            onClick={() => setIsAIOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#006E51] text-white rounded-full shadow-lg hover:bg-[#005A42] transition-all flex items-center justify-center z-40 hover:scale-110"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
    );
  }

  // Option 3: Split Panel (Insights + AI in right panel with tabs)
  if (layout === 'option3') {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)] relative">
        {/* Controls Panel - Fixed positioned, not in flex layout */}
        {controlsPanel}

        {/* Main Content Area */}
        <div className="flex flex-1 gap-6 w-full">
          {/* Visualization (has ml-80/ml-0 logic - expands to left when controls hidden) */}
          <div className="flex-1 min-w-0">
            {visualization}
          </div>

          {/* Combined Insights + AI Panel */}
          <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-[#CCE2DC]">
            {/* Tabs */}
            <div className="flex border-b border-[#CCE2DC]">
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-[#006E51]/10 text-[#006E51] border-b-2 border-[#006E51]'
                    : 'text-gray-600 hover:text-[#006E51] hover:bg-gray-50'
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-[#006E51]/10 text-[#006E51] border-b-2 border-[#006E51]'
                    : 'text-gray-600 hover:text-[#006E51] hover:bg-gray-50'
                }`}
              >
                AI Chat
              </button>
            </div>

            {/* Tab Content */}
            <div className="h-[calc(100%-48px)] overflow-auto">
              {activeTab === 'insights' ? insightsPanel : aiChatPanel}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Option 4: Dynamic Morphing (simplified - shows AI when entity selected)
  if (layout === 'option4') {
    // This would be more complex in real implementation
    // For now, showing a simplified version
    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">

        {/* Main Content Area - Adapts based on state */}
        <div className="flex flex-1 gap-6">
          {/* Controls Panel */}
          <div className="w-80 flex-shrink-0">
            {controlsPanel}
          </div>

          {/* Visualization */}
          <div className="flex-1 min-w-0">
            {visualization}
          </div>

          {/* Dynamic Panel - Shows Insights or AI based on context */}
          <div className="w-80 flex-shrink-0">
            {/* In real implementation, this would switch based on:
                - Entity selected → Show Insights
                - AI active → Show AI Chat
                - Both → Split view
            */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#CCE2DC] p-4">
                <p className="text-sm text-gray-600 mb-2">Layout adapts to:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Entity selected → Insights panel</li>
                  <li>• AI active → AI Chat panel</li>
                  <li>• Both → Split view</li>
                </ul>
              </div>
              {insightsPanel}
            </div>
          </div>
        </div>

        {/* AI Chat (appears when AI is active) */}
        {isAIOpen && (
          <div className="border-t border-[#CCE2DC] bg-white h-64">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#CCE2DC]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#006E51]" />
                <span className="font-medium text-[#006E51]">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAIOpen(false)}
                className="text-gray-600 hover:text-[#006E51]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(100%-48px)] overflow-auto">
              {aiChatPanel}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Option 5: Right Column AI (slides in from right), Bottom Insights
  if (layout === 'option5') {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className="flex flex-1 gap-6 mb-4 relative">
          {/* Controls Panel (Left) */}
          <div className="w-80 flex-shrink-0">
            {controlsPanel}
          </div>

          {/* Visualization (takes remaining space) */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${
            isAIOpen ? 'mr-80' : ''
          }`}>
            {visualization}
          </div>

          {/* AI Chat Panel (Slides in from right) */}
          <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-[#CCE2DC] shadow-xl transition-transform duration-300 z-50 ${
            isAIOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#CCE2DC]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#006E51]" />
                <span className="font-medium text-[#006E51]">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAIOpen(false)}
                className="text-gray-600 hover:text-[#006E51]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(100%-48px)] overflow-auto">
              {aiChatPanel}
            </div>
          </div>
        </div>

        {/* Insights Panel (Bottom) */}
        <div className="border-t border-[#CCE2DC] bg-white">
          <div className="px-4 py-2 border-b border-[#CCE2DC]">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#006E51]" />
              <span className="font-medium text-[#006E51]">Insights</span>
            </div>
          </div>
          <div className="p-4 max-h-64 overflow-auto">
            {insightsPanel}
          </div>
        </div>

        {/* Floating AI Button */}
        {!isAIOpen && (
          <button
            onClick={() => setIsAIOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#006E51] text-white rounded-full shadow-lg hover:bg-[#005A42] transition-all flex items-center justify-center z-40 hover:scale-110"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
    );
  }

  return null;
}

