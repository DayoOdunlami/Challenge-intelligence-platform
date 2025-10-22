"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Zap, Target, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/ui/TopNavigation'
import { CreativeHero } from '@/components/ui/CreativeHero'

export default function ProfileSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10 text-[#2E2D2B]">
      <TopNavigation />
      
      {/* Background */}
      <CreativeHero 
        className="fixed inset-0 z-0" 
        sectionTheme="fragmented-vs-organized"
        contentAreas={[
          // Profile cards - create particle interaction zones
          { x: 0.25, y: 0.5, width: 400, height: 500, shape: 'rectangle', fadeStart: 0.8 },
          { x: 0.75, y: 0.5, width: 400, height: 500, shape: 'rectangle', fadeStart: 0.8 }
        ]}
      />

      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                <span className="relative z-10 text-[#006E51]">Profile Examples</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E2D2B]">Choose Your Profile Type</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore how Innovation Atlas works for different user types. See real examples of how innovators and challenge owners use the platform.
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#006E51] to-[#CCE2DC] rounded-full mx-auto mt-6"></div>
          </div>

          {/* Profile Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Innovator Profile */}
            <motion.div
              className="relative overflow-hidden rounded-xl border-2 border-[#CCE2DC] bg-white/90 backdrop-blur-sm p-8 hover:border-[#006E51] hover:shadow-xl transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              data-particle-zone="innovator"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#006E51] to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2E2D2B]">Innovator Profile</h2>
                  <p className="text-gray-600">SME / Technology Provider</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  See how innovators use the platform to discover cross-sector opportunities, 
                  reuse trial evidence, and connect with relevant challenges.
                </p>
                
                <div className="space-y-3">
                  {[
                    "Find cross-sector opportunities automatically",
                    "Reuse validated evidence across sectors", 
                    "Get matched with real buyer needs",
                    "Turn one success into multiple markets"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#006E51] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/profile/sme-example">
                  <Button className="w-full bg-[#006E51] hover:bg-[#005A42] text-white">
                    View Innovator Example
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/profile/sme-profile">
                  <Button variant="outline" className="w-full border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white">
                    Interactive Profile Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-[#CCE2DC]/20 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Example:</strong> TechFlow Solutions - IoT sensor technology deployed across rail, energy, and smart cities
                </p>
              </div>
            </motion.div>

            {/* Challenge Owner Profile */}
            <motion.div
              className="relative overflow-hidden rounded-xl border-2 border-[#CCE2DC] bg-white/90 backdrop-blur-sm p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              data-particle-zone="owner"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2E2D2B]">Challenge Owner Profile</h2>
                  <p className="text-gray-600">Public Sector / Infrastructure</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  See how challenge owners use the platform to find pre-validated solutions, 
                  access trial evidence, and connect with qualified innovators.
                </p>
                
                <div className="space-y-3">
                  {[
                    "Discover pre-validated solutions from other sectors",
                    "Access verified trial evidence and case studies",
                    "Reduce procurement time significantly", 
                    "Connect with qualified innovators automatically"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/profile/buyer-example">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Challenge Owner Example
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled
                >
                  Interactive Demo (Coming Soon)
                </Button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Example:</strong> Network Rail - Innovation Procurement Manager seeking validated rail infrastructure solutions
                </p>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-[#CCE2DC]/50 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#006E51]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#006E51]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#2E2D2B] mb-2">Real Platform Users</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    These profiles are based on real users and use cases from our platform. 
                    They demonstrate actual workflows, challenges, and outcomes from cross-sector innovation matching.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 flex justify-center gap-6">
            <Link href="/visualizations">
              <Button variant="outline" className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white">
                Explore Data Visualizations
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-[#006E51]">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}