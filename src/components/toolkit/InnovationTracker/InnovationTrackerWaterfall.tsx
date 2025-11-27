'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { enhancedFundingFlowsData } from '@/data/toolkit/fundingFlows-enhanced';
import { InnovationTrackerFilters } from './InnovationTrackerControls';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

echarts.use([
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

interface InnovationTrackerWaterfallProps {
  filters: InnovationTrackerFilters;
  selectedEntityId?: string | null;
  onEntityClick?: (entityId: string) => void;
}

/**
 * Waterfall Chart for Innovation Tracker
 * 
 * Shows incremental funding changes from baseline → adjustments → projected outcomes
 * Perfect for scenario modeling and "what-if" analysis
 * 
 * Structure:
 * - Baseline (starting point)
 * - Adjustments by entity/programme (increases/decreases)
 * - Projected Outcomes (final state)
 */
export function InnovationTrackerWaterfall({
  filters,
  selectedEntityId,
  onEntityClick,
}: InnovationTrackerWaterfallProps) {
  
  // Calculate waterfall data: Total → Programme Breakdown
  const waterfallData = useMemo(() => {
    const totalFunding = enhancedFundingFlowsData.metadata.totalPublicFunding; // £17.4bn
    
    // Aggregate funding by programme from links
    const programmeBreakdown = new Map<string, number>();
    
    enhancedFundingFlowsData.links.forEach(link => {
      if (link.programme) {
        const current = programmeBreakdown.get(link.programme) || 0;
        programmeBreakdown.set(link.programme, current + link.value);
      }
    });
    
    // Group major programmes (aggregate similar ones)
    const majorProgrammes = new Map<string, number>();
    
    // UKRI Core Funding
    const ukriLinks = enhancedFundingFlowsData.links.filter(
      l => l.programme?.includes('UKRI') || l.source === 'ukri' || l.target === 'ukri'
    );
    const ukriTotal = ukriLinks.reduce((sum, l) => sum + l.value, 0);
    if (ukriTotal > 0) {
      majorProgrammes.set('UKRI', ukriTotal);
    }
    
    // ATI Programme
    const atiLinks = enhancedFundingFlowsData.links.filter(
      l => l.programme?.includes('ATI') || l.source === 'ati' || l.target === 'ati'
    );
    const atiTotal = atiLinks.reduce((sum, l) => sum + l.value, 0);
    if (atiTotal > 0) {
      majorProgrammes.set('ATI Programme', atiTotal);
    }
    
    // Advanced Fuels Fund
    const affLinks = enhancedFundingFlowsData.links.filter(
      l => l.programme?.includes('Advanced Fuels') || l.programme === 'Advanced Fuels Fund'
    );
    const affTotal = affLinks.reduce((sum, l) => sum + l.value, 0);
    if (affTotal > 0) {
      majorProgrammes.set('Advanced Fuels Fund', affTotal);
    }
    
    // Future Flight Programme
    const ffLinks = enhancedFundingFlowsData.links.filter(
      l => l.programme?.includes('Future Flight')
    );
    const ffTotal = ffLinks.reduce((sum, l) => sum + l.value, 0);
    if (ffTotal > 0) {
      majorProgrammes.set('Future Flight Programme', ffTotal);
    }
    
    // Apply scenario adjustments
    const adjustedProgrammes: Array<{
      name: string;
      baseline: number;
      adjusted: number;
      adjustment: number;
    }> = [];
    
    // Map entity IDs to programme names
    const entityToProgramme: Record<string, string> = {
      'ukri': 'UKRI',
      'ati': 'ATI Programme',
      'aff': 'Advanced Fuels Fund',
      'iuk': 'Future Flight Programme',
    };
    
    // Calculate adjusted values
    majorProgrammes.forEach((baseline, programmeName) => {
      // Find entity ID for this programme
      const entityId = Object.keys(entityToProgramme).find(
        id => entityToProgramme[id] === programmeName
      );
      
      const percentage = entityId ? (filters.scenarioAdjustments[entityId] || 100) : 100;
      const adjusted = baseline * (percentage / 100);
      
      adjustedProgrammes.push({
        name: programmeName,
        baseline,
        adjusted,
        adjustment: adjusted - baseline,
      });
    });
    
    // Calculate other programmes (not adjustable)
    let otherTotal = totalFunding;
    adjustedProgrammes.forEach(p => {
      otherTotal -= p.baseline;
    });
    
    // Add "Other" if significant
    if (otherTotal > 100) { // More than £100M
      adjustedProgrammes.push({
        name: 'Other Programmes',
        baseline: otherTotal,
        adjusted: otherTotal, // No adjustment
        adjustment: 0,
      });
    }
    
    // Sort by adjusted amount (descending)
    adjustedProgrammes.sort((a, b) => b.adjusted - a.adjusted);
    
    // Calculate new total
    const newTotal = adjustedProgrammes.reduce((sum, p) => sum + p.adjusted, 0);
    
    return {
      totalFunding,
      newTotal,
      programmes: adjustedProgrammes,
    };
  }, [filters.scenarioAdjustments]);
  
  const option = useMemo(() => {
    const { totalFunding, newTotal, programmes } = waterfallData;
    
    // Build breakdown waterfall: Total → Programme 1 → Programme 2 → etc.
    // Using two-series stacked bar approach
    const categories: string[] = [];
    const placeholderData: number[] = [];
    const visibleData: Array<{ value: number; itemStyle: any; label?: any }> = [];
    
    // Total Funding (starting bar)
    categories.push('Total Funding');
    placeholderData.push(0);
    visibleData.push({
      value: totalFunding,
      itemStyle: { color: '#3b82f6' }, // Blue for total
      label: {
        show: true,
        formatter: `£${(totalFunding / 1000).toFixed(1)}B`,
        position: 'inside',
        color: '#fff',
      },
    });
    
    // Breakdown waterfall: Total → subtract each programme → remaining
    let cumulative = totalFunding;
    
    programmes.forEach((prog) => {
      categories.push(prog.name);
      
      // Position bar at current cumulative total (what's left after previous allocations)
      placeholderData.push(cumulative - prog.adjusted); // Transparent part = remaining after this allocation
      
      // Visible bar shows this programme's allocation
      visibleData.push({
        value: prog.adjusted,
        itemStyle: {
          color: prog.adjustment !== 0 
            ? (prog.adjustment > 0 ? '#10b981' : '#ef4444') // Green if increased, red if decreased
            : '#6b7280', // Gray if unchanged
          borderColor: prog.adjustment !== 0
            ? (prog.adjustment > 0 ? '#059669' : '#dc2626')
            : '#4b5563',
        },
        label: {
          show: true,
          formatter: `£${(prog.adjusted / 1000).toFixed(2)}B${prog.adjustment !== 0 ? (prog.adjustment > 0 ? ' ↗' : ' ↘') : ''}`,
          position: 'inside',
          color: '#fff',
          fontSize: 10,
        },
      });
      
      // Update cumulative (what's left after allocating to this programme)
      cumulative -= prog.adjusted;
    });
    
    // Show remaining (if any) or final state
    if (Math.abs(cumulative) > 10) { // More than £10M difference
      categories.push('Remaining');
      placeholderData.push(0);
      visibleData.push({
        value: Math.abs(cumulative),
        itemStyle: {
          color: cumulative > 0 ? '#fbbf24' : '#ef4444', // Yellow if positive, red if over-allocated
        },
        label: {
          show: true,
          formatter: `£${(Math.abs(cumulative) / 1000).toFixed(2)}B`,
          position: 'inside',
        },
      });
    }
    
    return {
      title: {
        text: 'Funding Breakdown: Total → Programme Allocation',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1F2937',
        },
        subtext: newTotal !== totalFunding 
          ? `Current Scenario: £${(newTotal / 1000).toFixed(1)}B (${((newTotal - totalFunding) / totalFunding * 100).toFixed(1)}% change)`
          : `Baseline Allocation: £${(totalFunding / 1000).toFixed(1)}B`,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          // Use the second param (visible series) for tooltip
          const tar = params[1] || params[0];
          const value = tar.value;
          const formattedValue = value >= 1000 
            ? `£${(value / 1000).toFixed(1)}B` 
            : value >= 1 
            ? `£${value.toFixed(1)}M` 
            : `£${(value * 1000).toFixed(0)}K`;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${tar.name}</div>
              <div style="font-size: 14px; color: #006E51;">${formattedValue}</div>
            </div>
          `;
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Funding (£M)',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: (value: number) => {
            return value >= 1000 ? `£${(value / 1000).toFixed(1)}B` : `£${value}M`;
          },
        },
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent',
            },
          },
          data: placeholderData,
        },
        {
          name: 'Funding',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'inside',
          },
          data: visibleData,
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  }, [waterfallData]);
  
  // Check if scenario has adjustments
  const hasAdjustments = waterfallData.newTotal !== waterfallData.totalFunding;
  
  return (
    <div className="w-full">
      {!hasAdjustments && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 No scenario adjustments yet.</strong> Use the scenario controls above to adjust funding levels and see the waterfall visualization.
          </p>
        </div>
      )}
      <div style={{ height: '600px' }}>
        <ReactECharts
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Total Funding</div>
          <div className="text-lg font-semibold text-blue-600">
            £{(waterfallData.totalFunding / 1000).toFixed(1)}B
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Programmes</div>
          <div className="text-lg font-semibold">
            {waterfallData.programmes.length}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${
          hasAdjustments ? 'bg-green-50' : 'bg-gray-50'
        }`}>
          <div className="text-xs text-gray-500 mb-1">
            {hasAdjustments ? 'Scenario Total' : 'Current Total'}
          </div>
          <div className={`text-lg font-semibold ${
            hasAdjustments 
              ? (waterfallData.newTotal > waterfallData.totalFunding ? 'text-green-600' : 'text-red-600')
              : 'text-gray-700'
          }`}>
            £{(waterfallData.newTotal / 1000).toFixed(1)}B
          </div>
        </div>
      </div>
    </div>
  );
}

function getEntityDisplayName(entityId: string): string {
  const entityMap: Record<string, string> = {
    'ukri': 'UKRI Adjustment',
    'ati': 'ATI Programme Adjustment',
    'aff': 'Advanced Fuels Fund Adjustment',
    'iuk': 'Innovate UK Adjustment',
  };
  return entityMap[entityId] || entityId.toUpperCase();
}

