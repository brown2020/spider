// lib/types/game.ts

export interface Vector2D {
  x: number;
  y: number;
}

// Prey types with different behaviors and visuals
export type PreyType = 'moth' | 'firefly' | 'beetle' | 'dragonfly' | 'butterfly';

export interface PreyConfig {
  type: PreyType;
  baseSpeed: number;
  size: number;
  value: number;
  color: string;
  glowColor: string;
  behavior: 'wander' | 'erratic' | 'fast' | 'hovering';
  spawnWeight: number; // Higher = more common
}

// Power-up types
export type PowerUpType = 'speed' | 'webEnergy' | 'magnet' | 'multiShot' | 'slowTime';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Vector2D;
  createdAt: number;
  lifetime: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
}

export interface GameState {
  // Core state
  position: Vector2D;
  velocity: Vector2D;
  direction: 'up' | 'down' | 'left' | 'right';
  
  // Movement states
  isJumping: boolean;
  isRunning: boolean;
  isCrawling: boolean;
  isWebShooting: boolean;
  isZipping: boolean;
  
  // Game progression
  score: number;
  highScore: number;
  webEnergy: number;
  
  // Combo system
  combo: number;
  comboTimer: number;
  lastCatchTime: number;
  
  // Game flow
  gamePhase: 'menu' | 'playing' | 'paused' | 'gameOver';
  difficulty: number; // Scales from 1.0 upward
  
  // Active effects
  activePowerUps: ActivePowerUp[];
  screenShake: number;
}

export interface Web {
  id: string;
  startPos: Vector2D;
  endPos: Vector2D;
  lifetime: number;
  createdAt: number;
  strength: number; // For visual thickness
}

export interface Prey {
  id: string;
  type: PreyType;
  position: Vector2D;
  velocity: Vector2D;
  isTrapped: boolean;
  trapTime?: number;
  angle: number; // For rotation animation
  wingPhase: number; // For wing animation
}

export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  lifetime: number;
  createdAt: number;
  color: string;
  type: 'trail' | 'catch' | 'web' | 'sparkle' | 'combo';
  rotation?: number;
  scale?: number;
}

export interface ScorePopup {
  id: string;
  position: Vector2D;
  value: number;
  combo?: number;
  createdAt: number;
}

// Game configuration
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
