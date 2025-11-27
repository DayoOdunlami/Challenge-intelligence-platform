'use client';

import React from 'react';
// Removed Card wrapper to match Stakeholder Dynamics compact style
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Note: Switch and Slider components not yet available - using alternatives
import { Badge } from '@/components/ui/badge';
import { Filter, Settings2 } from 'lucide-react';

export interface InnovationTrackerFilters {
  fiscalYear: string;
  fundingSource: 'all' | 'public' | 'private';
  programme?: string;
  showDetailedProjects: boolean;
  scenarioAdjustments: Record<string, number>; // entityId -> percentage adjustment
}

interface InnovationTrackerControlsProps {
  filters: InnovationTrackerFilters;
  onFiltersChange: (filters: InnovationTrackerFilters) => void;
}

export function InnovationTrackerControls({
  filters,
  onFiltersChange,
}: InnovationTrackerControlsProps) {
  const updateFilter = <K extends keyof InnovationTrackerFilters>(
    key: K,
    value: InnovationTrackerFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="w-full bg-gray-50 rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Controls & Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fiscal Year */}
        <div className="space-y-1">
          <Label htmlFor="fiscal-year" className="text-xs">Fiscal Year</Label>
          <Select
            value={filters.fiscalYear}
            onValueChange={(value) => updateFilter('fiscalYear', value)}
          >
            <SelectTrigger id="fiscal-year" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FY24">FY24 (2024-2025)</SelectItem>
              <SelectItem value="FY23">FY23 (2023-2024)</SelectItem>
              <SelectItem value="FY22">FY22 (2022-2023)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Funding Source Filter */}
        <div className="space-y-1">
          <Label htmlFor="funding-source" className="text-xs">Funding Source</Label>
          <Select
            value={filters.fundingSource}
            onValueChange={(value) => updateFilter('fundingSource', value as 'all' | 'public' | 'private')}
          >
            <SelectTrigger id="funding-source" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="public">Public Only</SelectItem>
              <SelectItem value="private">Private Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Programme Filter */}
        <div className="space-y-1">
          <Label htmlFor="programme" className="text-xs">Programme</Label>
          <Select
            value={filters.programme || 'all'}
            onValueChange={(value) => updateFilter('programme', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="programme" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programmes</SelectItem>
              <SelectItem value="ATI Programme">ATI Programme</SelectItem>
              <SelectItem value="Advanced Fuels Fund">Advanced Fuels Fund</SelectItem>
              <SelectItem value="Future Flight Programme">Future Flight Programme</SelectItem>
              <SelectItem value="UKRI Core Allocation">UKRI Core Allocation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Detailed Projects Toggle */}
        <div className="flex flex-col justify-end space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="detailed-projects"
              checked={filters.showDetailedProjects}
              onChange={(e) => updateFilter('showDetailedProjects', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="detailed-projects" className="text-xs cursor-pointer">
              Show Detailed Projects
            </Label>
          </div>
        </div>

      </div>
      
      {/* Scenario Adjustments Row */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <Label className="text-sm font-semibold">Scenario Modeling</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Key Entity Adjustments */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs">UKRI Allocation ({filters.scenarioAdjustments['ukri'] || 100}%)</Label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.scenarioAdjustments['ukri'] || 100}
                onChange={(e) => {
                  updateFilter('scenarioAdjustments', {
                    ...filters.scenarioAdjustments,
                    ukri: parseInt(e.target.value),
                  });
                }}
                className="w-full mt-2"
              />
            </div>

            <div>
              <Label className="text-xs">ATI Programme ({filters.scenarioAdjustments['ati'] || 100}%)</Label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.scenarioAdjustments['ati'] || 100}
                onChange={(e) => {
                  updateFilter('scenarioAdjustments', {
                    ...filters.scenarioAdjustments,
                    ati: parseInt(e.target.value),
                  });
                }}
                className="w-full mt-2"
              />
            </div>

            <div>
              <Label className="text-xs">Advanced Fuels Fund ({filters.scenarioAdjustments['aff'] || 100}%)</Label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.scenarioAdjustments['aff'] || 100}
                onChange={(e) => {
                  updateFilter('scenarioAdjustments', {
                    ...filters.scenarioAdjustments,
                    aff: parseInt(e.target.value),
                  });
                }}
                className="w-full mt-2"
              />
            </div>
          </div>

        </div>
        {/* Reset Button */}
        {(Object.keys(filters.scenarioAdjustments).length > 0 && 
          Object.values(filters.scenarioAdjustments).some(v => v !== 100)) && (
          <div className="mt-3">
            <button
              onClick={() => updateFilter('scenarioAdjustments', {})}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset to Baseline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

