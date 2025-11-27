'use client';

import { useMemo, useState, useCallback, useEffect, ReactNode } from 'react';
import { buildCirclePackingMaps, getHighlightedIds } from '@/lib/circlePackingRelationships';
import { D3NetworkGraphView } from '@/components/toolkit/D3NetworkGraphView';
import { CirclePackingNode } from '@/data/toolkit/circlePackingData';

interface D3NetworkGraphToolkitProps {
  onExternalControlsChange?: (controls: ReactNode | null) => void;
  onEntitySelect?: (entity: { type: 'stakeholder' | 'technology' | 'project' | 'funding'; id: string; data: any } | null) => void;
  defaultInlineInsights?: boolean;
  inlineInsightsLocked?: boolean;
}

export function D3NetworkGraphToolkit({
  onExternalControlsChange,
  onEntitySelect,
  defaultInlineInsights = true,
  inlineInsightsLocked = false,
}: D3NetworkGraphToolkitProps) {
  const { nodeMap, adjacency } = useMemo(() => buildCirclePackingMaps(), []);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const highlightedIds = useMemo(
    () => getHighlightedIds(selectedEntityId, adjacency),
    [selectedEntityId, adjacency]
  );

  const selectedNode = selectedEntityId ? nodeMap[selectedEntityId] : null;
  const relatedEntities = useMemo(() => {
    if (!selectedEntityId) return [];
    const relatedIds = adjacency[selectedEntityId];
    if (!relatedIds) return [];
    return Array.from(relatedIds)
      .map((id) => nodeMap[id])
      .filter((node): node is CirclePackingNode => Boolean(node));
  }, [selectedEntityId, adjacency, nodeMap]);

  const [showEmbeddedControls, setShowEmbeddedControls] = useState(true);
  const [showEmbeddedInsights, setShowEmbeddedInsights] = useState(defaultInlineInsights);
  const [controlsRenderer, setControlsRenderer] = useState<(() => ReactNode) | null>(null);

  const handleControlsRender = useCallback((renderFn: (() => ReactNode) | null) => {
    setControlsRenderer(() => renderFn);
  }, []);

  useEffect(() => {
    if (inlineInsightsLocked) {
      setShowEmbeddedInsights(false);
      return;
    }
    setShowEmbeddedInsights(defaultInlineInsights);
  }, [defaultInlineInsights, inlineInsightsLocked]);

  useEffect(() => {
    if (!onEntitySelect) return;
    if (selectedNode && selectedNode.id) {
      onEntitySelect({
        type: 'stakeholder',
        id: selectedNode.id,
        data: {
          ...selectedNode,
          entityType: selectedNode.type,
          relatedEntities: relatedEntities, // Include related entities for insights panel
        },
      });
    } else {
      onEntitySelect(null);
    }
  }, [selectedNode, relatedEntities, onEntitySelect]);

  const externalControls = useMemo(() => {
    if (!controlsRenderer) return null;
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-3 border-b border-[#CCE2DC] flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold text-[#006E51]">Toolkit Network Controls</p>
            <p className="text-xs text-gray-500">Mirrors the embedded control layout</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                showEmbeddedControls
                  ? 'border-[#006E51] text-[#006E51] hover:bg-[#006E51]/10'
                  : 'border-slate-300 text-slate-500 hover:bg-slate-100'
              }`}
              onClick={() => setShowEmbeddedControls((prev) => !prev)}
            >
              {showEmbeddedControls ? 'Hide Inline Controls' : 'Show Inline Controls'}
            </button>
            {!inlineInsightsLocked && (
              <button
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  showEmbeddedInsights
                    ? 'border-[#006E51] text-[#006E51] hover:bg-[#006E51]/10'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setShowEmbeddedInsights((prev) => !prev)}
              >
                {showEmbeddedInsights ? 'Hide Inline Insights' : 'Show Inline Insights'}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1 py-3">
          {controlsRenderer()}
        </div>
      </div>
    );
  }, [controlsRenderer, showEmbeddedControls, showEmbeddedInsights]);

  useEffect(() => {
    if (!onExternalControlsChange) return;
    onExternalControlsChange(externalControls);
  }, [externalControls, onExternalControlsChange]);

  useEffect(() => {
    return () => {
      onExternalControlsChange?.(null);
    };
  }, [onExternalControlsChange]);

  return (
    <div className="w-full h-full">
      <D3NetworkGraphView
        selectedId={selectedEntityId}
        highlightedIds={highlightedIds}
        selectedNode={selectedNode}
        relatedEntities={relatedEntities}
        onSelectNodeAction={setSelectedEntityId}
        showEmbeddedControls={showEmbeddedControls}
        showEmbeddedInsights={showEmbeddedInsights}
        onControlsRender={handleControlsRender}
        onControlsVisibilityChange={setShowEmbeddedControls}
        onInsightsVisibilityChange={inlineInsightsLocked ? undefined : setShowEmbeddedInsights}
        insightsToggleEnabled={!inlineInsightsLocked}
      />
    </div>
  );
}

