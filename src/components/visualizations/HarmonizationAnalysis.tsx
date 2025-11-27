"use client";

import { VisualEntry } from "./VisualLibrarySection";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Lightbulb, Database, Layout, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HarmonizationIssue {
  type: "control" | "insight" | "data" | "layout" | "opportunity";
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  affectedVisuals: string[];
}

interface HarmonizationAnalysisProps {
  visuals: VisualEntry[];
  visualType: string; // e.g., "Network", "Sankey", "Heatmap"
}

export function HarmonizationAnalysis({ visuals, visualType }: HarmonizationAnalysisProps) {
  if (visuals.length < 2) {
    return null; // No analysis needed for single visuals
  }

  const issues: HarmonizationIssue[] = [];
  const opportunities: HarmonizationIssue[] = [];

  // Analyze control layouts
  const layouts = visuals.map(v => v.layout);
  const uniqueLayouts = new Set(layouts);
  if (uniqueLayouts.size > 1) {
    issues.push({
      type: "layout",
      severity: "warning",
      message: `${uniqueLayouts.size} different control layouts detected`,
      suggestion: "Consider standardizing on a single layout (panel recommended for consistency)",
      affectedVisuals: visuals.map(v => v.id),
    });
  }

  // Analyze control descriptions
  const controlPatterns = visuals.map(v => v.controls?.toLowerCase() || '');
  const hasInconsistentControls = controlPatterns.length > 0 && new Set(controlPatterns).size > 1;
  if (hasInconsistentControls) {
    issues.push({
      type: "control",
      severity: "warning",
      message: "Inconsistent control implementations",
      suggestion: "Create a unified control interface that can be shared across similar visualizations",
      affectedVisuals: visuals.map(v => v.id),
    });
  }

  // Analyze insights
  const hasInsights = visuals.filter(v => v.insights).length;
  const missingInsights = visuals.length - hasInsights;
  if (missingInsights > 0) {
    issues.push({
      type: "insight",
      severity: "info",
      message: `${missingInsights} visualization(s) missing insight panels`,
      suggestion: "Add consistent insight panels to all visualizations of this type",
      affectedVisuals: visuals.filter(v => !v.insights).map(v => v.id),
    });
  }

  // Check for templating opportunities
  const sameLayout = uniqueLayouts.size === 1;
  const similarControls = controlPatterns && controlPatterns.length > 0 && controlPatterns.some((pattern, i) => 
    controlPatterns.slice(i + 1).some(p => 
      pattern && p && (pattern.includes(p.split(' ')[0]) || p.includes(pattern.split(' ')[0]))
    )
  );

  if (sameLayout && similarControls && visuals.length >= 2) {
    opportunities.push({
      type: "opportunity",
      severity: "info",
      message: "Templating opportunity detected",
      suggestion: `These ${visuals.length} visualizations could share a common template with dynamic data binding`,
      affectedVisuals: visuals.map(v => v.id),
    });
  }

  // Check for data schema inconsistencies
  const origins = new Set(visuals.map(v => v.origin));
  if (origins.size > 1) {
    opportunities.push({
      type: "data",
      severity: "info",
      message: "Multiple data sources detected",
      suggestion: "Consider creating data adapters to allow these visualizations to share the same data format",
      affectedVisuals: visuals.map(v => v.id),
    });
  }

  // Check status consistency
  const statuses = visuals.map(v => v.status);
  const hasGold = statuses.includes("gold");
  const hasMultipleStatuses = new Set(statuses).size > 1;
  
  if (hasMultipleStatuses && !hasGold) {
    opportunities.push({
      type: "opportunity",
      severity: "info",
      message: "No gold standard identified",
      suggestion: "Select one visualization as the gold standard to guide harmonization",
      affectedVisuals: visuals.map(v => v.id),
    });
  }

  if (issues.length === 0 && opportunities.length === 0) {
    return (
      <Card className="mt-4 border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">All visualizations are consistent</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {issues.map((issue, idx) => {
        const severityStyles = {
          error: "border-red-200 bg-red-50/50",
          warning: "border-amber-200 bg-amber-50/50",
          info: "border-blue-200 bg-blue-50/50",
        };
        const severityColors = {
          error: "text-red-600 text-red-800",
          warning: "text-amber-600 text-amber-800",
          info: "text-blue-600 text-blue-800",
        };
        const [iconColor, textColor] = severityColors[issue.severity].split(" ");
        
        return (
        <Card 
          key={`issue-${idx}`} 
          className={severityStyles[issue.severity]}
        >
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${iconColor}`} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {issue.type === "control" && <Layout className="h-3 w-3 mr-1" />}
                    {issue.type === "insight" && <Eye className="h-3 w-3 mr-1" />}
                    {issue.type === "data" && <Database className="h-3 w-3 mr-1" />}
                    {issue.type === "layout" && <Layout className="h-3 w-3 mr-1" />}
                    {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                  </Badge>
                  <span className={`text-sm font-medium ${textColor}`}>
                    {issue.message}
                  </span>
                </div>
                {issue.suggestion && (
                  <p className="text-xs text-gray-600">{issue.suggestion}</p>
                )}
                <div className="text-xs text-gray-500">
                  Affects: {issue.affectedVisuals.length} visualization(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}

      {opportunities.map((opp, idx) => (
        <Card 
          key={`opp-${idx}`} 
          className="border-purple-200 bg-purple-50/50"
        >
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 mt-0.5 text-purple-600" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-300">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Opportunity
                  </Badge>
                  <span className="text-sm font-medium text-purple-800">
                    {opp.message}
                  </span>
                </div>
                {opp.suggestion && (
                  <p className="text-xs text-gray-600">{opp.suggestion}</p>
                )}
                <div className="text-xs text-gray-500">
                  Affects: {opp.affectedVisuals.length} visualization(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

