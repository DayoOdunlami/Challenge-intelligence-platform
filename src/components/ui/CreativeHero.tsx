"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface ParticleConfig {
  // Particle appearance
  minSize?: number
  maxSize?: number
  colorRange?: {
    hueStart: number
    hueEnd: number
    saturation: number
    lightness: number
  }

  // Grid settings
  gridSize?: number

  // Interaction settings
  maxDistance?: number
  forceFactor?: number
  returnSpeed?: number

  // Connection settings
  connectionDistance?: number
  connectionOpacity?: number
  connectionWidth?: number
  connectionColor?: string

  // Animation settings
  mouseEasing?: number
}

interface ContentArea {
  x: number
  y: number
  radius?: number
  width?: number
  height?: number
  shape?: 'circle' | 'rectangle'
  fadeStart?: number // 0-1, where fade begins (0 = center, 1 = edge)
}

interface CreativeHeroProps {
  config?: ParticleConfig
  className?: string
  contentAreas?: ContentArea[]
  autoDetectContent?: boolean
  sectionTheme?: 'default' | 'fragmented-vs-organized' | 'convergence' | 'pulsing' | 'timeline-flow' | 'rippling'
}

// Default configuration using CPC colors - optimized for performance with stronger effects
export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  minSize: 2,
  maxSize: 5,
  colorRange: {
    hueStart: 150,
    hueEnd: 170,
    saturation: 70,
    lightness: 40,
  },
  gridSize: 40, // Optimized density for performance (15% fewer particles)
  maxDistance: 120, // More focused interaction area
  forceFactor: 2.0, // Stronger base force
  returnSpeed: 12, // Faster return to base
  connectionDistance: 51, // Optimized connections (15% fewer connections)
  connectionOpacity: 0.25, // More visible connections
  connectionWidth: 1.0, // Thicker connections
  connectionColor: "rgba(0, 110, 81, {opacity})",
  mouseEasing: 0.2, // Smoother, more efficient mouse following
}

