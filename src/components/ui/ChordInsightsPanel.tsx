'use client';

import React from 'react';
import { Challenge, Sector } from '@/lib/types';
import { Badge } from './badge';

interface ChordInsightsPanelProps {
  challenges: Challenge[];
  selectedSector?: Sector | null;
  onSectorSelect?: (sector: Sector) => void;
  className?: string;
}

export function ChordInsightsPanel({
  challenges,
  selectedSector,
  onSectorSelect,
  className = ''
}: ChordInsightsPanelProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* What Chord Connections Mean */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">Understanding Chord Connections</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <div><strong>Chord thickness</strong> = Number of shared problem types</div>
          <div><strong>Arc size</strong> = Total challenges in that sector</div>
          <div><strong>Connections show</strong> = Cross-sector collaboration potential</div>
          <div><strong>Colors</strong> = Different infrastructure sectors</div>
        </div>
      </div>

      {/* Sector Overview */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Sector Overview</h3>
        <div className="text-sm text-gray-600">
          <p>Click on sectors in the chord diagram to see detailed analysis.</p>
          <p className="mt-2">Total challenges: {challenges.length}</p>
          {selectedSector && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-medium text-orange-900">
                Selected: {selectedSector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-orange-800 text-sm mt-1">
                Challenges in this sector: {challenges.filter(c => c.sector.primary === selectedSector).length}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-3">Strategic Insights</h3>
        <div className="text-sm text-green-800 space-y-2">
          <div>
            <strong>Cross-sector opportunities:</strong> Look for thick chords between different colored sectors
          </div>
          <div>
            <strong>Collaboration potential:</strong> Sectors with multiple connections are ideal for partnerships
          </div>
          <div>
            <strong>Market gaps:</strong> Isolated sectors may represent untapped opportunities
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChordInsightsPanel;