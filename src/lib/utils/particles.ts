// lib/utils/particles.ts
import { Particle, Vector2D } from "@/lib/types/game";

export type ParticlePreset =
  | "zip"
  | "webShoot"
  | "catch"
  | "combo"
  | "powerUp"
  | "trail"
  | "confetti"
  | "anticipation"
  | "landing";

interface ParticleConfig {
  velocitySpread: number;
  velocityBias?: Vector2D;
  baseSize: number;
  sizeVariance: number;
  lifetime: number;
  color: string;
  type: Particle["type"];
  gravity?: number;
  rotationSpeed?: number;
}

const PARTICLE_PRESETS: Record<ParticlePreset, ParticleConfig> = {
  zip: {
    velocitySpread: 3,
    baseSize: 4,
    sizeVariance: 2,
    lifetime: 400,
    color: "rgba(100, 200, 255, 0.9)",
    type: "web",
  },
  webShoot: {
    velocitySpread: 2,
    baseSize: 2,
    sizeVariance: 2,
    lifetime: 300,
    color: "rgba(255, 255, 255, 0.8)",
    type: "web",
  },
  catch: {
    velocitySpread: 8,
    baseSize: 4,
    sizeVariance: 4,
    lifetime: 600,
    color: "rgba(255, 255, 255, 0.8)",
    type: "catch",
  },
  combo: {
    velocitySpread: 10,
    velocityBias: { x: 0, y: -7.5 },
    baseSize: 4,
    sizeVariance: 2,
    lifetime: 800,
    color: "hsl(60, 100%, 60%)",
    type: "combo",
  },
  powerUp: {
    velocitySpread: 12,
    baseSize: 6,
    sizeVariance: 4,
    lifetime: 800,
    color: "rgba(255, 215, 0, 0.9)",
    type: "sparkle",
  },
  trail: {
    velocitySpread: 2,
    baseSize: 2,
    sizeVariance: 2,
    lifetime: 500,
    color: "rgba(255, 255, 255, 0.5)",
    type: "trail",
  },
  confetti: {
    velocitySpread: 15,
    velocityBias: { x: 0, y: -8 },
    baseSize: 8,
    sizeVariance: 4,
    lifetime: 1200,
    color: "hsl(0, 100%, 60%)",
    type: "confetti",
    gravity: 0.15,
    rotationSpeed: 10,
  },
  anticipation: {
    velocitySpread: 1,
    baseSize: 3,
    sizeVariance: 2,
    lifetime: 400,
    color: "rgba(255, 255, 100, 0.8)",
    type: "anticipation",
  },
  landing: {
    velocitySpread: 6,
    velocityBias: { x: 0, y: -2 },
    baseSize: 4,
    sizeVariance: 3,
    lifetime: 400,
    color: "rgba(150, 130, 100, 0.7)",
    type: "trail",
  },
};

export function createParticles(
  preset: ParticlePreset,
  position: Vector2D,
  count: number,
  overrides?: {
    color?: string;
    velocityBias?: Vector2D;
    lifetime?: number;
    velocitySpread?: number;
  }
): Omit<Particle, "id" | "createdAt">[] {
  const config = PARTICLE_PRESETS[preset];
  const spread = overrides?.velocitySpread ?? config.velocitySpread;
  const bias = overrides?.velocityBias ?? config.velocityBias ?? { x: 0, y: 0 };

  return Array.from({ length: count }, () => ({
    position: { ...position },
    velocity: {
      x: (Math.random() - 0.5) * spread + bias.x,
      y: (Math.random() - 0.5) * spread + bias.y,
    },
    size: config.baseSize + Math.random() * config.sizeVariance,
    lifetime: overrides?.lifetime ?? config.lifetime,
    color: overrides?.color ?? config.color,
    type: config.type,
  }));
}

