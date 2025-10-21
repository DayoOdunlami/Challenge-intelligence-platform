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
  gridSize: 35, // Much denser for clearer shape formation
  maxDistance: 180, // Larger interaction area
  forceFactor: 2.0, // Stronger base force
  returnSpeed: 8, // Much faster return to base
  connectionDistance: 60, // More connections
  connectionOpacity: 0.25, // More visible connections
  connectionWidth: 1.0, // Thicker connections
  connectionColor: "rgba(0, 110, 81, {opacity})",
  mouseEasing: 0.15, // More responsive mouse following
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

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio

      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Mouse position
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    let isMouseInCanvas = true
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top
      
      // Check if mouse is actually over the canvas
      isMouseInCanvas = (
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom
      )
      
      if (isMouseInCanvas) {
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
        const baseIntensity = Math.max(0.1, 1 - currentDistance / maxDistance) // Reduced minimum
        setMouseIntensity(isHoveringInteractive ? 1.0 : baseIntensity * 1.2)
      } else {
        // Mouse is off canvas - reduce intensity quickly
        setMouseIntensity(prev => Math.max(0, prev * 0.8)) // Rapid decay
      }
    }
    
    const handleMouseLeave = () => {
      isMouseInCanvas = false
      setMouseIntensity(0) // Immediate return to default when mouse leaves
    }

    window.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

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

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.baseX = x
        this.baseY = y
        this.size = Math.random() * (config.maxSize! - config.minSize!) + config.minSize!
        this.density = Math.random() * 30 + 1
        this.distance = 0

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
          // Future features: Simple circle formation with pulsing
          if (this.distance < maxDist * 1.2) {
            const pulseIntensity = Math.sin(Date.now() * 0.004) * 0.3 + 0.7
            const formationForce = 0.6 * pulseIntensity * mouseIntensity
            
            // Create a simple pulsing circle - much clearer than question mark
            const circleRadius = 60 + (pulseIntensity * 20) // Pulsing radius
            const angle = Math.atan2(this.baseY - mouseY, this.baseX - mouseX)
            
            // Only move particles that should be on the circle perimeter
            const distanceFromMouse = Math.sqrt(
              Math.pow(this.baseX - mouseX, 2) + Math.pow(this.baseY - mouseY, 2)
            )
            
            // Only affect particles near where the circle should be
            if (Math.abs(distanceFromMouse - circleRadius) < 15) {
              const targetX = mouseX + Math.cos(angle) * circleRadius
              const targetY = mouseY + Math.sin(angle) * circleRadius
              
              this.x += (targetX - this.x) * formationForce
              this.y += (targetY - this.y) * formationForce
              force = 0
            }
            // Let other particles behave normally
          }
        } else if (sectionTheme === 'timeline-flow') {
          // How it works: Simple but clear arrow - only move particles that should be IN the arrow
          if (this.distance < maxDist * 1.2) {
            const flowForce = 0.7 * mouseIntensity
            
            // Create a simple arrow pointing right (→)
            const arrowSize = 80
            const relativeX = this.baseX - mouseX
            const relativeY = this.baseY - mouseY
            
            // Only affect particles that should form the arrow shape
            let shouldMoveToArrow = false
            let targetX = this.x
            let targetY = this.y
            
            // Arrow shaft (horizontal line)
            if (Math.abs(relativeX) <= arrowSize * 0.4 && Math.abs(relativeY) <= arrowSize * 0.06) {
              targetX = mouseX + (relativeX > 0 ? arrowSize * 0.4 : -arrowSize * 0.4) * Math.sign(relativeX || 1)
              targetY = mouseY
              shouldMoveToArrow = true
            }
            // Arrow head - upper diagonal
            else if (relativeX >= arrowSize * 0.3 && relativeX <= arrowSize * 0.5 &&
                     relativeY >= -arrowSize * 0.25 && relativeY <= 0) {
              targetX = mouseX + arrowSize * 0.5
              targetY = mouseY - arrowSize * 0.25
              shouldMoveToArrow = true
            }
            // Arrow head - lower diagonal  
            else if (relativeX >= arrowSize * 0.3 && relativeX <= arrowSize * 0.5 &&
                     relativeY >= 0 && relativeY <= arrowSize * 0.25) {
              targetX = mouseX + arrowSize * 0.5
              targetY = mouseY + arrowSize * 0.25
              shouldMoveToArrow = true
            }
            
            if (shouldMoveToArrow) {
              this.x += (targetX - this.x) * flowForce
              this.y += (targetY - this.y) * flowForce
              force = 0 // Don't apply normal repulsion
            }
            // Let other particles behave normally (they'll get repelled as usual)
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
          const canvasWidth = (canvas?.width || 0) / devicePixelRatio
          const isLeftSide = this.baseX < canvasWidth / 2
          
          // Ambient effect (20% intensity)
          const ambientIntensity = 0.2
          // Hover effect (additional 80% intensity)
          const hoverIntensity = mouseIntensity * 0.8
          const totalIntensity = ambientIntensity + hoverIntensity
          
          if (isLeftSide) {
            // Left side: More chaotic (fragmented platforms)
            force *= (1 + totalIntensity * 2) // More repulsion
            // Add random jitter
            this.x += (Math.random() - 0.5) * totalIntensity * 2
            this.y += (Math.random() - 0.5) * totalIntensity * 2
          } else {
            // Right side: Perfect circular orbits (organized approach)
            if (this.distance < maxDist) {
              const centerX = mouseX
              const centerY = mouseY
              const angle = Math.atan2(this.y - centerY, this.x - centerX)
              
              // Create 4 perfect, distinct orbital rings
              const particleId = Math.floor(this.baseX + this.baseY)
              const ringIndex = particleId % 4 // 4 rings for cleaner look
              
              // Perfect circular orbits with clear separation
              const ringDistances = [40, 70, 100, 130] // Well-spaced rings
              const ringSpeeds = [2.5, -2.0, 1.5, -1.0] // Alternating directions, clear speeds
              const targetDistance = ringDistances[ringIndex]
              const orbitalSpeed = ringSpeeds[ringIndex] * totalIntensity * 4
              
              // Calculate perfect circular position
              const currentDistance = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2)
              
              // Strong force to maintain exact ring distance
              const radialForce = (targetDistance - currentDistance) * 0.4
              const radialX = Math.cos(angle) * radialForce
              const radialY = Math.sin(angle) * radialForce
              
              // Smooth orbital motion
              const tangentX = -Math.sin(angle) * orbitalSpeed
              const tangentY = Math.cos(angle) * orbitalSpeed
              
              this.x += tangentX + radialX
              this.y += tangentY + radialY
              
              force = 0
            }
            
            // Gentle return to grid only when mouse is far away
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
        }

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

      draw(fadeOpacity = 1) {
        if (!ctx) return
        
        // Apply fade opacity to particle color
        const colorMatch = this.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
        if (colorMatch) {
          const [, r, g, b, a] = colorMatch
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) * fadeOpacity})`
        } else {
          ctx.fillStyle = this.color
        }
        
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
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

    // Animation loop
    const animate = () => {
      if (!isVisible) return

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
      canvas.removeEventListener("mouseleave", handleMouseLeave)
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