'use client';

import React from 'react';
import Link from 'next/link';
import { NetworkGraphDemo } from '@/components/visualizations/NetworkGraphDemo';

export default function TestUnifiedNetworkV2Page() {
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Unified Network Graph V2
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Fresh implementation with proper highlighting (no overlays)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/test-unified-network"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Back to V1
          </Link>
        </div>
      </div>

      {/* Graph Demo with Controls */}
      <div className="flex-1">
        <NetworkGraphDemo />
      </div>
    </div>
  );
}

