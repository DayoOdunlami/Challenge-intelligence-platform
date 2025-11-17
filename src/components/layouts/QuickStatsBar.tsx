'use client';

import React from 'react';

interface QuickStatsBarProps {
  totalFunding: number;
  totalStakeholders: number;
  totalTechnologies: number;
  totalProjects: number;
}

export function QuickStatsBar({
  totalFunding,
  totalStakeholders,
  totalTechnologies,
  totalProjects
}: QuickStatsBarProps) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Total Funding:</span>
        <span className="font-bold text-[#006E51]">£{(totalFunding / 1000000).toFixed(0)}M</span>
      </div>
      <div className="w-px h-6 bg-gray-300" />
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Stakeholders:</span>
        <span className="font-bold text-[#006E51]">{totalStakeholders}</span>
      </div>
      <div className="w-px h-6 bg-gray-300" />
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Technologies:</span>
        <span className="font-bold text-[#006E51]">{totalTechnologies}</span>
      </div>
      <div className="w-px h-6 bg-gray-300" />
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Projects:</span>
        <span className="font-bold text-[#006E51]">{totalProjects}</span>
      </div>
    </div>
  );
}

