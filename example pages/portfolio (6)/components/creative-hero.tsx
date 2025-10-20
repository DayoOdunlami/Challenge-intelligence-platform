"use client"

import { useEffect, useRef } from "react"
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

interface CreativeHeroProps {
  config?: ParticleConfig
  className?: string
}

// Default configuration
export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  minSize: 2,
  maxSize: 7,
  colorRange: {
    hueStart: 270,
    hueEnd: 330,
    saturation: 70,
    lightness: 60,
  },
  gridSize: 30,
  maxDistance: 100,
  forceFactor: 1,
  returnSpeed: 10,
  connectionDistance: 30,
  connectionOpacity: 0.2,
  connectionWidth: 0.5,
  connectionColor: "rgba(180, 120, 255, {opacity})",
  mouseEasing: 0.1,
}

// Preset configurations
export const PARTICLE_PRESETS = {
  default: DEFAULT_PARTICLE_CONFIG,

  gentle: {
    ...DEFAULT_PARTICLE_CONFIG,
    minSize: 1,
    maxSize: 4,
    maxDistance: 80,
    forceFactor: 0.7,
    returnSpeed: 20,
    mouseEasing: 0.2,
  },

  intense: {
    ...DEFAULT_PARTICLE_CONFIG,
    minSize: 2,
    maxSize: 8,
    maxDistance: 150,
    forceFactor: 1.5,
    returnSpeed: 5,
    connectionDistance: 50,
    mouseEasing: 0.05,
  },

  subtle: {
    ...DEFAULT_PARTICLE_CONFIG,
    minSize: 1,
    maxSize: 3,
    colorRange: {
      hueStart: 200,
      hueEnd: 240,
      saturation: 50,
      lightness: 70,
    },
    maxDistance: 60,
    forceFactor: 0.5,
    connectionOpacity: 0.1,
    connectionWidth: 0.3,
  },

  vibrant: {
    ...DEFAULT_PARTICLE_CONFIG,
    colorRange: {
      hueStart: 0,
      hueEnd: 360,
      saturation: 80,
      lightness: 60,
    },
    maxDistance: 120,
    connectionDistance: 40,
    connectionOpacity: 0.3,
  },
}

export function CreativeHero({
  config = DEFAULT_PARTICLE_CONFIG,
  className = "w-full h-[400px] md:h-[500px] relative",
}: CreativeHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top
    })

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

        // Create a color based on the config
        // CPC brand colors for particles with transparency
        const cpcColors = [
          "rgba(0, 110, 81, 0.3)", // Sidebar Green (primary Catapult green) with transparency
          "rgba(204, 226, 220, 0.4)", // Info Box / Upload Area (mint green) with transparency
          "rgba(46, 45, 43, 0.2)", // Text (Charcoal) with transparency
          "rgba(204, 204, 204, 0.3)", // Subtle grey with transparency
          "rgba(95, 188, 162, 0.3)", // Integrated green with transparency
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
        const force = ((maxDist - this.distance) / maxDist) * config.forceFactor!

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

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    // Create particle grid
    const particlesArray: Particle[] = []
    const localGridSize = 30
    const localMaxDistance = 100

    function init() {
      particlesArray.length = 0

      const canvasWidth = canvas.width / devicePixelRatio
      const canvasHeight = canvas.height / devicePixelRatio

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

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse following
      mouseX += (targetX - mouseX) * config.mouseEasing!
      mouseY += (targetY - mouseY) * config.mouseEasing!

      // Draw connections
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()

        // Draw connections
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x
          const dy = particlesArray[i].y - particlesArray[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < config.connectionDistance!) {
            const opacity = (config.connectionOpacity! - distance / (config.connectionDistance! * 5)) * 0.3 // Reduced base opacity
            const connectionColor = `rgba(0, 110, 81, ${opacity})` // Using CPC primary green with reduced opacity

            ctx.beginPath()
            ctx.strokeStyle = connectionColor
            ctx.lineWidth = config.connectionWidth!
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y)
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    window.addEventListener("resize", init)

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.removeEventListener("resize", init)
    }
  }, [config])

  return (
    <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      {/* 
        REFERENCE: Interactive Particle Grid Animation
        Link: https://v0.dev/chat/[current-chat-id]
        
        This canvas creates a dynamic flowing particle animation with:
        - Interactive mouse-following particles that repel from cursor
        - Grid-based particle system with smooth return-to-position
        - Connected particles with distance-based opacity lines
        - Customizable color schemes and animation parameters
        - Smooth mouse interpolation for fluid movement
        - Responsive particle density based on canvas size
        
        To recreate: Copy this entire CreativeHero component and use with a config:
        <CreativeHero config={PARTICLE_PRESETS.default} className="w-full h-[500px]" />
        
        Or create your own configuration:
        <CreativeHero 
          config={{
            minSize: 2,
            maxSize: 7,
            colorRange: { hueStart: 270, hueEnd: 330, saturation: 70, lightness: 60 },
            gridSize: 30,
            maxDistance: 100,
            forceFactor: 1,
            returnSpeed: 10,
            connectionDistance: 30,
            connectionOpacity: 0.2,
            connectionWidth: 0.5,
            connectionColor: "rgba(180, 120, 255, {opacity})",
            mouseEasing: 0.1
          }}
        />
      */}
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0 -z-10" style={{ display: "block" }} />
    </motion.div>
  )
}
