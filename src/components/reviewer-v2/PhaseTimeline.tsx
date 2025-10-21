'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Target, Zap, Rocket, Building } from 'lucide-react';
import { pocDeliverablesData, phase1OptionsData, phaseData } from '@/data/reviewerData';

export const PhaseTimeline = () => {
  const [selectedPhase1Option, setSelectedPhase1Option] = useState<'optionA' | 'optionB' | 'optionC'>('optionC');
  const [showFloatingSelector, setShowFloatingSelector] = useState(false);

  // Scroll detection for floating selector - only show within timeline section
  useEffect(() => {
    const handleScroll = () => {
      // Find the timeline section and initial selector elements
      const timelineElement = document.getElementById('phase-timeline-section');
      const initialSelector = document.getElementById('initial-phase1-selector');
      
      if (!timelineElement || !initialSelector) return;

      const timelineRect = timelineElement.getBoundingClientRect();
      const selectorRect = initialSelector.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Show floating selector when:
      // 1. Initial selector has scrolled out of view (top is above viewport)
      // 2. We're still within the timeline section bounds
      // 3. Timeline section hasn't completely scrolled past
      
      const initialSelectorOutOfView = selectorRect.bottom < 100; // 100px buffer
      const timelineStillVisible = timelineRect.bottom > windowHeight * 0.2; // Keep some buffer
      const timelineInBounds = timelineRect.top < windowHeight;
      
      const shouldShow = initialSelectorOutOfView && timelineStillVisible && timelineInBounds;
      
      setShowFloatingSelector(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const getOptionIcon = (optionId: string) => {
    switch (optionId) {
      case 'rapid-prototype':
        return <Zap className="w-5 h-5" />;
      case 'validation-mvp':
        return <Target className="w-5 h-5" />;
      case 'full-build':
        return <Rocket className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  const getOptionColor = (optionId: string) => {
    switch (optionId) {
      case 'rapid-prototype':
        return 'from-blue-500 to-cyan-500';
      case 'validation-mvp':
        return 'from-orange-500 to-yellow-500';
      case 'full-build':
        return 'from-[#006E51] to-green-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const currentPhase1Option = phase1OptionsData[selectedPhase1Option];

  // Floating selector component
  const FloatingPhase1Selector = () => (
    <AnimatePresence>
      {showFloatingSelector && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed left-4 top-1/3 z-50 bg-white/95 backdrop-blur-md border border-[#006E51]/20 rounded-xl shadow-xl p-4 max-w-xs"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#006E51] rounded-full animate-pulse"></div>
            <h4 className="text-sm font-semibold text-[#006E51]">Phase 1 Options</h4>
          </div>
          <p className="text-xs text-gray-500 mb-3">Switch between investment levels</p>
          <div className="space-y-2">
            {Object.entries(phase1OptionsData).map(([key, option]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedPhase1Option(key as 'optionA' | 'optionB' | 'optionC')}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedPhase1Option === key
                    ? 'border-[#006E51] bg-[#006E51]/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1 rounded bg-gradient-to-r ${getOptionColor(option.id)} text-white`}>
                    {getOptionIcon(option.id)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#2E2D2B]">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.investment}</div>
                  </div>
                </div>
                {selectedPhase1Option === key && (
                  <div className="text-xs text-[#006E51] font-medium">Currently viewing</div>
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Timeline context indicator */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-400 text-center">Timeline Navigation</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div id="phase-timeline-section" className="max-w-6xl mx-auto relative">
      {/* Floating Phase 1 Selector */}
      <FloatingPhase1Selector />
      {/* Phase 1 Option Selector */}
      <div id="initial-phase1-selector" className="mb-12 text-center">
        <h3 className="text-2xl font-bold text-[#2E2D2B] mb-4">Choose Your Phase 1 Path</h3>
        <p className="text-gray-600 mb-6">Each option builds on the completed Proof of Concept with different levels of investment and capability</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {Object.entries(phase1OptionsData).map(([key, option]) => (
            <motion.button
              key={key}
              onClick={() => setSelectedPhase1Option(key as 'optionA' | 'optionB' | 'optionC')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedPhase1Option === key
                  ? 'border-[#006E51] bg-[#006E51]/5 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getOptionColor(option.id)} text-white`}>
                  {getOptionIcon(option.id)}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#2E2D2B]">{option.name}</h4>
                  <p className="text-sm text-gray-600">{option.subtitle}</p>
                </div>
              </div>
              <div className="text-left space-y-1">
                <p className="text-sm text-gray-700">{option.goal}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{option.timeline}</span>
                  <span>{option.investment}</span>
                </div>
              </div>
              
              {selectedPhase1Option === key && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-[#006E51] bg-[#006E51]/5"
                  layoutId="selectedOption"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Timeline line - positioned behind cards */}
        <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-[#006E51] via-purple-400 to-indigo-500 z-0"></div>

        {/* Proof of Concept (Completed) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-xl"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-green-800">Proof of Concept</h3>
                <p className="text-sm text-green-600">Technical Proof (Completed)</p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8 relative z-10">
            {pocDeliverablesData.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
              >
                <motion.div
                  className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} z-20 relative`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="relative overflow-hidden rounded-xl border-2 bg-green-50 border-green-200 p-6 transition-all duration-300 hover:shadow-lg shadow-sm">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-green-300/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-[#2E2D2B]">{item.deliverable}</h4>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Complete
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{item.description}</p>
                          <p className="text-sm text-gray-600 italic">{item.evidence}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline dot - positioned above cards */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
                  <motion.div
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 1 Options (Dynamic) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#006E51]/10 border-2 border-[#006E51]/30 rounded-xl"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getOptionColor(currentPhase1Option.id)} text-white`}>
                {getOptionIcon(currentPhase1Option.id)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#006E51]">Phase 1: {currentPhase1Option.name}</h3>
                <p className="text-sm text-gray-600">{currentPhase1Option.goal}</p>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPhase1Option}
              className="space-y-8 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentPhase1Option.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                >
                  <motion.div
                    className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} z-20 relative`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="relative overflow-hidden rounded-xl border-2 bg-[#006E51]/5 border-[#006E51]/20 p-6 transition-all duration-300 hover:shadow-lg shadow-sm">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <Calendar className="w-5 h-5 text-[#006E51]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-[#2E2D2B]">{milestone.deliverable}</h4>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#006E51]/10 text-[#006E51]">
                                Planned
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{milestone.description}</p>
                            <p className="text-sm text-gray-600 italic">{milestone.evidence}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline dot - positioned above cards */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
                    <motion.div
                      className="w-6 h-6 rounded-full bg-[#006E51] flex items-center justify-center shadow-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Phase 2 */}
        <div className="relative z-10 flex items-center md:flex-row mb-16">
          <motion.div
            className="w-full md:w-1/2 md:pr-12 z-20 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 bg-purple-50 p-6 transition-all duration-300 hover:shadow-lg shadow-sm">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-purple-300/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2D2B]">{phaseData.phase2.title}</h3>
                    <p className="text-sm text-gray-600">{phaseData.phase2.timeline} • {phaseData.phase2.status}</p>
                  </div>
                </div>
                <p className="text-gray-600">{phaseData.phase2.description}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Enhanced SME + buyer profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>AI-powered matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>4-6 sector coaching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Collaboration APIs</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline dot - positioned above cards */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
            <motion.div
              className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center shadow-md"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </motion.div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="relative z-10 flex items-center md:flex-row-reverse">
          <motion.div
            className="w-full md:w-1/2 md:pl-12 z-20 relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6 transition-all duration-300 hover:shadow-lg shadow-sm">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-indigo-300/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2D2B]">{phaseData.phase3.title}</h3>
                    <p className="text-sm text-gray-600">{phaseData.phase3.timeline} • {phaseData.phase3.status}</p>
                  </div>
                </div>
                <p className="text-gray-600">{phaseData.phase3.description}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Evidence Vault launch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Innovation Passport pilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>8+ sector adoption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Cross-sector evidence acceptance</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline dot - positioned above cards */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
            <motion.div
              className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-md"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

