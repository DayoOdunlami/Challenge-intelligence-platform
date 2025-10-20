'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, X, ArrowRight, Zap } from 'lucide-react';
import { platformComparisonData } from '@/data/reviewerData';

export const InteractivePlatformComparison = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const platforms = platformComparisonData;
  const ourPlatform = platforms.find(p => p.platform.includes("Innovation Exchange"));
  const existingPlatforms = platforms.filter(p => !p.platform.includes("Innovation Exchange"));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toggle View */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setShowComparison(false)}
            className={`px-6 py-2 rounded-md transition-all ${
              !showComparison 
                ? 'bg-white text-[#006E51] shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Current Platforms
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className={`px-6 py-2 rounded-md transition-all ${
              showComparison 
                ? 'bg-white text-[#006E51] shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Side-by-Side Comparison
          </button>
        </div>
      </div>

      {!showComparison ? (
        /* Individual Platform Explorer */
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {existingPlatforms.map((platform, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPlatform(idx)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedPlatform === idx
                  ? 'border-[#006E51] bg-[#006E51]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-sm mb-2">{platform.platform}</h3>
              <p className="text-xs text-gray-600">{platform.model}</p>
            </button>
          ))}
        </div>
      ) : null}

      {!showComparison ? (
        /* Selected Platform Details */
        <motion.div
          key={selectedPlatform}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-[#2E2D2B] mb-4">
                {existingPlatforms[selectedPlatform].platform}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">What it does well:</h4>
                  <ul className="space-y-1">
                    {existingPlatforms[selectedPlatform].strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-700 mb-4">Critical limitations:</h4>
              <ul className="space-y-2 mb-6">
                {existingPlatforms[selectedPlatform].limitations.map((limitation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    {limitation}
                  </li>
                ))}
              </ul>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2">What it can't reveal:</h5>
                <p className="text-sm text-red-700 italic">
                  "{existingPlatforms[selectedPlatform].whatItDoesnt}"
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Side-by-Side Comparison */
        <div className="grid md:grid-cols-2 gap-8">
          {/* Existing Platforms Summary */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800">Current Platforms</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Common Pattern:</h4>
                <p className="text-sm text-red-700">Transactional portals focused on publishing and compliance</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 mb-2">What they all miss:</h4>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Cross-sector pattern detection
                  </li>
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Intelligence layer for decision-making
                  </li>
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Evidence reuse infrastructure
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Our Approach */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#006E51] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#006E51]">Innovation Exchange</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#006E51] mb-2">Different Approach:</h4>
                <p className="text-sm text-green-700">Diagnostic intelligence layer revealing hidden patterns</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#006E51] mb-2">What we enable:</h4>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Cross-sector challenge mapping
                  </li>
                  <li className="flex items-start gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Pattern detection and clustering
                  </li>
                  <li className="flex items-start gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Evidence transfer infrastructure
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg"
      >
        <div className="flex items-start gap-4">
          <ArrowRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">The Gap We Fill</h4>
            <p className="text-blue-700">
              "We're not another place to post challenges. We're the intelligence layer that shows policymakers and buyers where innovation is fragmented, duplicated, or ripe for collaboration. That visibility has never existed before."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};