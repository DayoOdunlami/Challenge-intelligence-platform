'use client';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sector, FilterState } from '@/lib/types';

interface ChallengeFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalChallenges: number;
  filteredCount: number;
}

const SECTORS: { value: Sector; label: string }[] = [
  { value: 'rail', label: 'Rail' },
  { value: 'energy', label: 'Energy' },
  { value: 'local_gov', label: 'Local Government' },
  { value: 'transport', label: 'Transport' },
  { value: 'built_env', label: 'Built Environment' },
  { value: 'aviation', label: 'Aviation' }
];

const PROBLEM_TYPES = [
  'Infrastructure Modernisation',
  'Asset Management',
  'Decarbonisation',
  'Digital Transformation',
  'Traffic Optimization',
  'Smart Infrastructure',
  'Energy Storage',
  'Grid Modernisation',
  'Waste Management',
  'Climate Resilience',
  'Customer Experience',
  'Urban Mobility',
  'Construction Innovation',
  'Energy Efficiency'
];

export function ChallengeFilters({ 
  filters, 
  onFiltersChange, 
  totalChallenges, 
  filteredCount 
}: ChallengeFiltersProps) {
  
  // Local state for immediate keyword input feedback
  const [localKeywords, setLocalKeywords] = useState(filters.keywords);
  
  // Debounce keyword changes to avoid excessive filtering
  const debouncedKeywords = useDebounce(localKeywords, 300);
  
  // Update filters when debounced keywords change
  useEffect(() => {
    if (debouncedKeywords !== filters.keywords) {
      onFiltersChange({
        ...filters,
        keywords: debouncedKeywords
      });
    }
  }, [debouncedKeywords, filters, onFiltersChange]);
  
  // Update local keywords when filters change externally (e.g., clear all)
  useEffect(() => {
    setLocalKeywords(filters.keywords);
  }, [filters.keywords]);
  
  const handleSectorToggle = (sector: Sector) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    
    onFiltersChange({
      ...filters,
      sectors: newSectors
    });
  };

  const handleProblemTypeChange = (problemType: string) => {
    const newProblemTypes = filters.problemTypes.includes(problemType)
      ? filters.problemTypes.filter(pt => pt !== problemType)
      : [...filters.problemTypes, problemType];
    
    onFiltersChange({
      ...filters,
      problemTypes: newProblemTypes
    });
  };

  const handleBudgetChange = (type: 'min' | 'max', value: number) => {
    const newRange: [number, number] = [...filters.budgetRange];
    if (type === 'min') {
      newRange[0] = value;
    } else {
      newRange[1] = value;
    }
    
    onFiltersChange({
      ...filters,
      budgetRange: newRange
    });
  };

  const handleUrgencyToggle = () => {
    onFiltersChange({
      ...filters,
      urgentOnly: !filters.urgentOnly
    });
  };

  const handleKeywordsChange = (keywords: string) => {
    setLocalKeywords(keywords);
  };

  const clearAllFilters = () => {
    setLocalKeywords(''); // Clear local keywords immediately
    onFiltersChange({
      sectors: [],
      problemTypes: [],
      budgetRange: [0, 50000000],
      urgentOnly: false,
      keywords: ''
    });
  };

  const hasActiveFilters = 
    filters.sectors.length > 0 || 
    filters.problemTypes.length > 0 || 
    filters.budgetRange[0] > 0 || 
    filters.budgetRange[1] < 50000000 ||
    filters.urgentOnly ||
    localKeywords.trim() !== '';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          <div className="text-sm font-normal text-gray-600">
            Showing {filteredCount} of {totalChallenges} challenges
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Search Keywords */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search Keywords</label>
          <input
            type="text"
            placeholder="Search challenges..."
            value={localKeywords}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sectors */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sectors</label>
          <div className="grid grid-cols-2 gap-2">
            {SECTORS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleSectorToggle(value)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  filters.sectors.includes(value)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Types */}
        <div>
          <label className="text-sm font-medium mb-2 block">Problem Types</label>
          <Select onValueChange={handleProblemTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select problem types..." />
            </SelectTrigger>
            <SelectContent>
              {PROBLEM_TYPES.map((problemType) => (
                <SelectItem key={problemType} value={problemType}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.problemTypes.includes(problemType)}
                      onChange={() => handleProblemTypeChange(problemType)}
                      className="mr-2"
                    />
                    {problemType}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Selected Problem Types */}
          {filters.problemTypes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.problemTypes.map((problemType) => (
                <span
                  key={problemType}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md flex items-center"
                >
                  {problemType}
                  <button
                    onClick={() => handleProblemTypeChange(problemType)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Budget Range - Separate Min/Max Sliders */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Budget Range: £{filters.budgetRange[0].toLocaleString()} - £{filters.budgetRange[1].toLocaleString()}
          </label>
          
          {/* Minimum Budget */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 mb-1 block">Minimum: £{filters.budgetRange[0].toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="50000000"
              step="500000"
              value={filters.budgetRange[0]}
              onChange={(e) => {
                const newMin = parseInt(e.target.value);
                if (newMin <= filters.budgetRange[1]) {
                  handleBudgetChange('min', newMin);
                }
              }}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
            />
          </div>
          
          {/* Maximum Budget */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Maximum: £{filters.budgetRange[1].toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="50000000"
              step="500000"
              value={filters.budgetRange[1]}
              onChange={(e) => {
                const newMax = parseInt(e.target.value);
                if (newMax >= filters.budgetRange[0]) {
                  handleBudgetChange('max', newMax);
                }
              }}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-thumb-green"
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>£0</span>
            <span>£50M</span>
          </div>
        </div>

        {/* Urgency Filter */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.urgentOnly}
              onChange={handleUrgencyToggle}
              className="rounded"
            />
            <span className="text-sm font-medium">Critical urgency only</span>
          </label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            onClick={clearAllFilters}
            variant="outline"
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}