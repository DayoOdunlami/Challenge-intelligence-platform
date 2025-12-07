"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, BarChart3, FileText, ChevronDown, 
  Target, Users, User, TestTube, Network, Sun, 
  GitBranch, Zap, Archive, Wrench
} from "lucide-react";
import Link from "next/link";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  description?: string;
  current?: boolean;
}

interface UnifiedFloatingNavProps {
  currentPage: 'home' | 'navigate' | 'toolkit' | 'visualizations' | 'visualisations' | 'reviewer' | 'innovator-profile' | 'owner-profile';
  // For reviewer page - section navigation
  sections?: Array<{
    id: string;
    label: string;
    current?: boolean;
  }>;
  // For visualizations page - visualization types
  visualizations?: Array<{
    id: string;
    name: string;
    icon: any;
    current?: boolean;
    onClick?: () => void;
  }>;
}

export function UnifiedFloatingNav({ 
  currentPage, 
  sections = [], 
  visualizations = [] 
}: UnifiedFloatingNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMainPlatform, setShowMainPlatform] = useState(false); // Collapsed by default
  const [showArchive, setShowArchive] = useState(true); // Open by default

  // Main platform pages (NAVIGATE and Data Visualizations moved to archive)
  const mainPages: NavItem[] = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home, 
      description: "Platform overview",
      current: currentPage === 'home'
    },
    { 
      name: "Toolkit", 
      href: "/toolkit", 
      icon: Wrench, 
      description: "Stakeholder dynamics and innovation tracker",
      current: currentPage === 'toolkit'
    },
    { 
      name: "Visual Library", 
      href: "/visualisations", 
      icon: BarChart3, 
      description: "Sparkworks visualization library",
      current: currentPage === 'visualisations'
    },
    { 
      name: "For Reviewers", 
      href: "/for-reviewers-v2", 
      icon: FileText, 
      description: "Enhanced reviewer response",
      current: currentPage === 'reviewer'
    },
    { 
      name: "Innovator Profile", 
      href: "/profile/sme-profile", 
      icon: Users, 
      description: "Innovator journey example",
      current: currentPage === 'innovator-profile'
    },
    { 
      name: "Challenge Owner Profile", 
      href: "/profile/buyer-example", 
      icon: User, 
      description: "Challenge owner journey example",
      current: currentPage === 'owner-profile'
    },
  ];

  // Archive pages (includes NAVIGATE and Data Visualizations)
  const archivePages: NavItem[] = [
    { 
      name: "NAVIGATE", 
      href: "/navigate", 
      icon: Network, 
      description: "Zero-emission aviation intelligence platform",
      current: currentPage === 'navigate'
    },
    { 
      name: "Data Visualizations", 
      href: "/visualizations", 
      icon: BarChart3, 
      description: "Interactive challenge explorer",
      current: currentPage === 'visualizations'
    },
    { name: "Pitch Deck", href: "/pitch", icon: Target, description: "Original presentation" },
    { name: "Reviewer V1", href: "/for-reviewers", icon: FileText, description: "First reviewer response" },
    { name: "Network Test", href: "/test-network", icon: Network, description: "Network graph test" },
    { name: "Heatmap Test", href: "/test-heatmap", icon: BarChart3, description: "Heatmap test" },
    { name: "Chord Test", href: "/test-chord", icon: Zap, description: "Chord diagram test" },
    { name: "Sunburst Test", href: "/test-sunburst", icon: Sun, description: "Sunburst test" },
    { name: "Sankey Test", href: "/test-sankey", icon: GitBranch, description: "Sankey test" },
  ];

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Collapsed State - Green Circle */}
      <motion.div
        className="relative"
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
      >
        {/* Base Circle */}
        <motion.div
          className="w-14 h-14 bg-[#006E51] rounded-full flex items-center justify-center shadow-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6 text-white" />
        </motion.div>

        {/* Expanded Navigation Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 right-0 w-80 bg-white/95 backdrop-blur-md border border-[#006E51]/20 rounded-xl shadow-xl"
              onMouseEnter={() => setIsExpanded(true)}
              onMouseLeave={() => setIsExpanded(false)}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#006E51]">Innovation Atlas</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#006E51] rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">
                      {currentPage === 'home' && 'Platform Overview'}
                      {currentPage === 'visualizations' && 'Data Explorer'}
                      {currentPage === 'reviewer' && 'Reviewer Response'}
                    </span>
                  </div>
                </div>

                {/* Main Platform Pages - Collapsible */}
                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => setShowMainPlatform(!showMainPlatform)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="text-xs font-semibold text-[#006E51] uppercase tracking-wide">
                        Main Platform
                      </div>
                    </div>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showMainPlatform ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showMainPlatform && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        {mainPages.map((page) => {
                          const Icon = page.icon;
                          return (
                            <Link
                              key={page.name}
                              href={page.href}
                              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors group ml-2 ${
                                page.current 
                                  ? 'bg-[#006E51]/10 text-[#006E51] border border-[#006E51]/20' 
                                  : 'text-gray-700 hover:text-[#006E51] hover:bg-[#CCE2DC]/20'
                              }`}
                              onClick={() => setIsExpanded(false)}
                            >
                              <Icon className={`h-4 w-4 mr-3 ${page.current ? 'text-[#006E51]' : 'text-[#006E51] group-hover:scale-110'} transition-transform`} />
                              <div className="flex-1">
                                <div className="font-medium">{page.name}</div>
                                <div className="text-xs text-gray-500">{page.description}</div>
                              </div>
                              {page.current && (
                                <div className="w-2 h-2 bg-[#006E51] rounded-full"></div>
                              )}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Page-Specific Content */}
                {currentPage === 'reviewer' && sections.length > 0 && (
                  <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                    <div className="text-xs font-semibold text-[#006E51] uppercase tracking-wide px-3 py-1">
                      Page Sections
                    </div>
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          section.current 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'text-gray-600 hover:text-[#006E51] hover:bg-[#CCE2DC]/10'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentPage === 'visualizations' && visualizations.length > 0 && (
                  <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                    <div className="text-xs font-semibold text-[#006E51] uppercase tracking-wide px-3 py-1">
                      Visualizations
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {visualizations.map((viz) => {
                        const Icon = viz.icon;
                        return (
                          <button
                            key={viz.id}
                            onClick={() => {
                              viz.onClick?.();
                              setIsExpanded(false);
                            }}
                            className={`flex items-center gap-2 px-2 py-2 text-xs rounded-lg transition-colors ${
                              viz.current 
                                ? 'bg-[#006E51]/10 text-[#006E51] border border-[#006E51]/20' 
                                : 'text-gray-600 hover:text-[#006E51] hover:bg-[#CCE2DC]/10'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="truncate">{viz.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Archive Section */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowArchive(!showArchive)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Archive className="h-4 w-4 mr-3 text-gray-400" />
                      <div className="text-left">
                        <div className="font-medium">Development Archive</div>
                        <div className="text-xs text-gray-400">Prototypes & history</div>
                      </div>
                    </div>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showArchive ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showArchive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1 max-h-48 overflow-y-auto"
                      >
                        {archivePages.map((page) => {
                          const Icon = page.icon;
                          return (
                            <Link
                              key={page.name}
                              href={page.href}
                              className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-6"
                              onClick={() => setIsExpanded(false)}
                            >
                              <Icon className="h-3 w-3 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{page.name}</div>
                                {page.description && (
                                  <div className="text-xs text-gray-400">{page.description}</div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 mt-4 pt-3">
                  <div className="text-xs text-gray-500 text-center">
                    Connected Places Catapult
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}