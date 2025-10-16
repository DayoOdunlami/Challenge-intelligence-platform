import Link from 'next/link';
import QuickNavSidebar from '@/components/ui/QuickNavSidebar';

export default function SMEExample() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <QuickNavSidebar />
      <div className="max-w-5xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">← Home</Link>
            <span className="text-gray-400">•</span>
            <Link href="/profile/buyer-example" className="text-gray-600 hover:text-gray-900 hover:underline">Buyer Example</Link>
            <span className="text-gray-400">•</span>
            <span className="text-gray-900 font-medium">SME Example</span>
          </nav>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                SC
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Dr. Sarah Chen
                </h1>
                <p className="text-lg text-gray-600 mb-3">Sensor Dynamics Ltd</p>
                <p className="text-gray-500 mb-3">CTO & Co-founder</p>
                <div className="flex gap-2">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                    🚀 Innovator Profile
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Proven Solution
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Edit Profile
              </button>
              <Link 
                href="/test-network?profile=sme-example"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Find Opportunities
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">23</div>
            <div className="text-sm text-gray-600 font-medium">Matching Challenges</div>
            <div className="text-xs text-gray-500 mt-1">Currently active</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">12</div>
            <div className="text-sm text-gray-600 font-medium">Cross-Sector Finds</div>
            <div className="text-xs text-gray-500 mt-1">Hidden opportunities</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">45</div>
            <div className="text-sm text-gray-600 font-medium">Hours Saved</div>
            <div className="text-xs text-gray-500 mt-1">In opportunity search</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
            <div className="text-sm text-gray-600 font-medium">Evidence Packages</div>
            <div className="text-xs text-gray-500 mt-1">Ready to share</div>
          </div>
        </div>
        
        {/* Innovation Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 mb-6 border border-indigo-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Innovation</h2>
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            AI-Powered Infrastructure Health Monitoring System
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Advanced sensor fusion and machine learning platform that predicts infrastructure failures 
            6-8 months in advance. Proven in rail applications, transferable to energy, transport, and 
            built environment sectors.
          </p>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
              🎯 85% accuracy
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
              💰 30% cost reduction
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
              ⚡ Real-time monitoring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}