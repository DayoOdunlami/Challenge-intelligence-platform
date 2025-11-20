'use client';

import React, { useState } from 'react';
import stakeholdersData from '@/data/toolkit/stakeholders.json';
import projectsData from '@/data/toolkit/projects.json';
import workingGroupsData from '@/data/toolkit/workingGroups.json';
import relationshipsData from '@/data/toolkit/relationships.json';

export function InfographicView() {
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);

  // Placeholder - will implement full Venn diagram with Framer Motion
  return (
    <div className="w-full h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center">
        <p className="text-gray-600 mb-2">Infographic View</p>
        <p className="text-sm text-gray-500">
          Interactive Venn diagram with stakeholder logos - Coming soon
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {stakeholdersData.length} stakeholders loaded
        </p>
      </div>
    </div>
  );
}

