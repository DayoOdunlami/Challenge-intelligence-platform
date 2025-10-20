"use client"

import { motion } from "framer-motion"
import { stationParticles } from "@/config/particles"
import { CreativeHero } from "@/components/creative-hero"

export function StationHeroAnimation() {
  return (
    <motion.div
      className="w-full h-[500px] relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <CreativeHero config={stationParticles} />
    </motion.div>
  )
}
