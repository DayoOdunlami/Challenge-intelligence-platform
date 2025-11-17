/**
 * SankeyChartNavigate
 * 
 * NAVIGATE version of SankeyChart showing funding flows:
 * Stakeholder Type → Technology Category → Funding Type
 * Uses actual funding amounts (not counts!)
 */

'use client';

import React, { useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stakeholder, Technology, FundingEvent } from '@/lib/navigate-types';
import { toSankeyFromNavigate } from '@/lib/navigate-adapters';

interface SankeyChartNavigateProps {
  stakeholders: Stakeholder[];
  technologies: Technology[];
  fundingEvents: FundingEvent[];
  relationships: any[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function SankeyChartNavigate({ 
  stakeholders,
  technologies,
  fundingEvents,
  relationships,
  onNodeClick,
  className = '' 
}: SankeyChartNavigateProps) {
  
  const sankeyData = useMemo(() => {
    if (stakeholders.length === 0 || technologies.length === 0 || fundingEvents.length === 0) {
      return { nodes: [], links: [] };
    }
    return toSankeyFromNavigate(stakeholders, technologies, fundingEvents, relationships);
  }, [stakeholders, technologies, fundingEvents, relationships]);

  if (stakeholders.length === 0 || technologies.length === 0 || fundingEvents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>NAVIGATE Funding Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No NAVIGATE data available to display</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleNodeClick = (data: unknown) => {
    const node = data as { id?: string };
    if (onNodeClick && node.id) {
      onNodeClick(node.id);
    }
  };

  // Format node labels
  const formatNodeLabel = (nodeId: string) => {
    if (nodeId.startsWith('stakeholder_')) {
      return nodeId.replace('stakeholder_', '').replace(/_/g, ' ');
    } else if (nodeId.startsWith('tech_')) {
      return nodeId.replace('tech_', '').replace(/([A-Z])/g, ' $1').trim();
    } else if (nodeId.startsWith('funding_')) {
      return nodeId.replace('funding_', '');
    }
    return nodeId;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NAVIGATE Funding Flow Analysis</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Flow: Stakeholder Type → Technology Category → Funding Type
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Width = Funding amount (£)
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px]">
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
            align="justify"
            colors={{ scheme: 'category10' }}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.35}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="vertical"
            labelPadding={16}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
            animate={true}
            motionConfig="gentle"
            onClick={handleNodeClick}
            tooltip={({ node, link }) => {
              if (link) {
                return (
                  <div className="bg-white p-2 border rounded shadow-lg">
                    <div className="font-semibold">{formatNodeLabel(link.source.id)} → {formatNodeLabel(link.target.id)}</div>
                    <div className="text-sm">£{(link.value / 1000000).toFixed(1)}M</div>
                  </div>
                );
              }
              return (
                <div className="bg-white p-2 border rounded shadow-lg">
                  <div className="font-semibold">{formatNodeLabel(node.id)}</div>
                  <div className="text-sm">Value: £{(node.value / 1000000).toFixed(1)}M</div>
                </div>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

