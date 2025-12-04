'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface CompactInsightCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

/**
 * Compact, collapsible insight card for use in chat messages.
 * Shows a summary when collapsed, full content when expanded.
 */
export function CompactInsightCard({ 
  title, 
  children, 
  defaultExpanded = false 
}: CompactInsightCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="w-full">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-2 rounded-lg hover:bg-[#0f8b8d]/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#0f8b8d]" />
          <span className="text-xs font-semibold text-[#0f8b8d]">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

