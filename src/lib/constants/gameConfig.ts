// lib/constants/gameConfig.ts
import { PreyConfig, PreyType } from "../types/game";

export const GAME_CONFIG = {
  spider: {
    baseSpeed: 6,
    runSpeed: 10,
    jumpForce: 14,
    scale: 3,
    spriteSize: 32,
    animationFrames: 3,
    animationSpeed: 120,
    catchRadius: 45,
  },
  physics: {
    gravity: 0.6,
    friction: 0.85,
    airResistance: 0.96,
    maxFallSpeed: 15,
    groundHeight: 80,
    jumpVelocity: -14,
    zipSpeed: 28,
    zipDrag: 0.94,
    zipStopThreshold: 1, // Min velocity to stop zipping
    minZipDistance: 20,
  },
  web: {
    maxLength: 400,
    duration: 6000,
    thickness: 2,
    maxActive: 8,
    glowIntensity: 15,
    collisionRadius: 25, // Distance to trap prey
    nodeSpacing: 80, // Spacing between decorative web nodes
    energy: {
      max: 100,
      regenRate: 0.15,
      shootCost: 18,
      zipCost: 12,
    },
  },
  prey: {
    baseSpawnRate: 2500,
    minSpawnRate: 800,
    maxOnScreen: 15,
    fleeRadius: 180,
    trapSlowdown: 0.35,
    spawnEdgeOffset: 20, // How far off-screen prey spawns
  },
  combo: {
    duration: 3000, // ms to maintain combo
    multiplierCap: 10,
    bonusPerLevel: 50,
  },
  difficulty: {
    scaleRate: 0.0001, // Per point scored
    maxMultiplier: 3,
    preySpeedBonus: 0.3, // Per difficulty level
    spawnRateBonus: 0.2,
  },
  powerUp: {
    spawnChance: 0.08, // Chance when catching prey
    duration: 8000,
    collectRadius: 40, // Distance to collect power-up
    effects: {
      speed: 1.5,
      webEnergy: 50,
      magnet: 150,
      slowTime: 0.5,
    },
  },
  particles: {
    maxCount: 100, // Cap on total particles
    zipCount: 5,
    webShootCount: 8,
    catchCount: 15,
    powerUpCount: 20,
    trailChance: 0.3,
  },
  effects: {
    screenShakeDuration: 200,
    scorePopupDuration: 1500,
  },
} as const;

// Prey type configurations with unique behaviors
export const PREY_TYPES: Record<PreyType, PreyConfig> = {
  moth: {
    type: "moth",
    baseSpeed: 2.5,
    size: 14,
    value: 100,
    color: "#f5f5dc",
    glowColor: "rgba(245, 245, 220, 0.6)",
    behavior: "wander",
    spawnWeight: 35,
  },
  firefly: {
    type: "firefly",
    baseSpeed: 3,
    size: 10,
    value: 150,
    color: "#90EE90",
    glowColor: "rgba(144, 238, 144, 0.8)",
    behavior: "hovering",
    spawnWeight: 25,
  },
  beetle: {
    type: "beetle",
    baseSpeed: 1.8,
    size: 18,
    value: 200,
    color: "#8B4513",
    glowColor: "rgba(139, 69, 19, 0.4)",
    behavior: "wander",
    spawnWeight: 15,
  },
  dragonfly: {
    type: "dragonfly",
    baseSpeed: 5,
    size: 20,
    value: 300,
    color: "#00CED1",
    glowColor: "rgba(0, 206, 209, 0.7)",
    behavior: "fast",
    spawnWeight: 10,
  },
  butterfly: {
    type: "butterfly",
    baseSpeed: 2,
    size: 16,
    value: 250,
    color: "#FF69B4",
    glowColor: "rgba(255, 105, 180, 0.6)",
    behavior: "erratic",
    spawnWeight: 15,
  },
};

// Power-up configurations
export const POWER_UP_CONFIG = {
  speed: {
    name: "Speed Boost",
    color: "#FFD700",
    icon: "⚡",
    duration: 8000,
  },
  webEnergy: {
    name: "Web Refill",
    color: "#00BFFF",
    icon: "🕸️",
    duration: 0, // Instant
  },
  magnet: {
    name: "Prey Magnet",
    color: "#FF1493",
    icon: "🧲",
    duration: 6000,
  },
  multiShot: {
    name: "Multi Web",
    color: "#9400D3",
    icon: "✨",
    duration: 10000,
  },
  slowTime: {
    name: "Slow Motion",
    color: "#4169E1",
    icon: "⏱️",
    duration: 5000,
  },
} as const;
