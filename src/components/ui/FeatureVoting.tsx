'use client'

import { useState } from 'react'

const features = [
  {
    id: 'evidence-vault',
    icon: '📁',
    title: 'Evidence Vault',
    description: 'Reuse verified trial data across sectors',
    votes: 42
  },
  {
    id: 'procurement-coach',
    icon: '🤖',
    title: 'Procurement Coach',
    description: 'AI-guided navigation of requirements',
    votes: 38
  },
  {
    id: 'innovation-passport',
    icon: '🎫',
    title: 'Innovation Passport',
    description: 'Portable credentials across sectors',
    votes: 29
  },
  {
    id: 'cross-sector-graph',
    icon: '🕸️',
    title: 'Cross-sector Graph',
    description: 'Discover hidden connections',
    votes: 51
  }
]

export default function FeatureVoting() {
  const [votes, setVotes] = useState(features.reduce((acc, feature) => ({
    ...acc,
    [feature.id]: feature.votes
  }), {} as Record<string, number>))
  
  const [userVote, setUserVote] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleVote = (featureId: string) => {
    if (userVote) return // Already voted
    
    setVotes(prev => ({
      ...prev,
      [featureId]: prev[featureId] + 1
    }))
    setUserVote(featureId)
    setShowResults(true)
  }

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Perspective Matters</h3>
        <p className="text-gray-600">
          {userVote ? 'Thank you for voting! Here are the results:' : 'Which feature would create most value for you?'}
        </p>
        {showResults && (
          <div className="mt-2 text-sm text-gray-500">
            {totalVotes} total votes from the community
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const percentage = showResults ? Math.round((votes[feature.id] / totalVotes) * 100) : 0
          const isSelected = userVote === feature.id
          
          return (
            <button
              key={feature.id}
              onClick={() => handleVote(feature.id)}
              disabled={!!userVote}
              className={`relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-left overflow-hidden ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              } ${userVote && !isSelected ? 'opacity-75' : ''}`}
            >
              {/* Progress bar background */}
              {showResults && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{feature.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      {showResults && (
                        <div className="text-sm font-medium text-blue-600">
                          {percentage}%
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    {showResults && (
                      <div className="text-xs text-gray-500">
                        {votes[feature.id]} votes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      {!userVote && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Click any feature to see community results</p>
        </div>
      )}
    </div>
  )
}