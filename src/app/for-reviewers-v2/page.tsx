"use client"

import { CheckCircle, Download, MessageCircle, Shield, Target, PoundSterling } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReviewerFloatingNav } from "@/components/reviewer-v2/ReviewerFloatingNav"
import { ReviewerScrollProgress } from "@/components/reviewer-v2/ReviewerScrollProgress"
import { ReviewerSectionHeading } from "@/components/reviewer-v2/ReviewerSectionHeading"
import { FeedbackResponseCard } from "@/components/reviewer-v2/FeedbackResponseCard"
import { PlatformComparisonCard } from "@/components/reviewer-v2/PlatformComparisonCard"
import { RiskAssessmentCard } from "@/components/reviewer-v2/RiskAssessmentCard"
import { PhaseTimeline } from "@/components/reviewer-v2/PhaseTimeline"
import { InteractivePlatformComparison } from "@/components/reviewer-v2/InteractivePlatformComparison"
import { InteractiveCPCAdvantages } from "@/components/reviewer-v2/InteractiveCPCAdvantages"
import { CreativeHero } from "@/components/ui/CreativeHero"
import { AudioExplainerSection } from "@/components/reviewer/AudioExplainerSection"
import { TopNavigation } from "@/components/ui/TopNavigation"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { UnifiedFloatingNav } from "@/components/ui/UnifiedFloatingNav"
import { useActiveSection } from "@/hooks/useActiveSection"
import { reviewerFeedbackData, platformComparisonData, riskAnalysisData, cpcAdvantagesData, phase1DeliverablesData } from "@/data/reviewerData"