export function CreativeHero({
  config = DEFAULT_PARTICLE_CONFIG,
  className = "w-full h-full absolute inset-0 -z-10",
  contentAreas,
  autoDetectContent = true,
  sectionTheme = 'default',
}: CreativeHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true) // Start visible
  const animationRef = useRef<number>(0)
  const [detectedAreas, setDetectedAreas] = useState<ContentArea[]>([])
  const [mouseIntensity, setMouseIntensity] = useState(0)

  // Auto-detect content areas
  useEffect(() => {
    if (!autoDetectContent || !containerRef.current) return

    const detectContentAreas = () => {
      const container = containerRef.current
      if (!container) return

      const section = container.closest('section')
      if (!section) return

      const areas: ContentArea[] = []

      // Find all content elements (cards, text blocks, headings)
      const contentSelectors = [
        // Background colors
        '.bg-white', '.bg-gray-50', '.bg-green-50', '.bg-purple-50',
        '.bg-yellow-50', '.bg-blue-50', '.bg-indigo-50', '.bg-red-50',
        // Interactive elements
        'button', '[role="button"]', '.cursor-pointer',
        // Cards and containers
        '[class*="border"]', '[class*="rounded"]', '[class*="shadow"]',
        // Text elements
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', '.text-center', '[class*="text-"]',
        // Layout containers
        '[class*="max-w-"]', '[class*="grid"]', '[class*="flex"]',
        // Specific interactive components
        '[class*="hover:"]', '[class*="transition"]',
        // Any element with padding/margin (likely content)
        '[class*="p-"]', '[class*="px-"]', '[class*="py-"]',
        '[class*="m-"]', '[class*="mx-"]', '[class*="my-"]'
      ]

      contentSelectors.forEach(selector => {
        try {
          const elements = section.querySelectorAll(selector)
          elements.forEach(element => {
            const rect = element.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()

            // Skip very small elements (likely decorative)
            if (rect.width < 20 || rect.height < 20) return

            // Convert to canvas coordinates
            const x = rect.left - containerRect.left + rect.width / 2
            const y = rect.top - containerRect.top + rect.height / 2

            // Only add if element is within the canvas area and has reasonable size
            if (x >= 0 && y >= 0 && x <= containerRect.width && y <= containerRect.height &&
              rect.width > 50 && rect.height > 20) {

              // All elements get rectangular masks for better coverage
              areas.push({
                x,
                y,
                width: rect.width * 1.2, // 20% padding (120% total)
                height: rect.height * 1.2,
                shape: 'rectangle',
                fadeStart: 0.83 // Content is 100% of original, fade starts at 100/120 = 83%
              })
            }
          })
        } catch (e) {
          // Skip invalid selectors
        }
      })

      // Debug: Log detected areas
      console.log(`Auto-detected ${areas.length} content areas in section:`, areas.slice(0, 5))

      setDetectedAreas(areas)
    }

    // Detect on mount and resize
    detectContentAreas()
    window.addEventListener('resize', detectContentAreas)

    // Also detect after a short delay to catch dynamically loaded content
    const timeout = setTimeout(detectContentAreas, 1000)

    return () => {
      window.removeEventListener('resize', detectContentAreas)
      clearTimeout(timeout)
    }
  }, [autoDetectContent])

  // Intersection Observer for performance
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let devicePixelRatio: number

    // Set canvas dimensions - Chrome-optimized
    const setCanvasDimensions = () => {
      // Clamp devicePixelRatio to prevent Chrome scaling issues
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()

      // Round dimensions to prevent sub-pixel rendering issues in Chrome
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)

      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      
      // Set CSS size to prevent Chrome scaling artifacts
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'

      // Reset transform and apply clean scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(devicePixelRatio, devicePixelRatio)
      
      // Chrome-specific optimizations
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Mouse position
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top

      // Calculate mouse intensity for section themes
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
      const currentDistance = Math.sqrt(
        Math.pow(targetX - centerX, 2) + Math.pow(targetY - centerY, 2)
      )

      // Check if hovering over special elements
      const hoveredElement = document.elementFromPoint(e.clientX, e.clientY)
      const isHoveringInteractive = hoveredElement?.closest('[data-particle-zone]')

      // Enhanced intensity for interactive elements
      const baseIntensity = Math.max(0.2, 1 - currentDistance / maxDistance) // Minimum 20% intensity
      setMouseIntensity(isHoveringInteractive ? 1.0 : baseIntensity * 1.5) // Full intensity on hover
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      baseX: number
      baseY: number
      density: number
      color: string
      distance: number
      illumination: number
      ringIndex: number
      inOrbit: boolean
      orbitFade: number
      burstIntensity: number
      dataFlow: number
      lightning: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.baseX = x
        this.baseY = y
        this.size = Math.random() * (config.maxSize! - config.minSize!) + config.minSize!
        this.density = Math.random() * 30 + 1
        this.distance = 0
        this.illumination = 0
        this.ringIndex = 0
        this.inOrbit = false
        this.orbitFade = 0
        this.burstIntensity = 0
        this.dataFlow = 0
        this.lightning = 0

        // CPC brand colors for particles with subtle transparency
        const cpcColors = [
          "rgba(0, 110, 81, 0.2)", // Primary CPC green
          "rgba(204, 226, 220, 0.25)", // Mint green
          "rgba(46, 45, 43, 0.15)", // Charcoal
          "rgba(95, 188, 162, 0.2)", // Integrated green
        ]
        this.color = cpcColors[Math.floor(Math.random() * cpcColors.length)]
      }

      update() {
        // Calculate distance between mouse and particle
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        this.distance = Math.sqrt(dx * dx + dy * dy)

        const forceDirectionX = dx / this.distance
        const forceDirectionY = dy / this.distance

        const maxDist = config.maxDistance!
        let force = ((maxDist - this.distance) / maxDist) * config.forceFactor!

        // Apply section-specific effects with MUCH stronger forces
        if (sectionTheme === 'convergence') {
          // Hero section: Strong network formation - particles snap into network patterns
          if (this.distance < maxDist * 1.5) { // Larger interaction area
            const attractionForce = 0.8 * mouseIntensity // Much stronger force
            const networkRadius = 120 // Larger network

            // Create distinct network nodes - 8 points around mouse
            const networkPoints = 8
            const angle = Math.atan2(this.baseY - mouseY, this.baseX - mouseX)
            const snapAngle = Math.round(angle / (Math.PI * 2 / networkPoints)) * (Math.PI * 2 / networkPoints)

            // Add some variation for inner/outer rings - MUCH CLOSER to cursor
            const ringVariation = Math.floor(this.density / 10) % 3
            const actualRadius = (networkRadius * 0.4) + (ringVariation * 25) // Start at 48px instead of 120px

            const targetX = mouseX + Math.cos(snapAngle) * actualRadius
            const targetY = mouseY + Math.sin(snapAngle) * actualRadius

            // STRONG movement toward network position
            this.x += (targetX - this.x) * attractionForce
            this.y += (targetY - this.y) * attractionForce

            // Override normal repulsion completely
            force = 0
          }
        } else if (sectionTheme === 'pulsing') {
          // Future features: Particles and lines flying out from cursor
          if (this.distance < maxDist * 2) {
            const time = Date.now() * 0.003
            const particleAngle = Math.atan2(this.baseY - mouseY, this.baseX - mouseX)
            
            // Create bursts of particles flying outward
            const burstCycle = (time + this.density * 0.1) % 4 // 4-second burst cycle
            
            if (burstCycle < 1.5) {
              // Burst phase - particles fly outward
              const burstForce = Math.sin(burstCycle * Math.PI / 1.5) * mouseIntensity * 2
              const flySpeed = burstForce * 8
              
              // Fly outward from cursor
              this.x += Math.cos(particleAngle) * flySpeed
              this.y += Math.sin(particleAngle) * flySpeed
              
              // Add some spiral motion for visual interest
              const spiralAngle = particleAngle + time * 2
              this.x += Math.cos(spiralAngle) * burstForce * 2
              this.y += Math.sin(spiralAngle) * burstForce * 2
              
              // Enhanced particle for burst effect
              this.burstIntensity = burstForce
              
              force = 0
            } else {
              // Return phase - gentle return to base
              this.burstIntensity = Math.max(0, this.burstIntensity - 0.05)
            }
          } else {
            this.burstIntensity = 0
          }
        } else if (sectionTheme === 'timeline-flow') {
          // Split section: Data Flow Network (left) vs Neural Lightning (right)
          const canvasWidth = (canvas?.width || 0) / devicePixelRatio
          const isLeftSide = this.baseX < canvasWidth / 2
          
          if (isLeftSide) {
            // LEFT SIDE: Option A - Data Flow Network
            if (this.distance < maxDist * 1.5) {
              const time = Date.now() * 0.001
              
              // Create 3 connection zones (Discover → Match → Accelerate)
              const zone1X = canvasWidth * 0.1
              const zone2X = canvasWidth * 0.25
              const zone3X = canvasWidth * 0.4
              const zoneY = mouseY
              
              // Determine which connection line this particle should be on
              const connectionId = Math.floor(this.density) % 3
              
              let targetX = this.x
              let targetY = this.y
              let isOnPath = false
              
              // Connection paths between zones
              if (connectionId === 0) {
                // Path 1: Zone1 → Zone2
                const pathProgress = (this.baseX - zone1X) / (zone2X - zone1X)
                if (pathProgress >= 0 && pathProgress <= 1) {
                  targetX = zone1X + pathProgress * (zone2X - zone1X)
                  targetY = zoneY + Math.sin(pathProgress * Math.PI) * 20 // Curved path
                  isOnPath = true
                }
              } else if (connectionId === 1) {
                // Path 2: Zone2 → Zone3
                const pathProgress = (this.baseX - zone2X) / (zone3X - zone2X)
                if (pathProgress >= 0 && pathProgress <= 1) {
                  targetX = zone2X + pathProgress * (zone3X - zone2X)
                  targetY = zoneY - Math.sin(pathProgress * Math.PI) * 25 // Curved path
                  isOnPath = true
                }
              } else {
                // Path 3: Zone1 → Zone3 (direct connection)
                const pathProgress = (this.baseX - zone1X) / (zone3X - zone1X)
                if (pathProgress >= 0 && pathProgress <= 1) {
                  targetX = zone1X + pathProgress * (zone3X - zone1X)
                  targetY = zoneY + Math.sin(pathProgress * Math.PI * 0.5) * 15
                  isOnPath = true
                }
              }
              
              if (isOnPath) {
                // Animate data packets along the paths
                const packetSpeed = time * 2 + this.density * 0.1
                const packetPosition = (packetSpeed % 2) / 2 // 0 to 1
                
                // Enhanced brightness for data packets
                this.dataFlow = Math.sin(packetPosition * Math.PI) * mouseIntensity
                
                // Move toward path
                this.x += (targetX - this.x) * 0.3
                this.y += (targetY - this.y) * 0.3
                
                force = 0
              } else {
                this.dataFlow = 0
              }
            }
          } else {
            // RIGHT SIDE: Option D - Neural Lightning Network
            if (this.distance < maxDist * 1.5) {
              const time = Date.now() * 0.003
              
              // Create neural nodes
              const nodePositions = [
                { x: canvasWidth * 0.6, y: mouseY - 60 },
                { x: canvasWidth * 0.75, y: mouseY },
                { x: canvasWidth * 0.9, y: mouseY + 60 },
                { x: canvasWidth * 0.7, y: mouseY - 30 },
                { x: canvasWidth * 0.8, y: mouseY + 30 }
              ]
              
              // Find closest node
              let closestNode = nodePositions[0]
              let minDistance = Infinity
              
              nodePositions.forEach(node => {
                const dist = Math.sqrt(
                  Math.pow(this.baseX - node.x, 2) + Math.pow(this.baseY - node.y, 2)
                )
                if (dist < minDistance) {
                  minDistance = dist
                  closestNode = node
                }
              })
              
              // Lightning effect - particles form branching connections
              if (minDistance < 80) {
                const lightningPhase = (time + this.density * 0.1) % 3
                
                if (lightningPhase < 0.3) {
                  // Lightning strike phase
                  const strikeIntensity = Math.sin(lightningPhase * Math.PI / 0.3)
                  
                  // Move toward node with random branching
                  const branchOffset = (Math.sin(time * 10 + this.density) * 15) * strikeIntensity
                  this.x += (closestNode.x - this.x + branchOffset) * 0.4
                  this.y += (closestNode.y - this.y + branchOffset * 0.5) * 0.4
                  
                  // Enhanced brightness for lightning
                  this.lightning = strikeIntensity * mouseIntensity
                  
                  force = 0
                } else {
                  // Fade phase
                  this.lightning = Math.max(0, this.lightning - 0.05)
                }
              } else {
                this.lightning = 0
              }
            }
          }
        } else if (sectionTheme === 'rippling') {
          // Audio section: DRAMATIC rippling waves emanating from mouse
          if (this.distance < maxDist * 2.0) {
            const rippleForce = 1.2 * mouseIntensity // Much stronger

            // Create concentric ripple waves
            const waveSpeed = Date.now() * 0.005 // Faster waves
            const distanceFromMouse = Math.sqrt(
              Math.pow(this.baseX - mouseX, 2) + Math.pow(this.baseY - mouseY, 2)
            )

            // Multiple wave frequencies for richer effect - MUCH STRONGER
            const wave1 = Math.sin(distanceFromMouse * 0.015 - waveSpeed) * 40 // Much bigger waves
            const wave2 = Math.sin(distanceFromMouse * 0.01 - waveSpeed * 1.3) * 30
            const wave3 = Math.sin(distanceFromMouse * 0.02 - waveSpeed * 0.7) * 25

            const totalWave = (wave1 + wave2 + wave3) * rippleForce

            // Apply wave displacement perpendicular to radius - STRONGER
            const angle = Math.atan2(this.baseY - mouseY, this.baseX - mouseX)
            const perpAngle = angle + Math.PI / 2

            this.x += Math.cos(perpAngle) * totalWave * 0.8 // Much stronger perpendicular movement
            this.y += Math.sin(perpAngle) * totalWave * 0.8

            // Strong radial movement for dramatic effect
            const radialWave = Math.sin(distanceFromMouse * 0.008 - waveSpeed) * 20 * rippleForce
            this.x += Math.cos(angle) * radialWave * 0.6
            this.y += Math.sin(angle) * radialWave * 0.6

            force = 0
          }
        } else if (sectionTheme === 'fragmented-vs-organized') {
          // Unified orbital rings across entire section (both left and right)
          
          // Ambient effect (20% intensity)
          const ambientIntensity = 0.2
          // Hover effect (additional 80% intensity)
          const hoverIntensity = mouseIntensity * 0.8
          const totalIntensity = ambientIntensity + hoverIntensity

          // Smaller effect area - reduced from maxDist * 2 to maxDist * 1.2
          if (this.distance < maxDist * 1.2) {
            const centerX = mouseX
            const centerY = mouseY
            const angle = Math.atan2(this.y - centerY, this.x - centerX)

            // Create 5 distinct orbital rings across entire section
            const particleId = Math.floor(this.baseX * 0.1 + this.baseY * 0.1)
            const ringIndex = particleId % 5 // 5 rings for variety

            // Tighter, more focused rings
            const ringDistances = [35, 60, 90, 125, 165] // Smaller, more focused area
            const ringSpeeds = [2.0, -1.6, 1.3, -1.0, 0.7] // Slower, more elegant speeds
            const targetDistance = ringDistances[ringIndex]
            const orbitalSpeed = ringSpeeds[ringIndex] * totalIntensity * 3.5 // Reduced multiplier

            // Calculate perfect circular position
            const currentDistance = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2)

            // Strong force to maintain exact ring distance
            const radialForce = (targetDistance - currentDistance) * 0.8
            const radialX = Math.cos(angle) * radialForce
            const radialY = Math.sin(angle) * radialForce

            // Smooth orbital motion
            const tangentX = -Math.sin(angle) * orbitalSpeed
            const tangentY = Math.cos(angle) * orbitalSpeed

            this.x += tangentX + radialX
            this.y += tangentY + radialY

            // Set ring-specific properties for enhanced visibility
            this.ringIndex = ringIndex
            this.inOrbit = true
            this.orbitFade = Math.min(1, this.orbitFade + 0.1) // Smooth fade in

            force = 0
          } else {
            // Gradual fade out to prevent blinking
            this.inOrbit = false
            this.orbitFade = Math.max(0, this.orbitFade - 0.05) // Slower fade out
          }

          // Gentle return to grid when mouse is far away
          if (this.distance > maxDist * 1.5) {
            const returnForce = 1.5
            if (this.x !== this.baseX) {
              const dx = this.x - this.baseX
              this.x -= dx / (config.returnSpeed! * returnForce)
            }
            if (this.y !== this.baseY) {
              const dy = this.y - this.baseY
              this.y -= dy / (config.returnSpeed! * returnForce)
            }
          }
        }

        // Apply forces only for non-special themes or when not in special effect
        if (sectionTheme === 'timeline-flow' || sectionTheme === 'pulsing') {
          // For timeline-flow and pulsing, minimize scatter - only gentle return to base
          if (this.x !== this.baseX) {
            const dx = this.x - this.baseX
            this.x -= dx / (config.returnSpeed! * 0.5) // Slower return for smoother effect
          }
          if (this.y !== this.baseY) {
            const dy = this.y - this.baseY
            this.y -= dy / (config.returnSpeed! * 0.5)
          }
        } else {
          // Normal scatter behavior for other themes
          if (this.distance < maxDist) {
            const directionX = forceDirectionX * force * this.density
            const directionY = forceDirectionY * force * this.density

            this.x -= directionX
            this.y -= directionY
          } else {
            if (this.x !== this.baseX) {
              const dx = this.x - this.baseX
              this.x -= dx / config.returnSpeed!
            }
            if (this.y !== this.baseY) {
              const dy = this.y - this.baseY
              this.y -= dy / config.returnSpeed!
            }
          }
        }
      }

      draw(fadeOpacity = 1) {
        if (!ctx) return

        // Apply fade opacity and special effects to particle color
        const colorMatch = this.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
        if (colorMatch) {
          const [, r, g, b, a] = colorMatch
          
          // Ring-specific colors for orbital rings (with smooth fade)
          if (this.orbitFade > 0) {
            const ringColors = [
              "rgba(0, 110, 81, 0.9)",    // CPC Green
              "rgba(95, 188, 162, 0.8)",  // Light Green  
              "rgba(46, 45, 43, 0.7)",    // Charcoal
              "rgba(204, 226, 220, 0.9)", // Mint
              "rgba(0, 150, 120, 0.8)"    // Teal
            ]
            const baseColor = ringColors[this.ringIndex] || this.color
            
            // Apply fade opacity to prevent blinking
            const colorMatch = baseColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
            if (colorMatch) {
              const [, r, g, b, a] = colorMatch
              const fadedOpacity = parseFloat(a) * this.orbitFade * fadeOpacity
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fadedOpacity})`
              ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${fadedOpacity * 0.8})`
              ctx.shadowBlur = 8 * this.orbitFade
            } else {
              ctx.fillStyle = baseColor
              ctx.shadowBlur = Math.round(8 * this.orbitFade) // Round for Chrome performance
            }
          }
          // Enhanced brightness for illuminated particles (timeline-flow)
          else if (this.illumination > 0) {
            const enhancedR = Math.min(255, parseInt(r) + this.illumination * 100)
            const enhancedG = Math.min(255, parseInt(g) + this.illumination * 120)
            const enhancedB = Math.min(255, parseInt(b) + this.illumination * 80)
            const enhancedA = Math.min(1, parseFloat(a) * fadeOpacity + this.illumination * 0.6)
            
            ctx.fillStyle = `rgba(${enhancedR}, ${enhancedG}, ${enhancedB}, ${enhancedA})`
            
            if (this.illumination > 0.5) {
              ctx.shadowColor = `rgba(0, 110, 81, ${this.illumination * 0.8})`
              ctx.shadowBlur = Math.round(this.illumination * 15) // Round for Chrome performance
            }
          }
          // Data flow effect (timeline-flow left side)
          else if (this.dataFlow > 0) {
            const flowR = Math.min(255, parseInt(r) + this.dataFlow * 80)
            const flowG = Math.min(255, parseInt(g) + this.dataFlow * 120)
            const flowB = Math.min(255, parseInt(b) + this.dataFlow * 60)
            const flowA = Math.min(1, parseFloat(a) * fadeOpacity + this.dataFlow * 0.7)
            
            ctx.fillStyle = `rgba(${flowR}, ${flowG}, ${flowB}, ${flowA})`
            ctx.shadowColor = `rgba(0, 150, 100, ${this.dataFlow * 0.8})`
            ctx.shadowBlur = Math.round(this.dataFlow * 12) // Round for Chrome performance
          }
          // Lightning effect (timeline-flow right side)
          else if (this.lightning > 0) {
            const lightR = Math.min(255, parseInt(r) + this.lightning * 200)
            const lightG = Math.min(255, parseInt(g) + this.lightning * 150)
            const lightB = Math.min(255, parseInt(b) + this.lightning * 255)
            const lightA = Math.min(1, parseFloat(a) * fadeOpacity + this.lightning * 0.9)
            
            ctx.fillStyle = `rgba(${lightR}, ${lightG}, ${lightB}, ${lightA})`
            ctx.shadowColor = `rgba(100, 200, 255, ${this.lightning * 0.9})`
            ctx.shadowBlur = Math.round(this.lightning * 25) // Round for Chrome performance
          }
          // Burst effect for flying particles (pulsing)
          else if (this.burstIntensity > 0) {
            const burstR = Math.min(255, parseInt(r) + this.burstIntensity * 150)
            const burstG = Math.min(255, parseInt(g) + this.burstIntensity * 100)
            const burstB = Math.min(255, parseInt(b) + this.burstIntensity * 50)
            const burstA = Math.min(1, parseFloat(a) * fadeOpacity + this.burstIntensity * 0.8)
            
            ctx.fillStyle = `rgba(${burstR}, ${burstG}, ${burstB}, ${burstA})`
            ctx.shadowColor = `rgba(255, 200, 0, ${this.burstIntensity * 0.6})`
            ctx.shadowBlur = Math.round(this.burstIntensity * 20) // Round for Chrome performance
          }
          // Normal particles
          else {
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * fadeOpacity})`
            ctx.shadowBlur = 0
          }
        } else {
          ctx.fillStyle = this.color
        }

        // Calculate final size with effects
        let finalSize = this.size
        if (this.orbitFade > 0) {
          finalSize = this.size * (1 + (0.2 + this.ringIndex * 0.1) * this.orbitFade) // Smooth size transition
        } else if (this.illumination > 0) {
          finalSize = this.size * (1 + this.illumination * 0.5)
        } else if (this.dataFlow > 0) {
          finalSize = this.size * (1 + this.dataFlow * 0.6) // Data packets
        } else if (this.lightning > 0) {
          finalSize = this.size * (1 + this.lightning * 0.8) // Lightning nodes
        } else if (this.burstIntensity > 0) {
          finalSize = this.size * (1 + this.burstIntensity * 0.8)
        }

        ctx.beginPath()
        ctx.arc(this.x, this.y, finalSize, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
        
        // Reset shadow for next particle
        ctx.shadowBlur = 0
      }
    }

    // Create particle grid
    const particlesArray: Particle[] = []

    function init() {
      particlesArray.length = 0

      const canvasWidth = (canvas?.width || 0) / devicePixelRatio
      const canvasHeight = (canvas?.height || 0) / devicePixelRatio

      const numX = Math.floor(canvasWidth / config.gridSize!)
      const numY = Math.floor(canvasHeight / config.gridSize!)

      for (let y = 0; y < numY; y++) {
        for (let x = 0; x < numX; x++) {
          const posX = x * config.gridSize! + config.gridSize! / 2
          const posY = y * config.gridSize! + config.gridSize! / 2
          particlesArray.push(new Particle(posX, posY))
        }
      }
    }

    init()

    // Helper function to calculate fade opacity based on content areas
    const calculateFadeOpacity = (x: number, y: number) => {
      const canvasWidth = canvas.width / devicePixelRatio
      const canvasHeight = canvas.height / devicePixelRatio

      // Combine manual content areas with auto-detected ones
      const allAreas = [
        ...(contentAreas || []),
        ...detectedAreas
      ]

      if (allAreas.length === 0) {
        // Much larger content areas to ensure masking is visible
        const areas = [
          // Large center area covering most content
          { x: canvasWidth / 2, y: canvasHeight / 2, radius: Math.min(canvasWidth, canvasHeight) * 0.4 },
          // Additional areas for cards
          { x: canvasWidth * 0.25, y: canvasHeight * 0.7, radius: canvasWidth * 0.15 },
          { x: canvasWidth * 0.75, y: canvasHeight * 0.7, radius: canvasWidth * 0.15 },
        ]

        let minOpacity = 1
        for (const area of areas) {
          const distance = Math.sqrt(
            Math.pow(x - area.x, 2) + Math.pow(y - area.y, 2)
          )

          if (distance < area.radius) {
            // Much more aggressive fade - 0 at center to 1 at radius edge
            const fadeOpacity = Math.min(1, distance / area.radius)
            minOpacity = Math.min(minOpacity, fadeOpacity)
          }
        }
        return minOpacity
      }

      // Use all content areas (manual + auto-detected)
      let minOpacity = 1
      for (const area of allAreas) {
        // Convert relative positions to absolute if needed
        const areaX = area.x < 1 ? area.x * canvasWidth : area.x
        const areaY = area.y < 1 ? area.y * canvasHeight : area.y

        let fadeOpacity = 1

        if (area.shape === 'rectangle' && area.width && area.height) {
          // Rectangular mask
          const halfWidth = area.width / 2
          const halfHeight = area.height / 2
          const dx = Math.abs(x - areaX)
          const dy = Math.abs(y - areaY)

          // Check if point is inside rectangle
          if (dx < halfWidth && dy < halfHeight) {
            // Calculate distance from center as percentage of rectangle
            const distanceX = dx / halfWidth
            const distanceY = dy / halfHeight
            const maxDistance = Math.max(distanceX, distanceY)

            const fadeStart = area.fadeStart || 0.83 // Default: content area invisible, fade in outer 20%
            if (maxDistance < fadeStart) {
              fadeOpacity = 0 // Completely invisible over content area
            } else {
              // Smooth fade in outer 20% buffer zone (from fadeStart to edge)
              fadeOpacity = (maxDistance - fadeStart) / (1 - fadeStart)
            }
          }
        } else {
          // Circular mask (default)
          const areaRadius = area.radius || Math.min(area.width || 100, area.height || 100) / 2
          const distance = Math.sqrt(
            Math.pow(x - areaX, 2) + Math.pow(y - areaY, 2)
          )

          if (distance < areaRadius) {
            const fadeStart = area.fadeStart || 0.83 // Default: content area invisible, fade in outer 20%
            const fadeStartDistance = areaRadius * fadeStart

            if (distance < fadeStartDistance) {
              fadeOpacity = 0 // Completely invisible over content area
            } else {
              // Smooth fade in outer 20% buffer zone (from fadeStart to edge)
              fadeOpacity = (distance - fadeStartDistance) / (areaRadius - fadeStartDistance)
            }
          }
        }

        minOpacity = Math.min(minOpacity, fadeOpacity)
      }

      return minOpacity
    }

    // Animation loop - Chrome optimized
    let lastFrameTime = 0
    const animate = (currentTime: number = 0) => {
      if (!isVisible) return

      // Chrome optimization: Limit frame rate to prevent stuttering
      if (currentTime - lastFrameTime < 16.67) { // ~60fps max
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse following
      mouseX += (targetX - mouseX) * config.mouseEasing!
      mouseY += (targetY - mouseY) * config.mouseEasing!

      // Draw particles and connections
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()

        // Calculate fade opacity for this particle
        const fadeOpacity = calculateFadeOpacity(particlesArray[i].x, particlesArray[i].y)

        // Debug: Log detected areas occasionally
        if (i === 0 && Math.random() < 0.001) {
          console.log(`Detected ${detectedAreas.length} content areas for masking`)
        }

        // Only draw if opacity is significant
        if (fadeOpacity > 0.01) {
          particlesArray[i].draw(fadeOpacity)
        }

        // Draw connections
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x
          const dy = particlesArray[i].y - particlesArray[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < config.connectionDistance!) {
            // Calculate fade for connection midpoint
            const midX = (particlesArray[i].x + particlesArray[j].x) / 2
            const midY = (particlesArray[i].y + particlesArray[j].y) / 2
            const connectionFade = calculateFadeOpacity(midX, midY)

            if (connectionFade > 0.01) {
              let baseOpacity = (config.connectionOpacity! - distance / (config.connectionDistance! * 5)) * 0.4

              // Apply section-specific connection effects
              if (sectionTheme === 'fragmented-vs-organized') {
                const canvasWidth = (canvas?.width || 0) / devicePixelRatio
                const isLeftConnection = midX < canvasWidth / 2
                const ambientIntensity = 0.2
                const hoverIntensity = mouseIntensity * 0.8
                const totalIntensity = ambientIntensity + hoverIntensity

                if (isLeftConnection) {
                  // Left side: Weaker, more broken connections
                  baseOpacity *= (1 - totalIntensity * 0.7)
                  // Random connection breaks
                  if (Math.random() < totalIntensity * 0.3) {
                    baseOpacity = 0
                  }
                } else {
                  // Right side: Enhanced interconnections during swirl
                  baseOpacity *= (1 + totalIntensity * 1.2) // Much stronger connections

                  // Create more connections during spiral motion
                  if (totalIntensity > 0.3 && distance < config.connectionDistance! * 1.5) {
                    baseOpacity *= 1.5 // Extra bright connections
                  }
                }
              }

              const finalOpacity = baseOpacity * connectionFade
              const connectionColor = `rgba(0, 110, 81, ${finalOpacity})`

              if (ctx) {
                ctx.beginPath()
                ctx.strokeStyle = connectionColor
                ctx.lineWidth = config.connectionWidth!
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y)
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y)
                ctx.stroke()
              }
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions()
      init()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [config, isVisible])

  return (
    <motion.div
      ref={containerRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 -z-10"
        style={{ display: "block" }}
      />
    </motion.div>
  )
}