"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Target, Zap, CheckCircle, Play, Eye, Network, Bell, MessageCircle, FileText, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreativeHero } from '@/components/ui/CreativeHero';
import { UnifiedFloatingNav } from '@/components/ui/UnifiedFloatingNav';
import { TopNavigation } from '@/components/ui/TopNavigation';
import { AudioExplainerSection } from '@/components/reviewer/AudioExplainerSection';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import Link from 'next/link';

export default function HomePage() {
  const [activeRole, setActiveRole] = useState<'innovator' | 'owner' | null>(null);
  const [comingSoonModal, setComingSoonModal] = useState<{
    title: string;
    description: string;
    timeline: string;
    benefits: string[];
  } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10 text-[#2E2D2B] overflow-hidden">
      <TopNavigation />
      <UnifiedFloatingNav currentPage="home" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <CreativeHero 
          className="absolute inset-0 z-0" 
          sectionTheme="convergence"
          contentAreas={[
            // Main content area - reduce particles over text
            { x: 0.5, y: 0.5, radius: 400, shape: 'rectangle', fadeStart: 0.7 },
            // CTA buttons - enhance particles around interactive elements
            { x: 0.3, y: 0.8, radius: 80, shape: 'circle', fadeStart: 0.9 },
            { x: 0.7, y: 0.8, radius: 80, shape: 'circle', fadeStart: 0.9 }
          ]}
        />
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(0 110 81) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
        </div>

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80 rounded-2xl -m-4 p-4"></div>
            <div className="relative z-10">
              <div className="inline-block">
                <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-6">
                  <span className="relative z-10 text-[#006E51]">Connected Places Catapult Innovation Platform</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                <span className="block text-[#2E2D2B]">Innovation</span>
                <span className="text-[#006E51]">Atlas</span>
              </h1>
              
              <div className="mb-4">
                <p className="text-2xl font-semibold text-[#006E51] mb-2">
                  The UK's cross-sector innovation intelligence platform
                </p>
                <p className="text-lg text-gray-600">
                  Discover patterns, accelerate adoption, and turn invisible connections into inevitable progress
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-white/80 rounded-lg border border-[#CCE2DC]">
                  <div className="text-2xl font-bold text-[#006E51]">150+</div>
                  <div className="text-xs text-gray-600">Active Challenges</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-[#CCE2DC]">
                  <div className="text-2xl font-bold text-[#006E51]">8</div>
                  <div className="text-xs text-gray-600">Sectors Connected</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-[#CCE2DC]">
                  <div className="text-2xl font-bold text-[#006E51]">60%</div>
                  <div className="text-xs text-gray-600">Cross-Sector Patterns</div>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/visualizations">
                  <Button 
                    className="bg-[#006E51] hover:bg-[#005A42] text-white border-0 px-8 py-4 text-lg"
                    data-particle-zone="explore-data"
                  >
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Explore Data
                  </Button>
                </Link>
                <Link href="/for-reviewers-v2">
                  <Button
                    variant="outline"
                    className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white px-8 py-4 text-lg"
                    data-particle-zone="see-approach"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    See Our Approach
                  </Button>
                </Link>
              </div>

              {/* Trusted by */}
              <div className="text-sm text-gray-500">
                Trusted by Network Rail • Ofgem • DfT • Local Authorities
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {[
                    { icon: Network, label: "Cross-Sector Mapping", color: "from-[#006E51] to-green-600" },
                    { icon: Target, label: "Challenge Matching", color: "from-blue-500 to-blue-600" },
                    { icon: Zap, label: "Pattern Detection", color: "from-purple-500 to-purple-600" },
                    { icon: CheckCircle, label: "Evidence Reuse", color: "from-orange-500 to-orange-600" }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white/90 backdrop-blur-sm border border-[#006E51]/20 rounded-lg p-4 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      data-particle-zone={`feature-${idx}`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-sm font-medium text-[#2E2D2B] mb-1">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        ✓ Active
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[#006E51]/30 flex justify-center items-start p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#006E51] animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#CCE2DC] to-transparent"></div>

      {/* Audio Explainer Section - Moved up for immediate clarity */}
      <section className="py-32 relative bg-[#CCE2DC]/10">
        <CreativeHero 
          className="absolute inset-0 z-0" 
          sectionTheme="rippling"
          contentAreas={[
            // Audio player area - gentle rippling around it
            { x: 0.5, y: 0.5, width: 600, height: 400, shape: 'rectangle', fadeStart: 0.9 }
          ]}
        />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-block">
                <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-white/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                  <span className="relative z-10 text-[#006E51]">Hear from us</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">Why We Built Innovation Atlas</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Listen to our founder explain the vision behind the UK's first cross-sector innovation intelligence platform.
              </p>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
            </div>
            
            {/* Audio Player - Light theme version */}
            <div className="max-w-4xl mx-auto">
              <AudioExplainerSection theme="light" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#006E51]/30 to-transparent"></div>

      {/* Vision Section - Moved up for clarity */}
      <section className="py-32 relative">
        <CreativeHero 
          className="absolute inset-0 z-0" 
          sectionTheme="timeline-flow"
          contentAreas={[
            // Three step cards - create flow between them
            { x: 0.2, y: 0.6, width: 280, height: 320, shape: 'rectangle', fadeStart: 0.85 },
            { x: 0.5, y: 0.6, width: 280, height: 320, shape: 'rectangle', fadeStart: 0.85 },
            { x: 0.8, y: 0.6, width: 280, height: 320, shape: 'rectangle', fadeStart: 0.85 }
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Our vision</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">How Innovation Atlas Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the UK's first cross-sector innovation intelligence platform. Here's how we turn invisible connections into inevitable progress.
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: BarChart3,
                title: "Discover Patterns",
                description: "Explore challenges and innovations across all UK infrastructure sectors in one visual intelligence platform",
                color: "from-[#006E51] to-green-600"
              },
              {
                icon: Target,
                title: "Match Intelligently", 
                description: "AI-powered matching reveals cross-sector patterns and connects solutions with relevant challenges",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Zap,
                title: "Accelerate Adoption",
                description: "Reuse validated evidence across sectors and reduce procurement time by up to 50%",
                color: "from-purple-500 to-purple-600"
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="text-center bg-white/80 backdrop-blur-sm border border-[#CCE2DC]/50 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#2E2D2B]">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#006E51]/30 to-transparent"></div>

      {/* Role Selection Section */}
      <section className="py-32 relative bg-[#CCE2DC]/10">
        <CreativeHero 
          className="absolute inset-0 z-0" 
          sectionTheme="fragmented-vs-organized"
          contentAreas={[
            // Role cards - create particle interaction zones
            { x: 0.25, y: 0.5, width: 350, height: 400, shape: 'rectangle', fadeStart: 0.8 },
            { x: 0.75, y: 0.5, width: 350, height: 400, shape: 'rectangle', fadeStart: 0.8 }
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Choose your journey</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">How Will You Use Innovation Atlas?</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Innovator Card */}
            <motion.div
              className={`relative overflow-hidden rounded-xl border-2 p-8 transition-all duration-300 cursor-pointer ${
                activeRole === 'innovator' 
                  ? 'border-[#006E51] bg-[#006E51]/5 shadow-xl' 
                  : 'border-[#CCE2DC] bg-white hover:border-[#006E51]/50 hover:shadow-lg'
              }`}
              onHoverStart={() => setActiveRole('innovator')}
              onHoverEnd={() => setActiveRole(null)}
              whileHover={{ scale: 1.02 }}
              data-particle-zone="innovator"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#006E51] to-green-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#2E2D2B]">I'm an Innovator</h3>
                  <p className="text-gray-600">Turn one success into many opportunities</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Find cross-sector opportunities you'd never discover",
                  "Turn one successful trial into five new markets",
                  "Reuse trial evidence across multiple sectors",
                  "Get matched with real buyer needs automatically"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#006E51] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href="/profile/sme-example">
                <Button className="w-full bg-[#006E51] hover:bg-[#005A42] text-white">
                  Explore as Innovator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Challenge Owner Card */}
            <motion.div
              className={`relative overflow-hidden rounded-xl border-2 p-8 transition-all duration-300 cursor-pointer ${
                activeRole === 'owner' 
                  ? 'border-blue-500 bg-blue-50 shadow-xl' 
                  : 'border-[#CCE2DC] bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
              onHoverStart={() => setActiveRole('owner')}
              onHoverEnd={() => setActiveRole(null)}
              whileHover={{ scale: 1.02 }}
              data-particle-zone="owner"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#2E2D2B]">I'm a Challenge Owner</h3>
                  <p className="text-gray-600">Find validated solutions faster</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Discover pre-validated solutions from other sectors",
                  "Access verified trial evidence and case studies",
                  "Reduce procurement time from years to months",
                  "Connect with qualified innovators automatically"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href="/profile/buyer-example">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Explore as Challenge Owner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>




      {/* Future Features Section */}
      <section className="py-32 relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <CreativeHero 
          className="absolute inset-0 z-0" 
          sectionTheme="pulsing"
          contentAreas={[
            // Future feature cards - pulsing interaction zones
            { x: 0.2, y: 0.6, width: 300, height: 350, shape: 'rectangle', fadeStart: 0.8 },
            { x: 0.5, y: 0.6, width: 300, height: 350, shape: 'rectangle', fadeStart: 0.8 },
            { x: 0.8, y: 0.6, width: 300, height: 350, shape: 'rectangle', fadeStart: 0.8 }
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-blue-50 backdrop-blur-sm border border-blue-200 mb-4">
                <span className="relative z-10 text-blue-600">Innovation pipeline</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">What's Coming Next</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're building the future of innovation intelligence. Here's what's in development.
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "AI Assistant",
                subtitle: "Ask questions, get insights",
                description: "Natural language queries about challenges, patterns, and opportunities",
                timeline: "Phase 2 - Q2 2025",
                status: "In Development",
                benefits: [
                  "Ask complex questions about cross-sector patterns",
                  "Get personalized recommendations based on your profile",
                  "Natural language search across all platform data",
                  "Automated insight generation and alerts"
                ]
              },
              {
                icon: FileText,
                title: "Evidence Transfer Hub",
                subtitle: "Reuse validated solutions",
                description: "Streamlined process for transferring trial evidence between sectors",
                timeline: "Phase 2 - Q3 2025", 
                status: "Planned",
                benefits: [
                  "Standardized evidence packages for cross-sector use",
                  "Automated compliance checking for different sectors",
                  "Evidence quality scoring and validation",
                  "Direct integration with procurement systems"
                ]
              },
              {
                icon: Navigation,
                title: "Procurement Navigator",
                subtitle: "Guided procurement journeys",
                description: "Step-by-step guidance through sector-specific procurement processes",
                timeline: "Phase 3 - Q1 2026",
                status: "Concept",
                benefits: [
                  "Sector-specific procurement pathway guidance",
                  "Automated document generation and templates",
                  "Real-time compliance checking",
                  "Integration with existing procurement platforms"
                ]
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:shadow-lg hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => {
                  setComingSoonModal({
                    title: feature.title,
                    description: feature.description,
                    timeline: feature.timeline,
                    benefits: feature.benefits
                  });
                }}
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-white/20 to-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.status === 'In Development' 
                      ? 'bg-blue-100 text-blue-700'
                      : feature.status === 'Planned'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-[#CCE2DC] mb-2">{feature.subtitle}</p>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{feature.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{feature.timeline}</span>
                  <span className="group-hover:text-[#CCE2DC] transition-colors">Click to learn more →</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-white mb-1">Development Updates</h4>
                  <p className="text-sm text-gray-300">
                    Follow detailed progress, timelines, and technical specifications in our 
                    <Link href="/for-reviewers-v2" className="font-medium hover:underline ml-1 text-[#CCE2DC] hover:text-white">
                      comprehensive reviewer response
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#006E51]/30 to-transparent"></div>

      {/* Platform Stats Section */}
      <section className="py-32 relative">
        <CreativeHero className="absolute inset-0 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Platform intelligence</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">The Numbers Behind the Vision</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "150+", label: "Active Challenges", sublabel: "Across all sectors", color: "from-[#006E51] to-green-600" },
              { number: "60%", label: "Cross-Sector Patterns", sublabel: "Hidden opportunities", color: "from-blue-500 to-blue-600" },
              { number: "8", label: "Infrastructure Sectors", sublabel: "Rail, energy, transport...", color: "from-purple-500 to-purple-600" },
              { number: "50+", label: "Validated Innovations", sublabel: "Ready to deploy", color: "from-orange-500 to-orange-600" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center bg-white/80 backdrop-blur-sm border border-[#CCE2DC]/50 rounded-xl p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-[#2E2D2B] font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 relative bg-gradient-to-br from-[#006E51] to-[#005A42] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Explore Innovation Atlas?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-green-100">
            Join the platform that's making invisible innovation connections visible across the UK's infrastructure sectors.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <Link href="/visualizations">
              <Button className="bg-white text-[#006E51] px-8 py-4 text-lg hover:bg-gray-100">
                <BarChart3 className="mr-2 h-5 w-5" />
                Explore Data Visualizations
              </Button>
            </Link>
            <Link href="/for-reviewers-v2">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-[#006E51] px-8 py-4 text-lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                See Our Full Approach
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/profile/sme-example">
              <Button 
                variant="outline" 
                className="w-full border-white text-white hover:bg-white hover:text-[#006E51] py-3"
              >
                Join as Innovator
              </Button>
            </Link>
            <Link href="/profile/buyer-example">
              <Button 
                variant="outline" 
                className="w-full border-white text-white hover:bg-white hover:text-[#006E51] py-3"
              >
                Join as Challenge Owner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-[#2E2D2B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="font-bold text-xl">
              <span className="text-[#CCE2DC]">Innovation</span>
              <span className="text-white"> Atlas</span>
            </span>
            <p className="text-sm text-gray-400 mt-2">
              © {new Date().getFullYear()} Connected Places Catapult. All rights reserved.
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Mapping connections that move the UK forward
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      {comingSoonModal && (
        <ComingSoonModal
          isOpen={!!comingSoonModal}
          onClose={() => setComingSoonModal(null)}
          feature={comingSoonModal}
        />
      )}
    </div>
  )
}