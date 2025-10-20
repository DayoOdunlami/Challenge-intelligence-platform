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
  sectionTheme?: 'default' | 'fragmented-vs-organized' | 'convergence' | 'pulsing' | 'timeline-flow'
}

// Default configuration using CPC colors - optimized for performance
export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  minSize: 2,
  maxSize: 5,
  colorRange: {
    hueStart: 150,
    hueEnd: 170,
    saturation: 70,
    lightness: 40,
  },
  gridSize: 50, // Balanced grid size
  maxDistance: 120,
  forceFactor: 1.2,
  returnSpeed: 15,
  connectionDistance: 40,
  connectionOpacity: 0.15,
  connectionWidth: 0.5,
  connectionColor: "rgba(0, 110, 81, {opacity})",
  mouseEasing: 0.08,
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
  const animationRef = useRef<number>()
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
      setMouseIntensity(Math.max(0, 1 - currentDistance / maxDistance))
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

        // Apply section-specific effects
        if (sectionTheme === 'fragmented-vs-organized') {
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
            // Right side: Continuous orbiting (connected approach)
            // Override normal repulsion behavior completely
            if (this.distance < maxDist) {
              // Instead of scattering, create orbital motion
              const centerX = mouseX
              const centerY = mouseY
              const angle = Math.atan2(this.y - centerY, this.x - centerX)
              const distanceFromMouse = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2)
              
              // Enhanced multi-ring orbital system
              const baseOrbitalSpeed = totalIntensity * 5 // Even faster
              
              // Assign each particle to a specific ring based on its ID/position
              const particleId = Math.floor(this.baseX + this.baseY) // Unique ID per particle
              const ringIndex = particleId % 3 // 3 rings: 0, 1, 2
              
              // Much more distinct ring distances and speeds
              const ringDistances = [50, 90, 130] // Closer, more distinct rings
              const ringSpeeds = [1.0, 1.5, 2.0] // Different speeds per ring
              const ringDirections = [1, -1, 1] // Alternate directions
              
              const ringSpeed = baseOrbitalSpeed * ringSpeeds[ringIndex]
              const ringDirection = ringDirections[ringIndex]
              
              // Strong orbital motion
              const tangentX = -Math.sin(angle) * ringSpeed * ringDirection
              const tangentY = Math.cos(angle) * ringSpeed * ringDirection
              
              // Force particles into their assigned ring
              const targetDistance = ringDistances[ringIndex] + totalIntensity * 15
              const distanceError = distanceFromMouse - targetDistance
              
              // Very strong radial force to maintain distinct rings
              const radialForce = distanceError * totalIntensity * 1.5 // Much stronger
              const radialX = Math.cos(angle) * radialForce
              const radialY = Math.sin(angle) * radialForce
              
              // Less variation so rings stay distinct
              const variation = Math.sin(Date.now() * 0.002 + particleId) * totalIntensity * 0.2
              
              this.x += tangentX - radialX + variation
              this.y += tangentY - radialY + variation
              
              // Prevent normal repulsion
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