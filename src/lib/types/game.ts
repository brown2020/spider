// lib/types/game.ts
export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsConfig {
  gravity: number;
  friction: number;
  airResistance: number;
  maxFallSpeed: number;
  groundHeight: number;
  jumpVelocity: number;
}

export interface SpiderConfig {
  baseSpeed: number;
  runSpeed: number;
  jumpForce: number;
  scale: number;
  spriteSize: number;
  animationFrames: number;
  animationSpeed: number;
}

export interface WebConfig {
  maxLength: number;
  duration: number;
  thickness: number;
  maxActive: number;
  energy: {
    max: number;
    regenRate: number;
    shootCost: number;
  };
}

export interface PreyConfig {
  speed: number;
  size: number;
  value: number;
  spawnRate: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorldConfig {
  width: number;
  height: number;
  platforms: Platform[];
}

export interface GameState {
  position: Vector2D;
  velocity: Vector2D;
  direction: "up" | "down" | "left" | "right";
  isJumping: boolean;
  isRunning: boolean;
  isCrawling: boolean;
  isWebShooting: boolean;
  isZipping: boolean;
  score: number;
  webEnergy: number;
}

export interface Web {
  id: string;
  startPos: Vector2D;
  endPos: Vector2D;
  lifetime: number;
  createdAt: number;
}

export interface Prey {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  isTrapped: boolean;
}
