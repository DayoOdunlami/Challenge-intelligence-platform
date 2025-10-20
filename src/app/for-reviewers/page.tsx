"use client";

import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle } from "lucide-react";
import { AnimatedSection, StickyReveal, ScrollProgress } from "@/components/animations/ReviewerAnimations";
import { PlatformComparisonSection } from "@/components/reviewer/PlatformComparisonSection";
import { RiskMitigationSection } from "@/components/reviewer/RiskMitigationSection";
import { WhyCPCSection } from "@/components/reviewer/WhyCPCSection";
import { Phase1FeasibilitySection } from "@/components/reviewer/Phase1FeasibilitySection";
import { AudioExplainerSection } from "@/components/reviewer/AudioExplainerSection";
import { ReviewerResponsePDF } from "@/components/reviewer/ReviewerResponsePDF";
import { reviewerFeedbackData } from "@/data/reviewerData";

export default function ForReviewersPage() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'platform-comparison', 'risk-mitigation', 'why-cpc', 'phase-1-feasibility', 'audio-explainer'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollProgress />
      
      {/* Sticky Navigation */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="text-xs font-medium text-gray-500 mb-3">SECTIONS</div>
          <nav className="space-y-2">
            {[
              { id: 'hero', label: 'Overview' },
              { id: 'platform-comparison', label: 'Platform Analysis' },
              { id: 'risk-mitigation', label: 'Risk Assessment' },
              { id: 'why-cpc', label: 'Why CPC' },
              { id: 'phase-1-feasibility', label: 'Phase 1 Plan' },
              { id: 'audio-explainer', label: 'Vision' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  block w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200
                  ${activeSection === section.id 
                    ? 'bg-cpc-green-100 text-cpc-green-800 font-medium' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <AnimatedSection 
        variant="fadeInScale" 
        id="hero"
        className="min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-cpc-green-800 to-cpc-green-900 text-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How We've Addressed Your Feedback
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              We heard every concern from the first round. Here's our comprehensive response to each one, with evidence and clear mitigation strategies.
            </p>
            
            {/* Feedback Response Grid */}
            <div className="grid md:grid-cols-2 gap-4 mt-12 max-w-4xl mx-auto">
              {reviewerFeedbackData.map((item, idx) => (
                <div key={idx} className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-4 text-left hover:bg-white/20 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <button
                      onClick={() => scrollToSection(item.sectionId)}
                      className="text-xs text-green-300 hover:text-white flex items-center font-medium"
                    >
                      View Response <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">
                    "{item.feedback}"
                  </h3>
                  <p className="text-gray-200 text-xs">
                    {item.ourResponse}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <button
                onClick={() => scrollToSection('audio-explainer')}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center shadow-lg"
              >
                🎙️ Hear the Vision (5 min)
              </button>
              <button
                onClick={() => scrollToSection('platform-comparison')}
                className="bg-cpc-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cpc-green-700 transition-colors duration-200 flex items-center border border-white/30 shadow-lg"
              >
                🗺️ Explore Our Analysis
              </button>
              <ReviewerResponsePDF />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Platform Comparison Section */}
      <AnimatedSection 
        variant="slideInLeft" 
        id="platform-comparison"
        className="min-h-screen py-20 bg-blue-50"
      >
        <PlatformComparisonSection />
      </AnimatedSection>

      {/* Risk Mitigation Section */}
      <AnimatedSection 
        variant="slideInRight" 
        id="risk-mitigation"
        className="min-h-screen py-20 bg-white"
      >
        <RiskMitigationSection />
      </AnimatedSection>

      {/* Why CPC Section */}
      <AnimatedSection 
        variant="fadeInScale" 
        id="why-cpc"
        className="min-h-screen py-20 bg-gradient-to-br from-cpc-green-50 to-green-100"
      >
        <WhyCPCSection />
      </AnimatedSection>

      {/* Phase 1 Feasibility Section */}
      <AnimatedSection 
        variant="slideInLeft" 
        id="phase-1-feasibility"
        className="min-h-screen py-20 bg-white"
      >
        <Phase1FeasibilitySection />
      </AnimatedSection>

      {/* Audio Explainer Section */}
      <StickyReveal 
        className="min-h-screen py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      >
        <div id="audio-explainer">
          <AudioExplainerSection />
        </div>
      </StickyReveal>

      {/* Summary Section */}
      <AnimatedSection 
        variant="fadeInUp"
        className="min-h-screen py-20 bg-gradient-to-br from-cpc-green-600 to-cpc-green-800 text-white flex items-center"
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready for Phase 1</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-cpc-green-100">
            We've addressed every concern, stress-tested the approach, and defined clear success criteria. 
            The prototype proves the thesis. The plan is realistic. The team is ready.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5/5</div>
              <div className="text-cpc-green-200">Concerns Addressed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">£150-200k</div>
              <div className="text-cpc-green-200">Phase 1 Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">3 months</div>
              <div className="text-cpc-green-200">Time to Validation</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-cpc-green-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-200">
              Explore the Prototype
            </button>
            <button className="bg-transparent text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-white hover:bg-white hover:text-cpc-green-700 transition-colors duration-200">
              Schedule a Demo
            </button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}