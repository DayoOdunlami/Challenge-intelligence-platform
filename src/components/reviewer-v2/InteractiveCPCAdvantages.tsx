'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Shield, Users, Zap, Building, Target, CheckCircle } from 'lucide-react';
import { cpcAdvantagesData } from '@/data/reviewerData';

const iconMap = {
  "Neutral Convener": Shield,
  "Cross-Sector Credibility": Users,
  "Technical Expertise": Zap,
  "Government Relationships": Building,
  "Mission Alignment": Target
};

export const InteractiveCPCAdvantages = () => {
  const [selectedAdvantage, setSelectedAdvantage] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

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
            Explore Advantages
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className={`px-6 py-2 rounded-md transition-all ${
              showComparison 
                ? 'bg-white text-[#006E51] shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            vs Alternatives
          </button>
        </div>
      </div>

      {!showComparison ? (
        <>
          {/* Interactive Grid */}
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {cpcAdvantagesData.map((advantage, idx) => {
              const IconComponent = iconMap[advantage.advantage as keyof typeof iconMap] || Shield;
              return (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedAdvantage(idx)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    selectedAdvantage === idx
                      ? 'border-[#006E51] bg-[#006E51]/5 shadow-lg'
                      : 'border-gray-200 hover:border-[#006E51]/50 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                    selectedAdvantage === idx ? 'bg-[#006E51]' : 'bg-[#CCE2DC]'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      selectedAdvantage === idx ? 'text-white' : 'text-[#006E51]'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-sm text-[#2E2D2B] mb-2">
                    {advantage.advantage}
                  </h3>
                  <div className={`w-2 h-2 rounded-full mx-auto ${
                    selectedAdvantage === idx ? 'bg-[#006E51]' : 'bg-gray-300'
                  }`}></div>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Advantage Details */}
          <motion.div
            key={selectedAdvantage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-8"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  {(() => {
                    const IconComponent = iconMap[cpcAdvantagesData[selectedAdvantage].advantage as keyof typeof iconMap] || Shield;
                    return (
                      <div className="w-16 h-16 bg-[#006E51] rounded-xl flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-2xl font-bold text-[#2E2D2B]">
                      {cpcAdvantagesData[selectedAdvantage].advantage}
                    </h3>
                    <p className="text-gray-600">
                      {cpcAdvantagesData[selectedAdvantage].description}
                    </p>
                  </div>
                </div>

                <div className="bg-[#006E51]/10 border border-[#006E51]/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-[#006E51]" />
                    <h4 className="font-semibold text-[#006E51]">Evidence</h4>
                  </div>
                  <p className="text-[#006E51]">
                    {cpcAdvantagesData[selectedAdvantage].evidence}
                  </p>
                </div>
              </div>

              <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="font-semibold text-red-800 mb-3">Why Alternatives Fall Short</h4>
                  <p className="text-sm text-red-700">
                    {cpcAdvantagesData[selectedAdvantage].alternative}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        /* Comparison Matrix */
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#2E2D2B]">Capability</th>
                <th className="px-6 py-4 text-center font-semibold text-red-700">Private Companies</th>
                <th className="px-6 py-4 text-center font-semibold text-orange-700">Government Depts</th>
                <th className="px-6 py-4 text-center font-semibold text-blue-700">Academia</th>
                <th className="px-6 py-4 text-center font-semibold text-[#006E51]">Connected Places Catapult</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  capability: "Neutral Convening",
                  private: "❌ Commercial agenda",
                  government: "⚠️ Single-sector focus",
                  academia: "⚠️ Limited industry access",
                  cpc: "✅ Trusted by all parties"
                },
                {
                  capability: "Cross-Sector Credibility",
                  private: "❌ Episodic engagement",
                  government: "❌ Bureaucratic silos",
                  academia: "⚠️ Research-focused",
                  cpc: "✅ Deep relationships across infrastructure"
                },
                {
                  capability: "Technical Capability",
                  private: "✅ Strong tech skills",
                  government: "❌ Limited technical capacity",
                  academia: "⚠️ No commercialization mandate",
                  cpc: "✅ AI/ML + domain expertise"
                },
                {
                  capability: "Policy Influence",
                  private: "❌ No policy access",
                  government: "✅ Direct policy access",
                  academia: "⚠️ Advisory role only",
                  cpc: "✅ Direct relationships with regulators"
                },
                {
                  capability: "Mission Alignment",
                  private: "❌ Profit-first",
                  government: "⚠️ Compliance-first",
                  academia: "⚠️ Research-first",
                  cpc: "✅ Innovation acceleration IS the mission"
                }
              ].map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-[#2E2D2B]">{row.capability}</td>
                  <td className="px-6 py-4 text-center text-sm">{row.private}</td>
                  <td className="px-6 py-4 text-center text-sm">{row.government}</td>
                  <td className="px-6 py-4 text-center text-sm">{row.academia}</td>
                  <td className="px-6 py-4 text-center text-sm font-medium">{row.cpc}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/20 border border-[#006E51]/20 rounded-xl p-6"
      >
        <h4 className="font-bold text-[#006E51] mb-3">The Unique Combination</h4>
        <p className="text-[#2E2D2B]">
          Anyone can scrape procurement data. But turning that into intelligence requires something much harder to replicate: 
          cross-sector credibility, domain expertise, and neutral convening power. CPC is the only organization that combines all five advantages.
        </p>
      </motion.div>
    </div>
  );
};