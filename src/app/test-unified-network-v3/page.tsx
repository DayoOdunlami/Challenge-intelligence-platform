'use client';

import React from 'react';
import Link from 'next/link';
import { NetworkGraphDemoClustered } from '@/components/visualizations/NetworkGraphDemoClustered';

export default function TestUnifiedNetworkV3Page() {
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Unified Network Graph V3 - With Clustering
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Full clustering controls with Toolkit-style grouping logic
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/test-unified-network-v2"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Back to V2
          </Link>
        </div>
      </div>

      {/* Graph Demo with Clustering Controls */}
      <div className="flex-1">
        <NetworkGraphDemoClustered />
      </div>
    </div>
  );
}