export default function ReviewerResponseV2() {
  const sectionIds = [
    "hero", "feedback-overview", "platform-comparison", 
    "risk-mitigation", "why-cpc", "phase-1-feasibility", "audio-explainer"
  ];
  const activeSection = useActiveSection(sectionIds);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10 text-[#2E2D2B] overflow-hidden">
      <TopNavigation />
      <ReviewerScrollProgress />
      <UnifiedFloatingNav 
        currentPage="reviewer"
        sections={[
          { id: "hero", label: "Overview", current: activeSection === "hero" },
          { id: "feedback-overview", label: "Feedback Response", current: activeSection === "feedback-overview" },
          { id: "platform-comparison", label: "Platform Analysis", current: activeSection === "platform-comparison" },
          { id: "risk-mitigation", label: "Risk Assessment", current: activeSection === "risk-mitigation" },
          { id: "why-cpc", label: "Why CPC", current: activeSection === "why-cpc" },
          { id: "phase-1-feasibility", label: "Phase 1 Plan", current: activeSection === "phase-1-feasibility" },
          { id: "audio-explainer", label: "Vision", current: activeSection === "audio-explainer" },
        ]}
      />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <CreativeHero className="absolute inset-0 z-0" />
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(0 110 81) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
        </div>

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80 rounded-2xl -m-4 p-4"></div>
            <div className="relative z-10">
              {/* Breadcrumbs */}
              <Breadcrumbs 
                items={[
                  { label: "Innovation Atlas", href: "/" },
                  { label: "For Reviewers", href: "/for-reviewers" },
                  { label: "Enhanced Response", current: true }
                ]}
                className="mb-6"
              />
              
              <div className="inline-block">
                <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                  <span className="relative z-10 text-[#006E51]">Comprehensive response to your feedback</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="block text-[#2E2D2B]">How We've</span>
                <span className="text-[#006E51]">Addressed Your Concerns</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-[600px]">
                We heard every concern from the first round. Here's our comprehensive response with evidence, 
                risk mitigation strategies, and clear success criteria.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="relative overflow-hidden group bg-[#006E51] hover:bg-[#005A42] text-white border-0">
                  <span className="relative z-10 flex items-center">
                    Explore Our Response <CheckCircle className="ml-2 h-4 w-4" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {/* Quick stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/80 rounded-lg border border-[#CCE2DC]">
                  <div className="text-2xl font-bold text-[#006E51]">5/5</div>
                  <div className="text-xs text-gray-600">Concerns Addressed</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-[#CCE2DC]">
                  <div className="text-2xl font-bold text-[#006E51]">£150-200k</div>
                  <div className="text-xs text-gray-600">Phase 1 Budget</div>
                </div>
                <div className="text-center p-3 bg-white/80 rounded-lg border border-[#CCE2DC]">
                  <div className="text-2xl font-bold text-[#006E51]">3 months</div>
                  <div className="text-xs text-gray-600">Time to Validation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {reviewerFeedbackData.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="bg-white/90 backdrop-blur-sm border border-[#006E51]/20 rounded-lg p-3 hover:shadow-lg transition-all duration-300">
                      <CheckCircle className="w-5 h-5 text-[#006E51] mb-2" />
                      <div className="text-xs font-medium text-[#2E2D2B] mb-1">
                        {item.feedback.split(' ').slice(0, 3).join(' ')}...
                      </div>
                      <div className="text-xs text-gray-600">
                        ✓ Addressed
                      </div>
                    </div>
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

      {/* Feedback Overview Section */}
      <section id="feedback-overview" className="py-32 relative">
        <CreativeHero className="absolute inset-0 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Direct responses to each concern</span>
                <span className="ml-2 px-2 py-0.5 bg-[#006E51] text-white text-xs rounded-full">Complete</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">Your Feedback, Our Response</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {reviewerFeedbackData.map((item, idx) => (
              <FeedbackResponseCard
                key={idx}
                feedback={item.feedback}
                response={item.ourResponse}
                evidence={item.evidence}
                sectionId={item.sectionId}
                status="complete"
                category="Strategic Response"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#006E51]/30 to-transparent"></div>

      {/* Platform Comparison Section */}
      <section id="platform-comparison" className="py-32 relative bg-[#CCE2DC]/10">
        <CreativeHero 
          className="absolute inset-0 z-0" 
          sectionTheme="fragmented-vs-organized"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Platform analysis and differentiation</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">Why Current Services Fail</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The UK already has multiple innovation procurement portals. We analyzed them to understand why cross-sector patterns remain invisible and evidence transfer doesn't happen.
            </p>
          </div>

          <InteractivePlatformComparison />
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#CCE2DC] to-transparent"></div>

      {/* Risk Assessment Section */}
      <section id="risk-mitigation" className="py-32 relative">
        <CreativeHero className="absolute inset-0 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Comprehensive risk analysis and mitigation</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">We've Stress-Tested This Approach</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We conducted red team analysis to identify every way this could fail. Here are the top risks, our mitigation strategies, and how Phase 1 tests each assumption.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
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
              <div className="text-2xl font-bold text-[#006E51]">5</div>
              <div className="text-sm text-gray-600">Mitigated</div>
            </div>
          </div>

          <div className="space-y-4 max-w-5xl mx-auto">
            {riskAnalysisData.map((risk) => (
              <RiskAssessmentCard
                key={risk.id}
                id={risk.id}
                risk={risk.risk}
                description={risk.description}
                impact={risk.impact}
                probability={risk.probability}
                redTeamQuote={risk.redTeamQuote}
                ourMitigation={risk.ourMitigation}
                phase1Test={risk.phase1Test}
                mitigationEvidence={risk.mitigationEvidence}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#006E51]/30 to-transparent"></div>

      {/* Why CPC Section */}
      <section id="why-cpc" className="py-32 relative bg-[#CCE2DC]/10">
        <CreativeHero className="absolute inset-0 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Unique positioning and competitive advantages</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">Why Connected Places Catapult</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Anyone can scrape procurement data. But turning that into intelligence requires something much harder to replicate: cross-sector credibility, domain expertise, and neutral convening power.
            </p>
          </div>

          <InteractiveCPCAdvantages />
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#CCE2DC] to-transparent"></div>

      {/* Phase 1 Feasibility Section */}
      <section id="phase-1-feasibility" className="py-32 relative">
        <CreativeHero className="absolute inset-0 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4 animate-fade-in-up">
                <span className="relative z-10 text-[#006E51]">Clear metrics and realistic resource allocation</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E2D2B] animate-fade-in-up animation-delay-200">Phase 1 Success Criteria</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6 animate-scale-in animation-delay-400"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our phased approach ensures realistic delivery and clear validation at each stage. Here's our roadmap from proof-of-concept to full platform.
            </p>
          </div>

          <PhaseTimeline />
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#006E51]/30 to-transparent"></div>

      {/* Audio Explainer Section */}
      <section id="audio-explainer" className="py-32 relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <AudioExplainerSection />
      </section>

      {/* Summary Section */}
      <section className="py-32 relative bg-gradient-to-br from-[#006E51] to-[#005A42] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready for Phase 1</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-green-100">
            We've addressed every concern, stress-tested the approach, and defined clear success criteria. 
            The prototype proves the thesis. The plan is realistic. The team is ready.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5/5</div>
              <div className="text-green-200">Concerns Addressed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">£150-200k</div>
              <div className="text-green-200">Phase 1 Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">3 months</div>
              <div className="text-green-200">Time to Validation</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-[#006E51] px-8 py-4 text-lg hover:bg-gray-100">
              Explore the Prototype
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#006E51] px-8 py-4 text-lg"
            >
              Schedule a Demo
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#006E51] px-8 py-4 text-lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF Summary
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-[#2E2D2B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="font-bold text-xl">
              <span className="text-[#CCE2DC]">Challenge</span>
              <span className="text-white"> Intelligence Platform</span>
            </span>
            <p className="text-sm text-gray-400 mt-2">
              © {new Date().getFullYear()} Connected Places Catapult. All rights reserved.
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Portfolio-style implementation • Compare with <a href="/for-reviewers" className="text-[#CCE2DC] hover:text-white">V1</a>
          </div>
        </div>
      </footer>
    </div>
  )
}