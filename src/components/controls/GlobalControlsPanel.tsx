'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Pin } from 'lucide-react';

export interface GlobalControlsPanelProps {
  title?: string;
  pinned?: boolean;
  onTogglePin?: () => void;

  showDataSourceToggle?: boolean;
  useNavigateData?: boolean;
  onDataSourceChange?: (useNavigate: boolean) => void;

  showTrlFilter?: boolean;
  trlRange?: [number, number];
  onTrlRangeChange?: (range: [number, number]) => void;

  activeVisualizationName?: string;
  activeCategoryLabel?: string;
  availableCount?: number;
  totalTechnologyCount?: number;

  children?: ReactNode;
}

export function GlobalControlsPanel({
  title = 'Controls',
  pinned,
  onTogglePin,
  showDataSourceToggle = false,
  useNavigateData,
  onDataSourceChange,
  showTrlFilter = false,
  trlRange,
  onTrlRangeChange,
  activeVisualizationName,
  activeCategoryLabel,
  availableCount,
  totalTechnologyCount,
  children
}: GlobalControlsPanelProps) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#006E51]">{title}</h3>
        {onTogglePin && (
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded transition-colors ${
              pinned
                ? 'bg-[#006E51] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={pinned ? 'Unpin controls' : 'Pin controls'}
          >
            <Pin className={`h-4 w-4 ${pinned ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {showDataSourceToggle && typeof useNavigateData === 'boolean' && onDataSourceChange && (
          <section className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
            <h4 className="font-medium text-[#006E51] mb-3">Data Source</h4>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => onDataSourceChange(false)}
                className={`flex-1 ${!useNavigateData ? 'bg-[#006E51] text-white hover:bg-[#00573f]' : 'bg-white/60 text-gray-700 hover:bg-white/80'}`}
                variant="secondary"
              >
                Challenge
              </Button>
              <Button
                type="button"
                onClick={() => onDataSourceChange(true)}
                className={`flex-1 ${useNavigateData ? 'bg-[#006E51] text-white hover:bg-[#00573f]' : 'bg-white/60 text-gray-700 hover:bg-white/80'}`}
                variant="secondary"
              >
                Navigate
              </Button>
            </div>
          </section>
        )}

        {showTrlFilter && useNavigateData && trlRange && onTrlRangeChange && (
          <section className="p-4 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 rounded-lg border border-[#006E51]/20">
            <h4 className="font-medium text-[#006E51] mb-3">TRL Range Filter</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">TRL Range</span>
                <span className="px-2 py-1 bg-[#006E51]/10 text-[#006E51] text-xs rounded font-medium">
                  {trlRange[0]} - {trlRange[1]}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Min TRL: {trlRange[0]}</label>
                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={trlRange[0]}
                    onChange={(event) => {
                      const min = parseInt(event.target.value, 10);
                      if (min <= trlRange[1]) {
                        onTrlRangeChange([min, trlRange[1]]);
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Max TRL: {trlRange[1]}</label>
                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={trlRange[1]}
                    onChange={(event) => {
                      const max = parseInt(event.target.value, 10);
                      if (max >= trlRange[0]) {
                        onTrlRangeChange([trlRange[0], max]);
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006E51]"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {(activeVisualizationName || activeCategoryLabel) && (
          <section className="p-4 bg-[#CCE2DC]/20 rounded-lg border border-[#CCE2DC]/60 text-sm">
            {activeVisualizationName && (
              <div className="mb-1">
                <span className="font-medium text-[#006E51]">View:</span>{' '}
                <span className="text-gray-700">{activeVisualizationName}</span>
              </div>
            )}
            {typeof availableCount === 'number' && (
              <div className="mb-1">
                <span className="font-medium text-[#006E51]">Available:</span>{' '}
                <span className="text-gray-700">{availableCount}</span>
              </div>
            )}
            {activeCategoryLabel && (
              <div>
                <span className="font-medium text-[#006E51]">Category:</span>{' '}
                <span className="text-gray-700">{activeCategoryLabel}</span>
              </div>
            )}
            {typeof totalTechnologyCount === 'number' && (
              <div className="mt-1 text-xs text-gray-500">
                Showing {availableCount ?? totalTechnologyCount} of {totalTechnologyCount} technologies
              </div>
            )}
          </section>
        )}

        {children}
      </div>
    </div>
  );
}

export default GlobalControlsPanel;

