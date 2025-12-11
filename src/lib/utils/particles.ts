// lib/utils/particles.ts
import { Particle, Vector2D } from "@/lib/types/game";

export type ParticlePreset =
  | "zip"
  | "webShoot"
  | "catch"
  | "combo"
  | "powerUp"
  | "trail";

interface ParticleConfig {
  velocitySpread: number;
  velocityBias?: Vector2D;
  baseSize: number;
  sizeVariance: number;
  lifetime: number;
  color: string;
  type: Particle["type"];
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
