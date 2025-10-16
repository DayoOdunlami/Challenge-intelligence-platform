import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import VisualizationCarousel from '@/components/ui/VisualizationCarousel';
import FilteringDemo from '@/components/ui/FilteringDemo';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import ScrollProgress from '@/components/ui/ScrollProgress';
import FadeInOnScroll from '@/components/ui/FadeInOnScroll';
import FeatureVoting from '@/components/ui/FeatureVoting';
import SectionNav from '@/components/ui/SectionNav';

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <ScrollProgress />
      <SectionNav />
      <QuickNavSidebar />
      <ColorSchemeSelector />
      
      {/* Hero Section */}
      <section id="hero" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-4">Connected Places Catapult • Sparkworks Programme</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The UK Infrastructure<br/>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Innovation Exchange
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Innovation adoption in UK infrastructure takes years — fragmented, repetitive, and opaque.<br/>
              <strong>The Innovation Exchange turns this into months.</strong>
            </p>
          </div>
          
          {/* Animated KPI */}
          <FadeInOnScroll delay={500}>
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto mb-12">
              <div className="text-center">
                <AnimatedCounter end={5} suffix=" Years" className="text-4xl font-bold text-red-600 mb-2" />
                <div className="text-gray-500 mb-4">Current Innovation Adoption</div>
                <div className="text-2xl text-gray-400 mb-4">↓</div>
                <AnimatedCounter end={12} suffix=" Months" className="text-4xl font-bold text-green-600 mb-2" />
                <div className="text-gray-500">With Innovation Exchange</div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* The Stress Test */}
      <section id="stress-test" className="py-16 px-4 bg-red-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem Is Real</h2>
            <p className="text-xl text-gray-600">Data-driven evidence of innovation bottlenecks</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FadeInOnScroll delay={0}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <AnimatedCounter end={5} suffix=" Years" className="text-3xl font-bold text-red-600 mb-2" />
                <div className="text-sm text-gray-600 font-medium">Avg UK public-sector innovation adoption</div>
                <div className="text-xs text-gray-400 mt-2">BEIS / Innovate UK</div>
              </div>
            </FadeInOnScroll>
            
            <FadeInOnScroll delay={200}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <AnimatedCounter end={60} suffix="%" className="text-3xl font-bold text-orange-600 mb-2" />
                <div className="text-sm text-gray-600 font-medium">Of pilots never scale due to lack of evidence reuse</div>
                <div className="text-xs text-gray-400 mt-2">Catapult Network (2022)</div>
              </div>
            </FadeInOnScroll>
            
            <FadeInOnScroll delay={400}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <AnimatedCounter end={470} prefix="£" suffix="M" className="text-3xl font-bold text-purple-600 mb-2" />
                <div className="text-sm text-gray-600 font-medium">Estimated trapped in duplicated trials</div>
                <div className="text-xs text-gray-400 mt-2">0.5-1% of £47B infra spend</div>
              </div>
            </FadeInOnScroll>
            
            <FadeInOnScroll delay={600}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <AnimatedCounter end={80} suffix="%" className="text-3xl font-bold text-blue-600 mb-2" />
                <div className="text-sm text-gray-600 font-medium">Of SMEs cite procurement as high-risk / too slow</div>
                <div className="text-xs text-gray-400 mt-2">FSB (2023)</div>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section id="solution" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Solution</h2>
            <p className="text-2xl text-blue-600 font-semibold mb-6">
              🧠 &ldquo;A cross-sector digital marketplace that makes innovation adoption as simple as downloading an app.&rdquo;
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Procurement Coach</h3>
              <p className="text-gray-600 text-sm">Navigate complex requirements with intelligent guidance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Matchmaker</h3>
              <p className="text-gray-600 text-sm">Connect challenges with proven solutions across sectors</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Evidence Vault</h3>
              <p className="text-gray-600 text-sm">Reuse verified trial data and reduce duplication</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎫</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Innovation Passport</h3>
              <p className="text-gray-600 text-sm">Portable credentials that travel across sectors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Prototype Preview */}
      <section id="prototype" className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600">Explore the early prototype - each node is a challenge, colors show sectors</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <VisualizationCarousel />
            <FilteringDemo />
          </div>
          
          <div className="text-center mt-8">
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/test-network" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Try Network Graph
              </a>
              <a href="/test-heatmap" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                Try Heatmap
              </a>
              <a href="/test-sunburst" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
                Try Sunburst
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Model */}
      <section id="impact" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Impact</h2>
            <p className="text-xl text-gray-600">Evidence-based projections for UK infrastructure innovation</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Input</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-900">150+ Challenges</div>
                    <div className="text-sm text-blue-700">Across 8 sectors</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-900">1000+ SMEs</div>
                    <div className="text-sm text-green-700">With proven solutions</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-900">AI Matching</div>
                    <div className="text-sm text-purple-700">Cross-sector discovery</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="font-semibold text-orange-900">Evidence Reuse</div>
                    <div className="text-sm text-orange-700">Verified trial data</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact</h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-900">50% Faster</div>
                    <div className="text-sm text-green-700">Procurement cycles</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-900">£470M Saved</div>
                    <div className="text-sm text-blue-700">Reduced duplication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engage Section */}
      <section id="engage" className="py-16 px-4 bg-green-50">
        <FadeInOnScroll>
          <FeatureVoting />
        </FadeInOnScroll>
      </section>

      {/* Call to Action */}
      <section id="cta" className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join the UK Innovation Exchange Pilot</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of making innovation adoption as simple as downloading an app
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/profile/buyer-example" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg">
              Post a Challenge
            </a>
            <a href="/profile/sme-profile" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold text-lg">
              Share Feedback
            </a>
            <a href="/test-network" className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg">
              Request Demo
            </a>
          </div>
        </div>
      </section>

      {/* Attribution Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-gray-300">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-lg font-semibold text-white">Connected Places Catapult</div>
            <span>•</span>
            <div>Sparkworks Programme</div>
          </div>
          <p className="text-sm">
            Developed to accelerate UK infrastructure innovation adoption through intelligent cross-sector matching
          </p>
        </div>
      </footer>
    </div>
  )
}