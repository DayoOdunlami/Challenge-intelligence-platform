"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Lightbulb, ArrowRight, MessageCircle } from "lucide-react";
import { Challenge } from "@/lib/types";

interface InsightsSummaryProps {
  challenges: Challenge[];
  activeVisualization: string;
  selectedElement?: any;
  selectedChallenge?: Challenge | null;
}

export function InsightsSummary({ 
  challenges, 
  activeVisualization, 
  selectedElement, 
  selectedChallenge 
}: InsightsSummaryProps) {
  
  // Generate top 3 insights based on current context
  const generateInsights = () => {
    const insights = [];
    
    if (selectedChallenge) {
      // Challenge-specific insights
      const sectorChallenges = challenges.filter(c => c.sector.primary === selectedChallenge.sector.primary);
      const similarBudget = challenges.filter(c => 
        Math.abs((c.funding.amount_max || 0) - (selectedChallenge.funding.amount_max || 0)) < 1000000
      );
      
      insights.push({
        type: 'trend',
        title: 'Sector Pattern',
        description: `${sectorChallenges.length} challenges in ${selectedChallenge.sector.primary} sector`,
        action: 'Explore cross-sector opportunities',
        impact: 'high'
      });
      
      if (similarBudget.length > 3) {
        insights.push({
          type: 'opportunity',
          title: 'Budget Alignment',
          description: `${similarBudget.length} challenges with similar funding levels`,
          action: 'Consider consortium approach',
          impact: 'medium'
        });
      }
    } else {
      // General dataset insights
      const sectors = [...new Set(challenges.map(c => c.sector.primary))];
      const criticalChallenges = challenges.filter(c => c.timeline.urgency === 'critical');
      const totalFunding = challenges.reduce((sum, c) => sum + (c.funding.amount_max || 0), 0);
      
      insights.push({
        type: 'trend',
        title: 'Cross-Sector Opportunity',
        description: `${sectors.length} sectors with ${challenges.length} active challenges`,
        action: 'Identify pattern overlaps',
        impact: 'high'
      });
      
      if (criticalChallenges.length > 0) {
        insights.push({
          type: 'alert',
          title: 'Urgent Challenges',
          description: `${criticalChallenges.length} critical challenges need immediate attention`,
          action: 'Prioritize rapid solutions',
          impact: 'critical'
        });
      }
      
      insights.push({
        type: 'opportunity',
        title: 'Market Size',
        description: `£${Math.round(totalFunding / 1000000)}M total funding available`,
        action: 'Explore high-value opportunities',
        impact: 'high'
      });
    }
    
    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-[#006E51] to-green-600';
      case 'medium': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#006E51]">Key Insights</h3>
        <div className="text-xs text-gray-500">
          {selectedChallenge ? 'Challenge-specific' : 'Dataset overview'}
        </div>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 backdrop-blur-sm border border-[#CCE2DC]/50 rounded-lg p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getColor(insight.impact)} text-white flex-shrink-0`}>
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[#2E2D2B] mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                <button className="flex items-center gap-1 text-xs text-[#006E51] hover:text-[#005A42] font-medium">
                  {insight.action}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Context-aware tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-blue-800 mb-1">Pro Tip</div>
            <div className="text-blue-700">
              {activeVisualization === 'network' && 'Drag nodes to explore connections, adjust similarity to reveal patterns.'}
              {activeVisualization === 'heatmap' && 'Click cells to drill down into sector-problem intersections.'}
              {activeVisualization === 'sankey' && 'Follow the flows to understand challenge progression pathways.'}
              {activeVisualization === 'sunburst' && 'Click segments to zoom into hierarchical relationships.'}
              {activeVisualization === 'chord' && 'Hover over arcs to see cross-sector dependencies.'}
            </div>
          </div>
        </div>
      </div>

      {/* Future Feature Teaser */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <MessageCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-purple-800 mb-1">Coming Soon: AI Assistant</div>
            <div className="text-purple-700">
              Ask questions like "Show me energy challenges similar to this rail solution" or "What patterns exist in transport procurement?"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}