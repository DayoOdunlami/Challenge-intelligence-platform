import QuickNavSidebar from '@/components/ui/QuickNavSidebar';
import { UnifiedFloatingNav } from '@/components/ui/UnifiedFloatingNav';
import { TopNavigation } from '@/components/ui/TopNavigation';

export default function BuyerProfileExample() {
  const profile = {
    type: 'buyer',
    name: 'James Patterson',
    organization: 'Network Rail',
    role: 'Innovation Procurement Manager',
    sectors: ['rail', 'transport'],
    problemTypes: ['predictive_maintenance', 'structural_monitoring', 'safety_systems', 'data_analytics'],
    stats: {
      challengesPosted: 12,
      smeMatches: 34,
      activeConversations: 8,
      evidenceReviewed: 15
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <TopNavigation />
      <QuickNavSidebar />
      <UnifiedFloatingNav currentPage="owner-profile" />
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                JP
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  {profile.name}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{profile.organization}</p>
                <p className="text-gray-500">{profile.role}</p>
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    🏢 Buyer Profile
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Edit Profile
              </button>
              <a 
                href="/test-network?profile=buyer-example"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                View My Matches
              </a>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <a href="/test-network" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <div className="text-2xl">🔍</div>
              <div>
                <div className="font-medium text-gray-900">Browse Challenges</div>
                <div className="text-sm text-gray-500">Discover opportunities</div>
              </div>
            </a>
            <a href="/test-sankey" className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <div className="text-2xl">🗺️</div>
              <div>
                <div className="font-medium text-gray-900">Challenge Landscape</div>
                <div className="text-sm text-gray-500">Visual intelligence</div>
              </div>
            </a>
            <button className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
              <div className="text-2xl">➕</div>
              <div>
                <div className="font-medium text-gray-900">Post Challenge</div>
                <div className="text-sm text-gray-500">Find innovations</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {profile.stats.challengesPosted}
            </div>
            <div className="text-sm text-gray-600 font-medium">Challenges Posted</div>
            <div className="text-xs text-gray-500 mt-1">Last 6 months</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {profile.stats.smeMatches}
            </div>
            <div className="text-sm text-gray-600 font-medium">SME Matches</div>
            <div className="text-xs text-gray-500 mt-1">Qualified innovators</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {profile.stats.activeConversations}
            </div>
            <div className="text-sm text-gray-600 font-medium">Active Conversations</div>
            <div className="text-xs text-gray-500 mt-1">In progress</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {profile.stats.evidenceReviewed}
            </div>
            <div className="text-sm text-gray-600 font-medium">Evidence Reviewed</div>
            <div className="text-xs text-gray-500 mt-1">Trial results</div>
          </div>
        </div>
        
        {/* Interests & Focus Areas */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          
          {/* Sectors */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">My Sectors</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">🚄</span>
                <div>
                  <div className="font-medium text-gray-900">Rail</div>
                  <div className="text-sm text-gray-600">Primary focus</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🚌</span>
                <div>
                  <div className="font-medium text-gray-900">Transport</div>
                  <div className="text-sm text-gray-600">Secondary interest</div>
                </div>
              </div>
            </div>
            
            <button className="mt-4 text-sm text-blue-600 hover:underline">
              + Add more sectors
            </button>
          </div>
          
          {/* Challenge Types */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Challenge Focus Areas</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Predictive Maintenance
              </span>
              <span className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                Structural Monitoring
              </span>
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Safety Systems
              </span>
              <span className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                Data Analytics
              </span>
            </div>
            
            <button className="mt-4 text-sm text-blue-600 hover:underline">
              + Add more areas
            </button>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">📊</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">New SME matches for &quot;Track Monitoring System&quot;</div>
                <div className="text-sm text-gray-600 mt-1">3 qualified innovators with proven solutions in similar contexts</div>
                <div className="text-xs text-gray-500 mt-2">2 days ago</div>
              </div>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Review
              </button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">💬</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Response from RailTech Solutions</div>
                <div className="text-sm text-gray-600 mt-1">They&apos;ve shared additional trial data from their deployment with TfL</div>
                <div className="text-xs text-gray-500 mt-2">3 days ago</div>
              </div>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                View
              </button>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">🔍</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Cross-sector pattern identified</div>
                <div className="text-sm text-gray-600 mt-1">Your predictive maintenance challenge has similarities with 5 energy sector challenges</div>
                <div className="text-xs text-gray-500 mt-2">5 days ago</div>
              </div>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Explore
              </button>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  )
}