'use client';

import dynamic from 'next/dynamic';
import { type VisualizationConfig, type Domain } from '@/lib/visualisations/registry';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface VisualCardProps {
  visualization: VisualizationConfig;
  onClick: (vizId: string) => void;
}

const DOMAIN_CONFIG: Record<Domain, { label: string; color: string; abbrev: string }> = {
  atlas: { label: 'Atlas', color: '#4A90E2', abbrev: 'A' },
  navigate: { label: 'Navigate', color: '#50C878', abbrev: 'N' },
  cpc: { label: 'CPC', color: '#F5A623', abbrev: 'C' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ready: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ready' },
  development: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Dev' },
  placeholder: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Planned' },
};

export function VisualCard({ visualization, onClick }: VisualCardProps) {
  const { id, name, description, domains, status, demoOption, category, icon: Icon } = visualization;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.placeholder;

  return (
    <div
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#006E51]/30 cursor-pointer"
      onClick={() => onClick(id)}
    >
      {/* Live Chart Preview */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        {demoOption ? (
          <div className="absolute inset-0 pointer-events-none">
            <ReactECharts
              option={demoOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
              lazyUpdate
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-[#CCE2DC]/50 flex items-center justify-center">
              {Icon ? (
                <Icon className="h-8 w-8 text-[#006E51]/40" />
              ) : (
                <div className="w-8 h-8 rounded bg-[#006E51]/20" />
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </div>

        {/* Category Badge */}
        {category && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-600 border border-gray-200">
            {category}
          </div>
        )}

        {/* Domain Dots - Informational only */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {domains.map((domain) => (
            <div
              key={domain}
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: DOMAIN_CONFIG[domain].color }}
              title={DOMAIN_CONFIG[domain].label}
            />
          ))}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#006E51]/0 group-hover:bg-[#006E51]/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-4 py-2 bg-white/95 rounded-full text-sm font-medium text-[#006E51] shadow-lg">
            Preview
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-[#006E51] transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
        
        {/* Domain labels */}
        <div className="flex flex-wrap gap-1 mt-3">
          {domains.map((domain) => (
            <span
              key={domain}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ 
                backgroundColor: `${DOMAIN_CONFIG[domain].color}15`,
                color: DOMAIN_CONFIG[domain].color 
              }}
            >
              {DOMAIN_CONFIG[domain].abbrev}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
