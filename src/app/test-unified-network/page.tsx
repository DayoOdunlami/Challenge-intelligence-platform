'use client';

import React from 'react';
import Link from 'next/link';
import { UnifiedNetworkGraphD3 } from '@/components/visualizations/UnifiedNetworkGraphD3';
import { unifiedEntities, unifiedRelationships } from '@/data/unified';

export default function TestUnifiedNetworkPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header / Nav to other test pages */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Unified Network Graph Test
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/test-network"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Challenge Network Tests
            </Link>
          </div>
        </div>

        <p className="text-gray-600 max-w-3xl">
          This page renders the new <strong>UnifiedNetworkGraph</strong> using the
          unified schema (Atlas challenges + Navigate stakeholders / technologies / projects).
          It is a simple 2D view intended for early testing before we wire it into the
          main Navigate library.
        </p>

        <div className="w-full h-[70vh] rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <UnifiedNetworkGraphD3
            entities={unifiedEntities}
            relationships={unifiedRelationships}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}


