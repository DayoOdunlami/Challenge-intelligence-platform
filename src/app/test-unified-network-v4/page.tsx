'use client';

import React from 'react';
import Link from 'next/link';
import { NetworkGraphDemoNested } from '@/components/visualizations/NetworkGraphDemoNested';

export default function TestUnifiedNetworkV4Page() {
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Unified Network Graph V4 - Nested Clustering
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Full nested clustering with 3D transparent cluster pods
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/test-unified-network-v3"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Back to V3
          </Link>
        </div>
      </div>

      {/* Graph Demo with Nested Clustering */}
      <div className="flex-1">
        <NetworkGraphDemoNested />
      </div>
    </div>
  );
}

