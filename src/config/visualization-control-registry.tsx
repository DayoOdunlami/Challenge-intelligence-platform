'use client';

import React from 'react';
import {
  VisualizationControlContext,
  VisualizationControlGroup,
  VisualizationType,
} from '@/components/controls/VisualizationControlSections';
import { TimelineTrack } from '@/types/visualization-controls';

const timelineTrackOptions: { id: TimelineTrack; label: string; helper: string }[] = [
  { id: 'technology', label: 'Technology', helper: 'Aircraft & propulsion' },
  { id: 'infrastructure', label: 'Infrastructure', helper: 'Airport & supply chain' },
  { id: 'policy', label: 'Policy', helper: 'Regulation & funding' },
  { id: 'skills', label: 'Skills', helper: 'Workforce & training' },
];

const circleViewOptions = [
  { id: 'by_stakeholder_type', label: 'By Stakeholder Type' },
  { id: 'by_technology_category', label: 'By Tech Category' },
  { id: 'by_funding', label: 'By Funding' },
];

const treemapViewOptions = [
  { id: 'treemap', label: 'Treemap', helper: 'Rectangular layout' },
  { id: 'sunburst', label: 'Sunburst', helper: 'Radial layout' },
];

const barViewOptions = [
  { id: 'funding_by_stakeholder', label: 'Funding by Stakeholder' },
  { id: 'funding_by_tech', label: 'Funding by Tech' },
  { id: 'projects_by_status', label: 'Projects by Status' },
  { id: 'tech_by_trl', label: 'Tech by TRL' },
];

const chordViewOptions = [
  { id: 'by_stakeholder_type', label: 'Stakeholder Type' },
  { id: 'by_tech_category', label: 'Tech Category' },
  { id: 'by_funding_flow', label: 'Funding Flow' },
];

const heatmapViewOptions = [
  { id: 'trl_vs_category', label: 'TRL vs Category' },
  { id: 'tech_vs_stakeholder', label: 'Tech vs Stakeholder' },
  { id: 'funding_vs_status', label: 'Funding vs Status' },
];

const streamViewOptions = [
  { id: 'by_stakeholder_type', label: 'Stakeholder Type' },
  { id: 'by_tech_category', label: 'Technology Category' },
  { id: 'by_funding_type', label: 'Funding Type' },
];

const swarmViewOptions = [
  { id: 'by_trl', label: 'By TRL Level' },
  { id: 'by_category', label: 'By Category' },
];

const radarDimensionOptions = [
  'TRL Level',
  'Funding (£M)',
  'Market Readiness',
  'Regulatory Status',
  '2030 Maturity',
];

const parallelDimensionOptions = [
  'TRL Level',
  'Funding (£M)',
  'Market Readiness',
  'Regulatory Status',
  '2030 Maturity',
];

const MAX_RADAR_SELECTIONS = 8;

