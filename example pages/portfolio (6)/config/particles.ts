// Particle configuration presets for use with CreativeHero component

export const defaultParticles = {
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

export const oceanParticles = {
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
}

export const forestParticles = {
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
}

export const stationParticles = {
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
}

export const sunsetParticles = {
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
}
