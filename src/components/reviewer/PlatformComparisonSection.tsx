"use client";

import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { StaggeredList, StaggeredItem } from "../animations/ReviewerAnimations";
import { platformComparisonData } from "@/data/reviewerData";

export function PlatformComparisonSection() {
  return (
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Current Services Fail
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The UK already has multiple innovation procurement portals. We analyzed them to understand why cross-sector patterns remain invisible and evidence transfer doesn't happen. Here's what we found:
          </p>
        </div>

        <StaggeredList className="space-y-6">
          {platformComparisonData.map((platform, idx) => {
            const isOurPlatform = platform.platform.includes("Innovation Exchange");
            
            return (
              <StaggeredItem key={idx}>
                <div className={`
                  rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg
                  ${isOurPlatform 
                    ? 'border-cpc-green-500 bg-gradient-to-br from-cpc-green-50 to-green-100' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}>
                  <div className="grid md:grid-cols-6 gap-6">
                    {/* Platform Name & Model */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {platform.platform}
                        {isOurPlatform && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cpc-green-600 text-white">
                            Our Approach
                          </span>
                        )}
                      </h3>
                      <span className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${platform.model === "Transactional" 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-blue-100 text-blue-800'
                        }
                      `}>
                        {platform.model}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        {platform.primaryFunction}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {platform.strengths.map((strength, sidx) => (
                          <li key={sidx} className="text-sm text-gray-700 flex items-start">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        Key Limitations
                      </h4>
                      <ul className="space-y-1 mb-4">
                        {platform.limitations.map((limitation, lidx) => (
                          <li key={lidx} className="text-sm text-gray-700 flex items-start">
                            <XCircle className="w-3 h-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                      
                      {/* What it doesn't do */}
                      <div className={`
                        p-3 rounded-lg text-sm font-medium
                        ${isOurPlatform 
                          ? 'bg-cpc-green-100 text-cpc-green-800' 
                          : 'bg-red-50 text-red-800'
                        }
                      `}>
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        {isOurPlatform ? 'What it does: ' : 'What it doesn\'t do: '}
                        {platform.whatItDoesnt || platform.whatItDoes}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggeredItem>
            );
          })}
        </StaggeredList>

        {/* Key Quote Callout */}
        <StaggeredItem>
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <blockquote className="text-lg italic text-gray-800 mb-4">
              "We're not another place to post challenges. We're the intelligence layer that shows policymakers and buyers where innovation is fragmented, duplicated, or ripe for collaboration. That visibility has never existed before."
            </blockquote>
            <cite className="text-sm font-medium text-blue-700">
              — Red Team Analysis, October 2025
            </cite>
          </div>
        </StaggeredItem>

        {/* Why This Matters */}
        <StaggeredItem>
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why This Matters</h3>
            <div className="prose text-gray-700">
              <p className="mb-4">
                Current platforms are optimized for <strong>transactions</strong> (post → apply → award).
                None are optimized for <strong>PATTERN RECOGNITION</strong>.
              </p>
              <p className="mb-4">That's the gap we fill:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Buyers see duplication they're paying for</li>
                <li>SMEs discover adjacencies they didn't know existed</li>
                <li>Policymakers gain visibility into innovation adoption efficiency</li>
                <li>CPC strengthens its role as the UK's neutral innovation convener</li>
              </ul>
            </div>
          </div>
        </StaggeredItem>
      </div>
    </div>
  );
}