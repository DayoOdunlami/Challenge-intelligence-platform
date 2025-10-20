"use client";

import { Shield, Users, Cog, Building, Heart } from "lucide-react";
import { StaggeredList, StaggeredItem } from "../animations/ReviewerAnimations";
import { cpcAdvantagesData } from "@/data/reviewerData";

const iconMap = {
  "Neutral Convener": Shield,
  "Cross-Sector Credibility": Users,
  "Technical Expertise": Cog,
  "Government Relationships": Building,
  "Mission Alignment": Heart
};

export function WhyCPCSection() {
  return (
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Connected Places Catapult Is Uniquely Positioned
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Anyone can scrape procurement data. But turning that into intelligence requires something much harder to replicate: cross-sector credibility, domain expertise, and neutral convening power.
          </p>
        </div>

        {/* The Moat Visualization */}
        <StaggeredItem>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Our Competitive Moat</h3>
            <div className="relative max-w-2xl mx-auto">
              {/* Concentric circles representing the moat layers */}
              <div className="relative w-96 h-96 mx-auto">
                {/* Outermost circle - Network Effects */}
                <div className="absolute inset-0 rounded-full border-4 border-red-500 bg-red-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-red-800 mb-1">NETWORK EFFECTS</div>
                    <div className="text-xs text-red-700">Nearly Impossible</div>
                  </div>
                </div>
                
                {/* Second circle - Credibility & Trust */}
                <div className="absolute inset-4 rounded-full border-4 border-orange-500 bg-orange-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-orange-800 mb-1">CREDIBILITY & TRUST</div>
                    <div className="text-xs text-orange-700">Very Difficult</div>
                  </div>
                </div>
                
                {/* Third circle - Similarity Engine */}
                <div className="absolute inset-8 rounded-full border-4 border-yellow-500 bg-yellow-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-yellow-800 mb-1">SIMILARITY ENGINE</div>
                    <div className="text-xs text-yellow-700">Moderate</div>
                  </div>
                </div>
                
                {/* Fourth circle - Normalized Taxonomy */}
                <div className="absolute inset-12 rounded-full border-4 border-blue-500 bg-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-blue-800 mb-1">NORMALIZED TAXONOMY</div>
                    <div className="text-xs text-blue-700">Difficult</div>
                  </div>
                </div>
                
                {/* Center circle - Raw Data */}
                <div className="absolute inset-16 rounded-full border-4 border-green-500 bg-green-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-green-800 mb-1">RAW DATA</div>
                    <div className="text-xs text-green-700">Easy</div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-8 flex justify-center">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">Replicability Scale</div>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span>Easy to copy</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                      <span>Impossible to copy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggeredItem>

        {/* Key Quote */}
        <StaggeredItem>
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <blockquote className="text-lg italic text-gray-800 mb-4">
              "Our moat is derived intelligence, not raw data. The dataset becomes exponentially more valuable once challenges are normalized and clustered. We'll own the ontology of UK infrastructure problems — the taxonomy and similarity model that no one else has built."
            </blockquote>
            <cite className="text-sm font-medium text-blue-700">
              — Investor Red Team Response
            </cite>
          </div>
        </StaggeredItem>

        {/* CPC Advantages Grid */}
        <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cpcAdvantagesData.map((advantage, idx) => {
            const IconComponent = iconMap[advantage.advantage as keyof typeof iconMap];
            
            return (
              <StaggeredItem key={idx}>
                <div className="bg-white border border-gray-200 rounded-lg p-6 h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-cpc-green-100 rounded-lg flex items-center justify-center mr-3">
                      <IconComponent className="w-5 h-5 text-cpc-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{advantage.advantage}</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{advantage.description}</p>
                  
                  <div className="space-y-3">
                    <div className="bg-cpc-green-50 border border-cpc-green-200 rounded p-3">
                      <div className="text-xs font-medium text-cpc-green-800 mb-1">EVIDENCE</div>
                      <div className="text-sm text-cpc-green-700">{advantage.evidence}</div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="text-xs font-medium text-red-800 mb-1">ALTERNATIVES FALL SHORT</div>
                      <div className="text-sm text-red-700">{advantage.alternative}</div>
                    </div>
                  </div>
                </div>
              </StaggeredItem>
            );
          })}
        </StaggeredList>

        {/* Summary */}
        <StaggeredItem>
          <div className="mt-12 bg-gradient-to-r from-cpc-green-600 to-cpc-green-700 text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              CPC: The Only Organization With This Unique Combination
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <div className="font-medium">Trusted Neutrality</div>
              </div>
              <div>
                <Users className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <div className="font-medium">Cross-Sector Reach</div>
              </div>
              <div>
                <Cog className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <div className="font-medium">Technical Capability</div>
              </div>
            </div>
            <p className="mt-6 text-cpc-green-100 max-w-2xl mx-auto">
              Private companies lack neutrality. Government departments lack agility. Industry bodies lack technical capability. 
              CPC is the only organization positioned to build and operate this intelligence layer.
            </p>
          </div>
        </StaggeredItem>
      </div>
    </div>
  );
}