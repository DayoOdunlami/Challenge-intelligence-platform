"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { HarmonizationAnalysis } from "./HarmonizationAnalysis";

type VisualStatus = "gold" | "experimental" | "legacy";
type VisualOrigin = "Navigate" | "Atlas" | "Toolkit";
type ControlLayout = "panel" | "slideout" | "inline";

export interface VisualEntry {
  id: string;
  title: string;
  description: string;
  origin: VisualOrigin;
  status: VisualStatus;
  layout: ControlLayout;
  controls: string;
  insights?: string;
  render: () => ReactNode;
}

interface VisualLibrarySectionProps {
  sectionId: string;
  title: string;
  description: string;
  badge: VisualOrigin | "Library";
  visuals: VisualEntry[];
  visualType?: string; // e.g., "Network", "Sankey", "Heatmap" - for grouping
  showHarmonization?: boolean; // Show harmonization analysis
}

const statusStyles: Record<VisualStatus, string> = {
  gold: "bg-amber-500/10 text-amber-700 border border-amber-200",
  experimental: "bg-blue-500/10 text-blue-700 border border-blue-200",
  legacy: "bg-gray-500/10 text-gray-700 border border-gray-200",
};

const layoutLabels: Record<ControlLayout, string> = {
  panel: "Panel Layout",
  slideout: "Slide-Out Layout",
  inline: "Inline Controls",
};

export function VisualLibrarySection({
  sectionId,
  title,
  description,
  badge,
  visuals,
  visualType,
  showHarmonization = true,
}: VisualLibrarySectionProps) {
  return (
    <section
      id={sectionId}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-sm border-t border-[#CCE2DC]/50"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="uppercase tracking-widest text-xs">
              {badge} Library
            </Badge>
            <div className="h-px flex-1 bg-gradient-to-r from-[#006E51]/40 to-transparent" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-3xl font-bold text-[#2E2D2B]">{title}</h3>
              <p className="text-gray-600 mt-2 max-w-3xl">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> Gold template
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400" /> Experimental
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" /> Legacy
              </div>
            </div>
          </div>
        </div>

        {/* Harmonization Analysis */}
        {showHarmonization && visualType && visuals.length > 1 && (
          <HarmonizationAnalysis visuals={visuals} visualType={visualType} />
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          {visuals.map((visual) => (
            <div key={visual.id} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-xl font-semibold text-[#2E2D2B]">
                      {visual.title}
                    </h4>
                    <Badge className="bg-[#006E51]/10 text-[#006E51]">
                      {visual.origin}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{visual.description}</p>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[visual.status]}`}
                  >
                    {visual.status === "gold"
                      ? "Gold template"
                      : visual.status === "experimental"
                        ? "Experimental"
                        : "Legacy"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden">
                {visual.render()}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <Badge variant="outline">{layoutLabels[visual.layout]}</Badge>
                <Badge variant="outline" className="text-gray-700 border-gray-200">
                  Controls: {visual.controls}
                </Badge>
                {visual.insights && (
                  <Badge variant="outline" className="text-gray-700 border-gray-200">
                    Insights: {visual.insights}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

