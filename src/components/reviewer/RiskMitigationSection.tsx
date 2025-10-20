"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, Shield, Target } from "lucide-react";
import { StaggeredList, StaggeredItem } from "../animations/ReviewerAnimations";
import { riskAnalysisData } from "@/data/reviewerData";

export function RiskMitigationSection() {
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'border-red-500 bg-red-50';
      case 'High': return 'border-orange-500 bg-orange-50';
      case 'Medium-High': return 'border-yellow-500 bg-yellow-50';
      case 'Medium': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium-High': return 'bg-yellow-600 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getProbabilityBadgeColor = (probability: string) => {
    switch (probability) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            We've Stress-Tested This Approach
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We conducted red team analysis to identify every way this could fail. Here are the top risks, our mitigation strategies, and how Phase 1 tests each assumption before scaling.
          </p>
        </div>

        {/* Risk Summary Stats */}
        <StaggeredItem>
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-600">Critical Risk</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-gray-600">High Risks</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-gray-600">Medium Risks</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cpc-green-600">5</div>
              <div className="text-sm text-gray-600">Mitigated</div>
            </div>
          </div>
        </StaggeredItem>

        {/* Risk Accordion */}
        <StaggeredList className="space-y-4">
          {riskAnalysisData.map((risk) => (
            <StaggeredItem key={risk.id}>
              <div className={`border-l-4 rounded-lg transition-all duration-300 ${getRiskColor(risk.impact)}`}>
                <button
                  onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                  className="w-full p-6 text-left hover:bg-white/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{risk.risk}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getImpactBadgeColor(risk.impact)}`}>
                        {risk.impact}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityBadgeColor(risk.probability)}`}>
                        {risk.probability} Probability
                      </span>
                    </div>
                    {expandedRisk === risk.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <p className="text-gray-700 mt-2">{risk.description}</p>
                </button>

                {expandedRisk === risk.id && (
                  <div className="px-6 pb-6 space-y-6 bg-white/70">
                    {/* Red Team Quote */}
                    <blockquote className="border-l-4 border-yellow-400 pl-4 py-2 bg-yellow-50 italic text-gray-700">
                      <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-600" />
                      "{risk.redTeamQuote}"
                    </blockquote>

                    {/* Our Mitigation */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-cpc-green-600" />
                        Our Mitigation Strategy
                      </h4>
                      <ul className="space-y-2">
                        {risk.ourMitigation.map((mitigation, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <div className="w-2 h-2 bg-cpc-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            {mitigation}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Phase 1 Test */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Phase 1 Test
                      </h4>
                      <p className="text-blue-800 text-sm">{risk.phase1Test}</p>
                    </div>

                    {/* Evidence */}
                    {risk.mitigationEvidence && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Evidence:</strong> {risk.mitigationEvidence}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </StaggeredItem>
          ))}
        </StaggeredList>

        {/* Summary Message */}
        <StaggeredItem>
          <div className="mt-12 bg-gradient-to-r from-cpc-green-50 to-green-100 border border-cpc-green-200 rounded-lg p-6 text-center">
            <Shield className="w-8 h-8 text-cpc-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-cpc-green-900 mb-2">
              Every Risk Has Specific Mitigation & Phase 1 Validation
            </h3>
            <p className="text-cpc-green-800">
              We don't just acknowledge risks—we've built concrete tests to validate our assumptions before scaling.
            </p>
          </div>
        </StaggeredItem>
      </div>
    </div>
  );
}