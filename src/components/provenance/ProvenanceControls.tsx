/**
 * Provenance Controls Component
 * 
 * Collapsible provenance filter panel for all visualizations.
 * Collapsed by default, can be expanded to filter by data quality.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { ProvenanceFilter } from '@/lib/base-entity-enhanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProvenanceControlsProps {
  filters: ProvenanceFilter;
  onChange: (filters: ProvenanceFilter) => void;
  defaultOpen?: boolean;
  className?: string;
}

export function ProvenanceControls({
  filters,
  onChange,
  defaultOpen = false,
  className,
}: ProvenanceControlsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = (key: keyof ProvenanceFilter, value: boolean) => {
    onChange({ ...filters, [key]: value });
  };

  const handleConfidenceChange = (value: number[]) => {
    onChange({ ...filters, minConfidence: value[0] });
  };

  const resetFilters = () => {
    onChange({});
  };

  const applyPreset = (preset: 'high' | 'medium' | 'all') => {
    switch (preset) {
      case 'high':
        onChange({
          minConfidence: 0.8,
          verifiedOnly: true,
          freshOnly: true,
          excludeFlagged: true,
        });
        break;
      case 'medium':
        onChange({
          minConfidence: 0.6,
          freshOnly: true,
          excludeSeverity: ['error'],
        });
        break;
      case 'all':
        onChange({});
        break;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Data Quality Filters</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 p-0"
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4 pt-0">
          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Quick Presets</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('high')}
                className={
                  filters.minConfidence === 0.8 && filters.verifiedOnly
                    ? 'bg-green-50 border-green-500'
                    : ''
                }
              >
                High Quality
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('medium')}
                className={
                  filters.minConfidence === 0.6 && !filters.verifiedOnly
                    ? 'bg-yellow-50 border-yellow-500'
                    : ''
                }
              >
                Medium+
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('all')}
                className={
                  !filters.minConfidence && !filters.verifiedOnly
                    ? 'bg-gray-50 border-gray-500'
                    : ''
                }
              >
                Show All
              </Button>
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-600">
                Minimum Confidence
              </Label>
              <span className="text-xs text-gray-500">
                {filters.minConfidence
                  ? `${Math.round((filters.minConfidence || 0) * 100)}%`
                  : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={filters.minConfidence ?? 0}
              onChange={(e) => handleConfidenceChange([parseFloat(e.target.value)])}
              className="w-full accent-[#006E51]"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Label htmlFor="verified-only" className="text-sm cursor-pointer">
                  Only verified data
                </Label>
              </div>
              <input
                id="verified-only"
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={(event) => handleToggle('verifiedOnly', event.target.checked)}
                className="h-4 w-4 rounded text-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <Label htmlFor="fresh-only" className="text-sm cursor-pointer">
                  Exclude stale data (&gt;90 days)
                </Label>
              </div>
              <input
                id="fresh-only"
                type="checkbox"
                checked={filters.freshOnly || false}
                onChange={(event) => handleToggle('freshOnly', event.target.checked)}
                className="h-4 w-4 rounded text-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <Label htmlFor="exclude-flagged" className="text-sm cursor-pointer">
                  Hide flagged entities
                </Label>
              </div>
              <input
                id="exclude-flagged"
                type="checkbox"
                checked={filters.excludeFlagged || false}
                onChange={(event) => handleToggle('excludeFlagged', event.target.checked)}
                className="h-4 w-4 rounded text-[#006E51] focus:ring-[#006E51]/20"
              />
            </div>
          </div>

          {/* Baseline Data Filter (PoC/MVP specific) */}
          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-medium text-gray-600">Data Type</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-baseline"
                  checked
                  readOnly
                  className="rounded"
                />
                <Label htmlFor="include-baseline" className="text-sm cursor-pointer">
                  Include test/dummy data
                </Label>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          {(filters.minConfidence || filters.verifiedOnly || filters.freshOnly || filters.excludeFlagged) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="w-full"
            >
              Reset Filters
            </Button>
          )}

          {/* Active Filters Summary */}
          {Object.keys(filters).length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500">
                <strong>Active:</strong>{' '}
                {[
                  filters.minConfidence && `Confidence ≥${Math.round((filters.minConfidence || 0) * 100)}%`,
                  filters.verifiedOnly && 'Verified only',
                  filters.freshOnly && 'Fresh only',
                  filters.excludeFlagged && 'No flags',
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

