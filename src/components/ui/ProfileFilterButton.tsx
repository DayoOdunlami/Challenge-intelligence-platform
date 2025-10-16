'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

interface ProfileFilterButtonProps {
  onProfileChange?: (profile: string | null) => void
}

export default function ProfileFilterButton({ onProfileChange }: ProfileFilterButtonProps) {
  const searchParams = useSearchParams()
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const profile = searchParams.get('profile')
    setSelectedProfile(profile)
    onProfileChange?.(profile)
  }, [searchParams, onProfileChange])

  const profiles = [
    {
      id: 'buyer-example',
      name: 'James Patterson',
      role: 'Network Rail',
      type: 'Buyer',
      color: 'bg-blue-500'
    },
    {
      id: 'sme-example', 
      name: 'Dr. Sarah Chen',
      role: 'Sensor Dynamics',
      type: 'SME',
      color: 'bg-indigo-500'
    }
  ]

  const currentProfile = profiles.find(p => p.id === selectedProfile)

  const handleProfileSelect = (profileId: string | null) => {
    setSelectedProfile(profileId)
    setIsOpen(false)
    onProfileChange?.(profileId)
    
    // Update URL
    const url = new URL(window.location.href)
    if (profileId) {
      url.searchParams.set('profile', profileId)
    } else {
      url.searchParams.delete('profile')
    }
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition ${
          currentProfile 
            ? 'bg-white border-gray-300 shadow-sm' 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
      >
        {currentProfile ? (
          <>
            <div className={`w-8 h-8 rounded-full ${currentProfile.color} flex items-center justify-center text-white text-sm font-bold`}>
              {currentProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 text-sm">{currentProfile.name}</div>
              <div className="text-xs text-gray-500">{currentProfile.role}</div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-gray-600 font-medium">Select Profile</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <button
              onClick={() => handleProfileSelect(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition ${
                !selectedProfile ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">No Profile</div>
                <div className="text-xs text-gray-500">View all challenges</div>
              </div>
            </button>
            
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition ${
                  selectedProfile === profile.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${profile.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">{profile.name}</div>
                  <div className="text-xs text-gray-500">{profile.role} • {profile.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}