export const visualizationControlRegistry: VisualizationControlGroup[] = [
  {
    id: 'timeline-tracks',
    title: 'Timeline Tracks',
    description: 'Toggle which decarbonisation workstreams appear on the roadmap.',
    appliesTo: ['timeline'],
    render: ({ timelineTracks, toggleTimelineTrack }: VisualizationControlContext) => (
      <div className="space-y-2">
        {timelineTrackOptions.map((option) => {
          const isEnabled = timelineTracks[option.id];
          return (
            <label
              key={option.id}
              className="flex items-center justify-between text-sm text-gray-700 rounded-lg border border-[#CCE2DC] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleTimelineTrack(option.id)}
                  className="accent-[#006E51]"
                />
                <span className="font-medium">{option.label}</span>
              </div>
              <span className="text-xs text-gray-500">{option.helper}</span>
            </label>
          );
        })}
      </div>
    ),
  },
  {
    id: 'circle-view',
    title: 'Hierarchy Focus',
    description: 'Choose how the circle packing clusters the NAVIGATE entities.',
    appliesTo: ['circle'],
    render: ({ circlePackingView, setCirclePackingView }: VisualizationControlContext) => (
      <div className="flex flex-col gap-2">
        {circleViewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setCirclePackingView(option.id as typeof circlePackingView)}
            className={`px-3 py-2 rounded border text-sm text-left ${
              circlePackingView === option.id
                ? 'bg-[#006E51] text-white border-[#006E51]'
                : 'border-[#CCE2DC] text-gray-700 hover:border-[#006E51]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'bump-view',
    title: 'TRL Progression Filters',
    description: 'Highlight all technologies, focus by category, or show top advancing projects.',
    appliesTo: ['bump'],
    render: ({ bumpView, setBumpView, selectedCategories, setSelectedCategories, technologyCategories }: VisualizationControlContext) => (
      <div className="space-y-3">
        <div className="flex flex-col gap-2 text-sm">
          {(['all_technologies', 'by_category', 'top_advancing'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => {
                setBumpView(view);
                if (view !== 'by_category' && selectedCategories.length > 0) {
                  setSelectedCategories([]);
                }
              }}
              className={`px-3 py-2 rounded border ${
                bumpView === view ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
              }`}
            >
              {view === 'all_technologies' ? 'All Technologies' : view === 'by_category' ? 'Filter by Category' : 'Top Advancing'}
            </button>
          ))}
        </div>
        {bumpView === 'by_category' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Select categories to include (multiple).</p>
            <div className="flex flex-wrap gap-2">
              {technologyCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category));
                      } else {
                        setSelectedCategories([...selectedCategories, category]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs ${
                      isSelected ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
                    }`}
                  >
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="text-xs text-[#006E51] underline"
              >
                Clear categories
              </button>
            )}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'treemap-view',
    title: 'View Mode',
    description: 'Toggle between treemap and sunburst layouts with smooth transitions.',
    appliesTo: ['treemap'],
    render: ({ treemapView, setTreemapView }: VisualizationControlContext) => (
      <div className="flex gap-2 text-sm">
        {treemapViewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTreemapView(option.id as typeof treemapView)}
            className={`flex-1 px-3 py-2 rounded border ${
              treemapView === option.id ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
            }`}
          >
            <span className="block font-medium">{option.label}</span>
            {option.helper && (
              <span className={`text-xs ${treemapView === option.id ? 'text-white/80' : 'text-gray-500'}`}>
                {option.helper}
              </span>
            )}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'bar-options',
    title: 'Bar Chart Options',
    description: 'Switch between breakdowns, sorting, and metrics for bar charts.',
    appliesTo: ['bar'],
    render: ({
      barChartView,
      setBarChartView,
      barSortOrder,
      setBarSortOrder,
      barValueMode,
      setBarValueMode,
    }: VisualizationControlContext) => (
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Breakdown</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {barViewOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setBarChartView(option.id as typeof barChartView)}
                className={`px-3 py-2 rounded border ${
                  barChartView === option.id ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Sort Order</p>
          <div className="flex gap-2 text-sm">
            {(['desc', 'asc'] as const).map((order) => (
              <button
                key={order}
                type="button"
                onClick={() => setBarSortOrder(order)}
                className={`flex-1 px-3 py-1.5 rounded border ${
                  barSortOrder === order ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
                }`}
              >
                {order === 'desc' ? 'Highest First' : 'Lowest First'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Values</p>
          <div className="flex gap-2 text-sm">
            {(['absolute', 'percentage'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBarValueMode(mode)}
                className={`flex-1 px-3 py-1.5 rounded border ${
                  barValueMode === mode ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
                }`}
              >
                {mode === 'absolute' ? '£ / Count' : 'Share %'}
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'heatmap-view',
    title: 'Heatmap Matrix',
    description: 'Choose the dataset powering the heatmap matrix.',
    appliesTo: ['heatmap'],
    render: ({ heatmapView, setHeatmapView }: VisualizationControlContext) => (
      <div className="flex flex-col gap-2 text-sm">
        {heatmapViewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setHeatmapView(option.id as typeof heatmapView)}
            className={`px-3 py-2 rounded border ${
              heatmapView === option.id ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'heatmap-scale',
    title: 'Heatmap Scale',
    description: 'Switch between absolute counts and normalized intensity.',
    appliesTo: ['heatmap'],
    render: ({ heatmapColorMode, setHeatmapColorMode }: VisualizationControlContext) => (
      <div className="flex gap-2 text-sm">
        {(['absolute', 'normalized'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setHeatmapColorMode(mode)}
            className={`flex-1 px-3 py-1.5 rounded border ${
              heatmapColorMode === mode ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
            }`}
          >
            {mode === 'absolute' ? 'Absolute' : 'Normalized'}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'chord-mode',
    title: 'Chord Diagram View',
    description: 'Switch between relationship focuses for the chord diagram.',
    appliesTo: ['chord'],
    render: ({ chordView, setChordView }: VisualizationControlContext) => (
      <div className="flex flex-col gap-2 text-sm">
        {chordViewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setChordView(option.id as typeof chordView)}
            className={`px-3 py-2 rounded border ${
              chordView === option.id ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'stream-view',
    title: 'Stream Graph Breakdown',
    description: 'Pick the attribute used to stack the funding streams.',
    appliesTo: ['stream'],
    render: ({ streamView, setStreamView }: VisualizationControlContext) => (
      <div className="flex flex-col gap-2 text-sm">
        {streamViewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setStreamView(option.id as typeof streamView)}
            className={`px-3 py-2 rounded border ${
              streamView === option.id ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'parallel-dimensions',
    title: 'Parallel Dimensions',
    description: 'Toggle the axes shown in the parallel coordinates comparison.',
    appliesTo: ['parallel'],
    render: ({ parallelDimensions, setParallelDimensions }: VisualizationControlContext) => (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 text-xs">
          {parallelDimensionOptions.map((dimension) => {
            const isSelected = parallelDimensions.includes(dimension);
            const disableRemoval = isSelected && parallelDimensions.length === 1;
            return (
              <button
                key={dimension}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    if (disableRemoval) return;
                    setParallelDimensions(parallelDimensions.filter((d) => d !== dimension));
                  } else {
                    setParallelDimensions([...parallelDimensions, dimension]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
                } ${disableRemoval ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {dimension}
              </button>
            );
          })}
        </div>
        {parallelDimensions.length === 0 && (
          <p className="text-xs text-amber-600">Select at least one dimension to render the chart.</p>
        )}
      </div>
    ),
  },
  {
    id: 'swarm-view',
    title: 'Swarm Plot Mode',
    description: 'Adjust the metric used on the swarm plot axes.',
    appliesTo: ['swarm'],
    render: ({ swarmView, setSwarmView }: VisualizationControlContext) => (
      <div className="flex gap-2 text-sm">
        {swarmViewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSwarmView(option.id as typeof swarmView)}
            className={`flex-1 px-3 py-1.5 rounded border ${
              swarmView === option.id ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'radar-selection',
    title: 'Radar Comparison Set',
    description: 'Pick up to 8 technologies and the dimensions to compare.',
    appliesTo: ['radar', 'parallel'],
    render: ({
      filteredTechnologies,
      selectedTechIds,
      setSelectedTechIds,
      selectedDimensions,
      setSelectedDimensions,
    }: VisualizationControlContext) => {
      const sortedTechs = [...filteredTechnologies]
        .sort((a, b) => (b.total_funding || 0) - (a.total_funding || 0))
        .slice(0, 12);
      const toggleTech = (id: string) => {
        if (selectedTechIds.includes(id)) {
          setSelectedTechIds(selectedTechIds.filter((techId) => techId !== id));
        } else if (selectedTechIds.length < MAX_RADAR_SELECTIONS) {
          setSelectedTechIds([...selectedTechIds, id]);
        }
      };

      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Technologies ({selectedTechIds.length}/{MAX_RADAR_SELECTIONS})</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {sortedTechs.map((tech) => {
                const isSelected = selectedTechIds.includes(tech.id);
                const disable = !isSelected && selectedTechIds.length >= MAX_RADAR_SELECTIONS;
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTech(tech.id)}
                    disabled={disable}
                    className={`px-3 py-1.5 rounded-full border ${
                      isSelected ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
                    } ${disable ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {tech.name.length > 18 ? `${tech.name.slice(0, 18)}…` : tech.name}
                  </button>
                );
              })}
            </div>
            {selectedTechIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTechIds([])}
                className="text-xs text-[#006E51] underline mt-1"
              >
                Clear selections
              </button>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Dimensions</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {radarDimensionOptions.map((dimension) => {
                const isSelected = selectedDimensions.includes(dimension);
                return (
                  <button
                    key={dimension}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedDimensions.length === 1) return;
                        setSelectedDimensions(selectedDimensions.filter((d) => d !== dimension));
                      } else {
                        setSelectedDimensions([...selectedDimensions, dimension]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full border ${
                      isSelected ? 'bg-[#006E51] text-white border-[#006E51]' : 'border-[#CCE2DC] text-gray-600'
                    }`}
                  >
                    {dimension}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'network-tuning',
    title: 'Network Tuning',
    description: 'Adjust density and highlighting for the challenge network (NAVIGATE graphs auto-manage these).',
    appliesTo: ['network'],
    render: ({
      useNavigateData,
      similarityThreshold,
      setSimilarityThreshold,
      showClusters,
      setShowClusters,
      isOrbiting,
      setIsOrbiting,
    }: VisualizationControlContext) => (
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Connection sensitivity</span>
            <span className="font-semibold text-[#006E51]">{(similarityThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.8}
            step={0.05}
            value={similarityThreshold}
            onChange={(event) => setSimilarityThreshold(parseFloat(event.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={useNavigateData}
          />
          {useNavigateData && (
            <p className="text-[11px] text-amber-600 mt-1">
              NAVIGATE data uses measured relationships, so connection tuning is disabled.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={showClusters}
              onChange={(event) => setShowClusters(event.target.checked)}
              disabled={useNavigateData}
              className="w-4 h-4 text-[#006E51]"
            />
            Highlight clusters
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={isOrbiting}
              onChange={(event) => setIsOrbiting(event.target.checked)}
              disabled={useNavigateData}
              className="w-4 h-4 text-[#006E51]"
            />
            Auto-orbit
          </label>
        </div>
      </div>
    ),
  },
];

export interface ControlIntentDescriptor {
  id: string;
  label: string;
  controlGroupId: string;
  type: 'toggle' | 'single-select' | 'multi-select';
  options?: string[];
  description?: string;
}

export const controlIntentCatalog: ControlIntentDescriptor[] = [
  {
    id: 'timeline.toggleTrack',
    label: 'Toggle timeline track',
    controlGroupId: 'timeline-tracks',
    type: 'multi-select',
    options: timelineTrackOptions.map(option => option.id),
    description: 'Enable or disable a timeline track such as “technology” or “policy”.',
  },
  {
    id: 'circle.setView',
    label: 'Set circle packing view',
    controlGroupId: 'circle-view',
    type: 'single-select',
    options: circleViewOptions.map(option => option.id),
  },
  {
    id: 'bump.setMode',
    label: 'Set TRL progression mode',
    controlGroupId: 'bump-view',
    type: 'single-select',
    options: ['all_technologies', 'by_category', 'top_advancing'],
  },
  {
    id: 'bump.toggleCategory',
    label: 'Toggle TRL category filter',
    controlGroupId: 'bump-view',
    type: 'multi-select',
    description: 'Only applicable when the bump chart is in “by category” mode.',
  },
  {
    id: 'treemap.setView',
    label: 'Set treemap view mode',
    controlGroupId: 'treemap-view',
    type: 'single-select',
    options: treemapViewOptions.map(option => option.id),
  },
  {
    id: 'bar.setView',
    label: 'Set bar chart view',
    controlGroupId: 'bar-options',
    type: 'single-select',
    options: barViewOptions.map(option => option.id),
  },
  {
    id: 'bar.setSort',
    label: 'Set bar chart sort',
    controlGroupId: 'bar-options',
    type: 'single-select',
    options: ['asc', 'desc'],
  },
  {
    id: 'bar.setValueMode',
    label: 'Set bar chart value mode',
    controlGroupId: 'bar-options',
    type: 'single-select',
    options: ['absolute', 'percentage'],
  },
  {
    id: 'heatmap.setMatrix',
    label: 'Set heatmap matrix',
    controlGroupId: 'heatmap-view',
    type: 'single-select',
    options: heatmapViewOptions.map(option => option.id),
  },
  {
    id: 'heatmap.setScale',
    label: 'Set heatmap scale',
    controlGroupId: 'heatmap-scale',
    type: 'single-select',
    options: ['absolute', 'normalized'],
  },
  {
    id: 'chord.setView',
    label: 'Set chord diagram view',
    controlGroupId: 'chord-mode',
    type: 'single-select',
    options: chordViewOptions.map(option => option.id),
  },
  {
    id: 'stream.setView',
    label: 'Set stream graph breakdown',
    controlGroupId: 'stream-view',
    type: 'single-select',
    options: streamViewOptions.map(option => option.id),
  },
  {
    id: 'parallel.setDimensions',
    label: 'Toggle parallel dimensions',
    controlGroupId: 'parallel-dimensions',
    type: 'multi-select',
    options: parallelDimensionOptions,
  },
  {
    id: 'swarm.setView',
    label: 'Set swarm plot view',
    controlGroupId: 'swarm-view',
    type: 'single-select',
    options: swarmViewOptions.map(option => option.id),
  },
  {
    id: 'radar.toggleTechnology',
    label: 'Toggle radar technology selection',
    controlGroupId: 'radar-selection',
    type: 'multi-select',
    description: 'Adds or removes a technology from the radar comparison (max 8).',
  },
  {
    id: 'radar.toggleDimension',
    label: 'Toggle radar dimension',
    controlGroupId: 'radar-selection',
    type: 'multi-select',
    options: radarDimensionOptions,
  },
  {
    id: 'network.toggleCluster',
    label: 'Toggle network cluster highlighting',
    controlGroupId: 'network-tuning',
    type: 'toggle',
    options: ['showClusters'],
  },
];

export const CONTROL_SUPPORTED_VISUALIZATIONS: VisualizationType[] = Array.from(
  new Set(visualizationControlRegistry.flatMap((group) => group.appliesTo)),
);

