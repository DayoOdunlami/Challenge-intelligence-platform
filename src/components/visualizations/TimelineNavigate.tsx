'use client';

import { useEffect, useRef } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import { hiaRoadmap, roadmapGroups, convertToTimelineFormat, RoadmapItem } from '@/data/roadmap-data';
import { stakeholders, technologies } from '@/data/navigate-dummy-data';

interface TimelineNavigateProps {
  onItemClick?: (item: RoadmapItem) => void;
  height?: number;
  visibleGroups?: string[];
}

export function TimelineNavigate({
  onItemClick,
  height = 600,
  visibleGroups
}: TimelineNavigateProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Convert roadmap data to vis-timeline format
    const { items, groups } = convertToTimelineFormat(hiaRoadmap, roadmapGroups);
    const activeGroups = visibleGroups && visibleGroups.length > 0
      ? visibleGroups
      : roadmapGroups.map(group => group.id);

    const filteredItems = items.filter(item => activeGroups.includes(item.group));
    const filteredGroups = groups.filter(group => activeGroups.includes(group.id));

    // Create DataSet for items
    const itemsDataSet = new DataSet(filteredItems.map(item => ({
      id: item.id,
      content: item.content,
      start: item.start,
      end: item.end,
      group: item.group,
      type: item.type,
      className: item.className,
      title: item.title || item.description
    })));

    // Create DataSet for groups
    const groupsDataSet = new DataSet(filteredGroups.map(group => ({
      id: group.id,
      content: group.content,
      className: group.className,
      order: group.order
    })));

    // Create timeline options
    const options = {
      width: '100%',
      height: height,
      stack: false,
      showCurrentTime: true,
      zoomMin: 1000 * 60 * 60 * 24 * 30, // 1 month
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 30, // 30 years
      orientation: 'top',
      editable: false,
      selectable: true,
      multiselect: false,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      },
      format: {
        minorLabels: {
          month: 'MMM YYYY',
          year: 'YYYY'
        },
        majorLabels: {
          year: 'YYYY'
        }
      },
      groupOrder: 'order',
      groupOrderSwap: (a: any, b: any) => {
        return (a.order || 0) - (b.order || 0);
      }
    };

    // Create timeline
    const timeline = new Timeline(timelineRef.current, itemsDataSet, groupsDataSet, options);

    // Handle item click
    timeline.on('select', (properties: any) => {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];
        const roadmapItem = hiaRoadmap.find(item => item.id === itemId);
        if (roadmapItem && onItemClick) {
          onItemClick(roadmapItem);
        }
      }
    });

    // Handle item hover for tooltip
    timeline.on('itemover', (properties: any) => {
      if (properties.item) {
        const roadmapItem = hiaRoadmap.find(item => item.id === properties.item);
        if (roadmapItem && roadmapItem.description) {
          // Tooltip is handled by vis-timeline's built-in tooltip
        }
      }
    });

    timelineInstanceRef.current = timeline;

    // Cleanup
    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [onItemClick, height, visibleGroups]);

  return (
    <div className="w-full h-full bg-white rounded-lg border border-[#CCE2DC] p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#006E51] mb-2">
          Hydrogen Aviation Decarbonisation Roadmap
        </h3>
        <p className="text-sm text-gray-600">
          Timeline showing milestones across Technology, Infrastructure, Policy, and Skills tracks.
          Source: HIA Report 2024
        </p>
      </div>
      
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {roadmapGroups.map(group => (
          <div key={group.id} className="flex items-center gap-2 opacity-100"
            style={{ opacity: visibleGroups && !visibleGroups.includes(group.id) ? 0.3 : 1 }}>
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor:
                  group.id === 'technology'
                    ? '#006E51'
                    : group.id === 'infrastructure'
                      ? '#50C878'
                      : group.id === 'policy'
                        ? '#F5A623'
                        : '#8b5cf6'
              }}
            ></div>
            <span>{group.content}</span>
          </div>
        ))}
      </div>

      {/* Timeline Container */}
      <div ref={timelineRef} className="w-full" style={{ height: `${height}px` }} />
      
      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Click on items to see details</p>
        <p>• Scroll to zoom, drag to pan</p>
        <p>• Hover for descriptions</p>
      </div>
    </div>
  );
}

