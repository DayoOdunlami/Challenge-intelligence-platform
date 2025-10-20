"use client"

import { useState } from "react"
import { CreativeHero } from "@/components/creative-hero"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

// Define particle configuration presets
const particleConfigs = {
  default: {
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
  },

  ocean: {
    minSize: 1,
    maxSize: 5,
    colorRange: {
      hueStart: 180,
      hueEnd: 220,
      saturation: 70,
      lightness: 60,
    },
    gridSize: 25,
    maxDistance: 120,
    forceFactor: 0.8,
    returnSpeed: 15,
    connectionDistance: 40,
    connectionOpacity: 0.15,
    connectionWidth: 0.5,
    connectionColor: "rgba(100, 200, 255, {opacity})",
    mouseEasing: 0.08,
  },

  forest: {
    minSize: 2,
    maxSize: 6,
    colorRange: {
      hueStart: 90,
      hueEnd: 150,
      saturation: 60,
      lightness: 50,
    },
    gridSize: 35,
    maxDistance: 90,
    forceFactor: 1.2,
    returnSpeed: 8,
    connectionDistance: 35,
    connectionOpacity: 0.25,
    connectionWidth: 0.6,
    connectionColor: "rgba(100, 180, 100, {opacity})",
    mouseEasing: 0.12,
  },

  station: {
    minSize: 2,
    maxSize: 5,
    colorRange: {
      hueStart: 150,
      hueEnd: 170,
      saturation: 70,
      lightness: 40,
    },
    gridSize: 40,
    maxDistance: 100,
    forceFactor: 1,
    returnSpeed: 10,
    connectionDistance: 30,
    connectionOpacity: 0.2,
    connectionWidth: 0.5,
    connectionColor: "rgba(0, 110, 81, {opacity})",
    mouseEasing: 0.1,
  },

  sunset: {
    minSize: 2,
    maxSize: 8,
    colorRange: {
      hueStart: 0,
      hueEnd: 60,
      saturation: 80,
      lightness: 60,
    },
    gridSize: 30,
    maxDistance: 110,
    forceFactor: 1.1,
    returnSpeed: 12,
    connectionDistance: 45,
    connectionOpacity: 0.3,
    connectionWidth: 0.7,
    connectionColor: "rgba(255, 150, 100, {opacity})",
    mouseEasing: 0.09,
  },
}

export function ParticleConfigExamples() {
  const [selectedConfig, setSelectedConfig] = useState("default")
  const [copied, setCopied] = useState(false)

  const handleCopyConfig = () => {
    const configString = JSON.stringify(particleConfigs[selectedConfig as keyof typeof particleConfigs], null, 2)
    navigator.clipboard.writeText(configString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyConfig = (configName: string) => {
    setSelectedConfig(configName)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.keys(particleConfigs).map((configName) => (
          <Card
            key={configName}
            className={`cursor-pointer transition-all ${selectedConfig === configName ? "border-[#006E51] shadow-lg" : "border-gray-200"}`}
            onClick={() => handleApplyConfig(configName)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg capitalize">{configName}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="h-[400px] bg-gray-50 relative">
          <CreativeHero
            config={particleConfigs[selectedConfig as keyof typeof particleConfigs]}
            className="w-full h-full"
          />
        </div>
        <div className="bg-white p-4 border-t flex justify-between items-center">
          <div>
            <h3 className="font-medium capitalize">{selectedConfig} Configuration</h3>
            <p className="text-sm text-gray-500">Hover over the animation to see the interactive effects</p>
          </div>
          <Button
            onClick={handleCopyConfig}
            variant="outline"
            className="border-[#006E51] text-[#006E51] hover:bg-[#006E51] hover:text-white"
          >
            {copied ? "Copied!" : "Copy Config"}
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium mb-2">How to use this configuration:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {`// 1. Create a config file
// config/particles.ts
export const ${selectedConfig}Particles = ${JSON.stringify(particleConfigs[selectedConfig as keyof typeof particleConfigs], null, 2)}

// 2. Import and use in your component
import { ${selectedConfig}Particles } from "@/config/particles";
import { CreativeHero } from "@/components/creative-hero";

export function YourComponent() {
  return <CreativeHero config={${selectedConfig}Particles} />;
}`}
        </pre>
      </div>
    </div>
  )
}