// Specialized factory for web shooting with direction bias
export function createWebShootParticles(
  position: Vector2D,
  target: Vector2D,
  count: number = 8
): Omit<Particle, "id" | "createdAt">[] {
  const dx = target.x - position.x;
  const dy = target.y - position.y;

  return Array.from({ length: count }, () => ({
    position: { ...position },
    velocity: {
      x: dx * 0.02 + (Math.random() - 0.5) * 2,
      y: dy * 0.02 + (Math.random() - 0.5) * 2,
    },
    size: Math.random() * 3 + 1,
    lifetime: 300,
    color: "rgba(255, 255, 255, 0.8)",
    type: "web" as const,
  }));
}

// Factory for trail particles with zipping state awareness
export function createTrailParticle(
  position: Vector2D,
  isZipping: boolean
): Omit<Particle, "id" | "createdAt"> {
  const spread = isZipping ? 4 : 2;
  const size = isZipping ? 5 : 3;

  return {
    position: { ...position },
    velocity: {
      x: (Math.random() - 0.5) * spread,
      y: (Math.random() - 0.5) * spread,
    },
    size: Math.random() * size + 1,
    lifetime: isZipping ? 300 : 500,
    color: isZipping ? "rgba(100, 200, 255, 0.8)" : "rgba(255, 255, 255, 0.5)",
    type: "trail",
  };
}

// Confetti burst for big combos and milestones
const CONFETTI_COLORS = [
  "hsl(0, 100%, 60%)",    // Red
  "hsl(45, 100%, 55%)",   // Gold
  "hsl(120, 70%, 50%)",   // Green
  "hsl(200, 100%, 55%)",  // Blue
  "hsl(280, 80%, 60%)",   // Purple
  "hsl(320, 90%, 60%)",   // Pink
];

export function createConfettiParticles(
  position: Vector2D,
  count: number,
  intensity: number = 1
): Omit<Particle, "id" | "createdAt">[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (5 + Math.random() * 10) * intensity;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    return {
      position: { ...position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 8 * intensity,
      },
      size: 6 + Math.random() * 6,
      lifetime: 1200 + Math.random() * 400,
      color,
      type: "confetti" as const,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.12 + Math.random() * 0.08,
    };
  });
}

// Ring burst effect particles (expanding circles)
export function createRingBurstParticles(
  position: Vector2D,
  color: string,
  count: number = 3
): Omit<Particle, "id" | "createdAt">[] {
  return Array.from({ length: count }, (_, i) => ({
    position: { ...position },
    velocity: { x: 0, y: 0 },
    size: 20 + i * 15,
    lifetime: 400 + i * 100,
    color,
    type: "ring" as const,
    scale: 0.5,
  }));
}

// Anticipation glow particles around prey when spider is near
export function createAnticipationParticles(
  position: Vector2D,
  count: number = 6
): Omit<Particle, "id" | "createdAt">[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 15;

    return {
      position: {
        x: position.x + Math.cos(angle) * radius,
        y: position.y + Math.sin(angle) * radius,
      },
      velocity: {
        x: Math.cos(angle) * 0.5,
        y: Math.sin(angle) * 0.5,
      },
      size: 3 + Math.random() * 2,
      lifetime: 300,
      color: "rgba(255, 255, 150, 0.9)",
      type: "anticipation" as const,
    };
  });
}

// Landing dust particles
export function createLandingParticles(
  position: Vector2D,
  velocity: Vector2D,
  count: number = 8
): Omit<Particle, "id" | "createdAt">[] {
  const impactForce = Math.abs(velocity.y) * 0.5;

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI; // Only upward arc
    const speed = (2 + Math.random() * 3) * Math.min(impactForce, 3);

    return {
      position: { x: position.x + (Math.random() - 0.5) * 20, y: position.y },
      velocity: {
        x: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        y: -Math.sin(angle) * speed,
      },
      size: 3 + Math.random() * 4,
      lifetime: 300 + Math.random() * 200,
      color: `rgba(${120 + Math.random() * 40}, ${100 + Math.random() * 30}, ${80 + Math.random() * 20}, 0.6)`,
      type: "trail" as const,
      gravity: 0.2,
    };
  });
}







