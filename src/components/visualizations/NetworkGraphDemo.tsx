'use client';

import { useState } from 'react';
import { UnifiedNetworkGraph } from './UnifiedNetworkGraph';

// Import your unified data
import { unifiedEntities, unifiedRelationships } from '@/data/unified';
// Or filter by domain:
// import { getEntitiesByDomain, unifiedRelationships } from '@/data/unified';

export function NetworkGraphDemo() {
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [colorBy, setColorBy] = useState<'domain' | 'entityType'>('domain');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Mode:</span>
          <button
            onClick={() => setMode('2d')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              mode === '2d'
                ? 'bg-[#006E51] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setMode('3d')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              mode === '3d'
                ? 'bg-[#006E51] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            3D
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Color by:</span>
          <button
            onClick={() => setColorBy('domain')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              colorBy === 'domain'
                ? 'bg-[#006E51] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Domain
          </button>
          <button
            onClick={() => setColorBy('entityType')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              colorBy === 'entityType'
                ? 'bg-[#006E51] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Entity Type
          </button>
        </div>

        {selectedEntity && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="text-sm">
              <span className="text-gray-500">Selected:</span>{' '}
              <span className="font-medium text-gray-900">{selectedEntity.name}</span>
              <span className="text-gray-400 ml-2">({selectedEntity.entityType})</span>
            </div>
          </>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1">
        <UnifiedNetworkGraph
          entities={unifiedEntities}
          relationships={unifiedRelationships}
          mode={mode}
          colorBy={colorBy}
          onNodeSelect={setSelectedEntity}
          fitToCanvas
          clickToFocus
        />
      </div>
    </div>
  );
}

