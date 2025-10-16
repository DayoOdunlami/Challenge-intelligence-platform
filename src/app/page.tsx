import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import VisualizationCarousel from '@/components/ui/VisualizationCarousel';
import FilteringDemo from '@/components/ui/FilteringDemo';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <QuickNavSidebar />
      <ColorSchemeSelector />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 102 241) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          {/* Trusted by strip */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-4">Backed by Connected Places Catapult</div>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-sm font-medium text-gray-600">Trusted by Network Rail • Ofgem • DfT • Local Authorities</div>
            </div>
          </div>
          
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              UK Infrastructure<br/>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Innovation Exchange
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Accelerate adoption. Match proven solutions to real challenges — cutting procurement time from years to months.
            </p>
            
            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a 
                href="/profile/buyer-example" 
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Post a Challenge
              </a>
              <a 
                href="/profile/sme-profile" 
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
              >
                Find Innovations
              </a>
            </div>
            
            <div className="flex justify-center gap-4 mb-12">
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm">
                🎯 150+ Active Challenges
              </span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm">
                🚀 60% Cross-Sector Patterns
              </span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm">
                ⚡ 8 Infrastructure Sectors
              </span>
            </div>
          </div>
          
          {/* Interactive Demos */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">See It In Action</h2>
              <p className="text-gray-600">Experience the power of intelligent matching and filtering</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <VisualizationCarousel />
              <FilteringDemo />
            </div>
          </div>
          
          {/* Dual CTA Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            
            {/* Buyer Card */}
            <a href="/profile/buyer-example">
              <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 cursor-pointer transform hover:-translate-y-1">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">I&apos;m a Buyer</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Find validated innovations for your infrastructure challenges across sectors
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Post challenges and receive qualified matches</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Discover pre-qualified SMEs with proven solutions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Access verified trial evidence from other sectors</span>
                  </li>
                </ul>
                <div className="text-blue-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
                  Start as Buyer
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </a>
            
            {/* SME Card */}
            <a href="/profile/sme-example">
              <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500 cursor-pointer transform hover:-translate-y-1">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">I&apos;m an Innovator</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get matched with real buyer needs aligned to your proven solutions
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Find cross-sector opportunities you&apos;d never discover</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Turn one successful trial into five new opportunities</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Reuse trial evidence across multiple sectors</span>
                  </li>
                </ul>
                <div className="text-indigo-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
                  Join as Innovator
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </a>
            
          </div>
          
          <div className="text-center space-y-4">
            <a href="/test-network" className="text-gray-600 hover:text-gray-900 hover:underline inline-flex items-center gap-2">
              Browse Open Challenges
              <span>→</span>
            </a>
            <div className="text-gray-400">•</div>
            <a href="/pitch" className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-2 font-medium">
              🎤 View Full Pitch Deck
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Three steps to accelerate innovation adoption
          </p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
                🔍
              </div>
              <h3 className="text-xl font-bold mb-3">Discover</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore challenges and innovations across all UK infrastructure sectors in one visual intelligence platform
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center text-4xl">
                🎯
              </div>
              <h3 className="text-xl font-bold mb-3">Match</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered matching reveals cross-sector patterns and connects solutions with relevant challenges
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center text-4xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-3">Accelerate</h3>
              <p className="text-gray-600 leading-relaxed">
                Reuse validated evidence across sectors and reduce procurement time by up to 50%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                150+
              </div>
              <div className="text-gray-600 font-medium">Active Challenges</div>
              <div className="text-sm text-gray-500 mt-1">Across all sectors</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                60%
              </div>
              <div className="text-gray-600 font-medium">Cross-Sector Patterns</div>
              <div className="text-sm text-gray-500 mt-1">Hidden opportunities</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                8
              </div>
              <div className="text-gray-600 font-medium">Infrastructure Sectors</div>
              <div className="text-sm text-gray-500 mt-1">Rail, energy, transport...</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-gray-600 font-medium">Validated Innovations</div>
              <div className="text-sm text-gray-500 mt-1">Ready to deploy</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}