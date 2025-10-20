import Link from "next/link"
import { MessageCircle, Users, Database, Mail, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TechnologyCard } from "@/components/technology-card"
import { InnovationStage } from "@/components/innovation-stage"
import { StationTimeline } from "@/components/station-timeline"
import { StationContactForm } from "@/components/station-contact-form"
import { StationHeroAnimation } from "@/components/station-hero-animation"
import { StationFloatingNav } from "@/components/station-floating-nav"
import { ScrollProgress } from "@/components/scroll-progress"
import { SectionHeading } from "@/components/section-heading"
import { AIChatPopup } from "@/components/ai-chat-popup"
import { FloatingChatButton } from "@/components/floating-chat-button"

export default function StationInnovationZone() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CCE2DC]/20 via-white to-[#CCE2DC]/10 text-[#2E2D2B] overflow-hidden">
      <ScrollProgress />
      <StationFloatingNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <StationHeroAnimation />
        </div>

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80 rounded-2xl -m-4 p-4"></div>
            <div className="relative z-10">
              <div className="inline-block">
                <div className="relative px-4 py-2 text-sm font-medium rounded-full bg-[#CCE2DC]/50 backdrop-blur-sm border border-[#006E51]/20 mb-4">
                  <span className="relative z-10 text-[#006E51]">A national space to test, connect, and scale</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="block text-[#2E2D2B]">Welcome to the</span>
                <span className="text-[#006E51]">Station Innovation Zone</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-[600px]">
                Test, connect, and scale station-based innovation with ease. Join a community of innovators transforming
                transport infrastructure.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <AIChatPopup
                  triggerElement={
                    <Button className="relative overflow-hidden group bg-[#006E51] hover:bg-[#005A42] text-white border-0">
                      <span className="relative z-10 flex items-center">
                        Ask the AI Assistant <MessageCircle className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white"
                >
                  Explore the Zone
                </Button>
              </div>

              {/* Sample chat bubble */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-[#CCE2DC] shadow-sm max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#006E51] flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">"How can I test my accessibility innovation at a station?"</p>
                    <div className="mt-2 text-xs text-[#006E51] font-medium">
                      Ask me anything about the innovation zone →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            {/* Chatbot Illustration */}
            <AIChatPopup
              triggerElement={
                <div className="relative group cursor-pointer">
                  <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center transition-all duration-500">
                    <div className="relative transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 transform-gpu">
                      <div className="relative w-64 h-64 md:w-80 md:h-80">
                        {/* Shadow */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-300/40 rounded-full blur-sm"></div>

                        {/* Main chatbot body */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-40 bg-white rounded-[50px] border-4 border-[#006E51]"></div>

                        {/* Head */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-32 bg-white rounded-[50px] border-4 border-[#006E51] overflow-hidden">
                          {/* Face background */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-20 bg-[#006E51] rounded-[40px]">
                            {/* Eyes */}
                            <div className="absolute top-4 left-6 w-4 h-6 bg-white rounded-full"></div>
                            <div className="absolute top-4 right-6 w-4 h-6 bg-white rounded-full"></div>

                            {/* Smile */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-3">
                              <div className="w-full h-2 border-b-3 border-white rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        {/* Postman/Ticket Seller Hat */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-20">
                          {/* Hat brim */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full h-3 bg-[#4CAF50] rounded-full border-2 border-[#006E51] shadow-md"></div>
                          {/* Hat crown */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-16 bg-[#4CAF50] rounded-t-lg border-4 border-[#006E51]"></div>
                          {/* Hat band */}
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-36 h-4 bg-[#006E51] border-2 border-[#006E51]"></div>
                          {/* Hat badge/emblem with question mark */}
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#006E51] rounded-sm flex items-center justify-center transition-all duration-300 group-hover:bg-yellow-500 border-2 border-white">
                            <div className="text-white text-lg font-bold transition-all duration-300 group-hover:text-[#006E51]">
                              ?
                            </div>
                          </div>
                        </div>

                        {/* Headphones */}
                        <div className="absolute top-12 left-2 w-6 h-6 bg-[#4CAF50] rounded-full border-3 border-[#006E51]"></div>
                        <div className="absolute top-12 right-2 w-6 h-6 bg-[#4CAF50] rounded-full border-3 border-[#006E51]"></div>

                        {/* Right arm with sign/lightbulb */}
                        <div className="absolute top-24 -right-8">
                          <div className="w-6 h-16 bg-white rounded-full border-3 border-[#006E51] rotate-12"></div>

                          {/* Question mark sign (default) */}
                          <div className="absolute top-0 right-0 w-12 h-12 bg-[#4CAF50] rounded-md border-3 border-[#006E51] flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-0">
                            <div className="text-white text-xl font-bold">?</div>
                          </div>

                          {/* Light bulb (hover state) */}
                          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center transition-all duration-500 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100">
                            <div className="relative">
                              {/* Light bulb glass */}
                              <div className="w-8 h-10 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-full border-2 border-[#006E51] relative overflow-hidden">
                                {/* Light bulb inner glow */}
                                <div className="absolute inset-0 bg-gradient-to-t from-yellow-200 to-white opacity-70"></div>
                                {/* Light bulb shine effect */}
                                <div className="absolute top-1 left-1 w-2 h-4 bg-white rounded-full opacity-80"></div>
                                <div className="absolute top-2 right-2 w-1 h-2 bg-white rounded-full opacity-60"></div>

                                {/* Filament */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-4">
                                  <div className="w-[1px] h-2 bg-orange-600 absolute left-0"></div>
                                  <div className="w-[1px] h-2 bg-orange-600 absolute right-0"></div>
                                  <div className="w-3 h-[1px] bg-orange-600 absolute top-0"></div>
                                  <div className="w-2 h-[1px] bg-orange-600 absolute bottom-0 left-0.5"></div>
                                </div>
                              </div>

                              {/* Light bulb base */}
                              <div className="w-8 h-2 bg-gradient-to-b from-[#006E51] to-[#004E31] rounded-b-sm"></div>
                              <div className="w-6 h-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-sm mx-auto"></div>

                              {/* Light rays */}
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-5 bg-yellow-300 opacity-80"></div>
                              <div className="absolute -top-2 -left-2 w-1 h-4 bg-yellow-300 rotate-45 opacity-80"></div>
                              <div className="absolute -top-2 -right-2 w-1 h-4 bg-yellow-300 -rotate-45 opacity-80"></div>
                              <div className="absolute top-2 -left-4 w-4 h-1 bg-yellow-300 opacity-80"></div>
                              <div className="absolute top-2 -right-4 w-4 h-1 bg-yellow-300 opacity-80"></div>

                              {/* Glow effect */}
                              <div className="absolute -inset-4 bg-yellow-300/30 rounded-full blur-md animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        {/* Left arm */}
                        <div className="absolute top-28 -left-6">
                          <div className="w-6 h-12 bg-white rounded-full border-3 border-[#006E51] -rotate-12"></div>
                          <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#006E51] rounded-full"></div>
                        </div>
                      </div>

                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-[#4CAF50]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[#006E51]/30 flex justify-center items-start p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#006E51] animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About the Playbook Section */}
      <section id="about" className="py-32 relative">
        <div className="container relative z-10">
          <SectionHeading title="About the Playbook" subtitle="Your guide to station innovation" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-[#006E51] hover:shadow-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

                <div className="relative">
                  <h3 className="text-xl font-bold text-[#2E2D2B] mb-4">Who is this playbook for?</h3>
                  <p className="text-gray-600 mb-4">
                    This playbook is designed for innovators, startups, researchers, and organizations looking to test
                    and deploy solutions in real station environments.
                  </p>

                  <h3 className="text-xl font-bold text-[#2E2D2B] mb-4">What is a station?</h3>
                  <p className="text-gray-600 mb-4">
                    Stations are complex transport hubs that serve millions of passengers daily. They present unique
                    challenges and opportunities for innovation in accessibility, sustainability, safety, and passenger
                    experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-[#006E51] hover:shadow-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

                <div className="relative">
                  <h3 className="text-xl font-bold text-[#2E2D2B] mb-4">Why Station Innovation Zones?</h3>
                  <p className="text-gray-600 mb-4">
                    Traditional innovation often happens in isolation. Station Innovation Zones provide real-world
                    testing environments where solutions can be validated with actual users and operational constraints.
                  </p>

                  <h3 className="text-xl font-bold text-[#2E2D2B] mb-4">Building a community of practice</h3>
                  <p className="text-gray-600">
                    We aim to create a collaborative ecosystem where innovators can share learnings, access resources,
                    and scale successful solutions across the transport network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-[#006E51] hover:bg-[#005A42] text-white" asChild>
              <Link
                href="https://cp.catapult.org.uk/station-innovation/introduction/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the Full Playbook <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Technologies in the Zone Section */}
      <section id="technologies" className="py-32 relative bg-[#CCE2DC]/10">
        <div className="container relative z-10">
          <SectionHeading title="Technologies in the Zone" subtitle="Featured innovations being tested" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <TechnologyCard
              title="Heavy Luggage Safety Technology"
              description="Enforcement De-identified Video CrossTech for monitoring and ensuring passenger safety with heavy luggage."
              category="Safety"
              status="Active"
              image="https://cdn.helpfulplaces.com/cdn-cgi/image/w=300/9yrax6blz2ygtjdlbfmyzwgraqy5"
              demoUrl="https://bristol-siz.dtpr.guide/technologies/4fa5c96a-6c2a-45ba-88be-d2bd44327212"
            />
            <TechnologyCard
              title="Smart Accessibility Solutions"
              description="AI-powered wayfinding and assistance systems for passengers with disabilities."
              category="Accessibility"
              status="Active"
              image="/placeholder.svg?height=300&width=400"
              demoUrl="https://bristol-siz.dtpr.guide/"
            />
            <TechnologyCard
              title="Sustainable Energy Systems"
              description="Solar panels and energy storage solutions for carbon-neutral station operations."
              category="Sustainability"
              status="Pilot"
              image="/placeholder.svg?height=300&width=400"
              demoUrl="https://bristol-siz.dtpr.guide/"
            />
            <TechnologyCard
              title="Predictive Maintenance IoT"
              description="Sensor networks that predict equipment failures before they occur."
              category="Operations"
              status="Development"
              image="/placeholder.svg?height=300&width=400"
              demoUrl="https://bristol-siz.dtpr.guide/"
            />
            <TechnologyCard
              title="Passenger Flow Analytics"
              description="Real-time crowd monitoring and flow optimization systems."
              category="Safety"
              status="Active"
              image="/placeholder.svg?height=300&width=400"
              demoUrl="https://bristol-siz.dtpr.guide/"
            />
            <TechnologyCard
              title="Digital Wayfinding"
              description="Interactive digital signage with multilingual support and real-time updates."
              category="Experience"
              status="Pilot"
              image="/placeholder.svg?height=300&width=400"
              demoUrl="https://bristol-siz.dtpr.guide/"
            />
          </div>
        </div>
      </section>

      {/* Innovation Stages Section */}
      <section id="stages" className="py-32 relative">
        <div className="container relative z-10">
          <SectionHeading title="Innovation Stages" subtitle="Your journey from idea to implementation" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <InnovationStage
              stage={1}
              title="Fundamentals"
              description="Understanding station environments, regulations, and stakeholder requirements."
            />
            <InnovationStage
              stage={2}
              title="Propose"
              description="Developing your innovation proposal with clear objectives and success metrics."
            />
            <InnovationStage
              stage={3}
              title="Prepare"
              description="Planning your trial, securing approvals, and preparing for deployment."
            />
            <InnovationStage
              stage={4}
              title="Scouting"
              description="Identifying the right station environment and testing conditions for your innovation."
            />
            <InnovationStage
              stage={5}
              title="Monitoring"
              description="Collecting data, measuring impact, and iterating based on real-world feedback."
            />
          </div>
        </div>
      </section>

      {/* The Journey So Far Section */}
      <section id="journey" className="py-32 relative bg-[#CCE2DC]/10">
        <div className="container relative z-10">
          <SectionHeading title="The Journey So Far" subtitle="Milestones in station innovation" />

          <div className="mt-16">
            <StationTimeline />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative">
        <div className="container relative z-10">
          <SectionHeading title="Get Involved" subtitle="Join the innovation community" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-[#006E51] hover:shadow-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#006E51]/10 to-[#CCE2DC]/10 rounded-xl blur opacity-0 hover:opacity-100 transition duration-300"></div>

              <div className="relative">
                <h3 className="text-2xl font-bold mb-6 text-[#2E2D2B]">Connect with Us</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#CCE2DC] flex items-center justify-center">
                      <Mail className="h-5 w-5 text-[#006E51]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">innovation@station-zone.org</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#CCE2DC] flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#006E51]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Community</div>
                      <div className="font-medium">Join our innovation network</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#CCE2DC] flex items-center justify-center">
                      <Database className="h-5 w-5 text-[#006E51]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Resources</div>
                      <div className="font-medium">Access our knowledge hub</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-medium mb-4 text-[#2E2D2B]">Current Opportunities</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#006E51] animate-pulse-green"></div>
                    <span className="text-gray-600">Open for new innovation trials and partnerships</span>
                  </div>
                </div>
              </div>
            </div>

            <StationContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-[#2E2D2B] text-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Link href="/" className="font-bold text-xl">
              <span className="text-[#CCE2DC]">Station</span>
              <span className="text-white"> Innovation Zone</span>
            </Link>
            <p className="text-sm text-gray-400 mt-2">
              © {new Date().getFullYear()} Station Innovation Zone. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white"
              asChild
            >
              <Link href="https://cp.catapult.org.uk/station-innovation/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5" />
                <span className="sr-only">Catapult</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white"
              asChild
            >
              <Link href="mailto:innovation@station-zone.org">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </Button>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}
