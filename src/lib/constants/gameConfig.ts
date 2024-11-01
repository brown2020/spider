// lib/constants/gameConfig.ts
export const GAME_CONFIG = {
  spider: {
    baseSpeed: 5,
    runSpeed: 8,
    jumpForce: 12,
    scale: 3,
    spriteSize: 32,
    animationFrames: 3,
    animationSpeed: 150,
  },
  physics: {
    gravity: 0.5,
    friction: 0.8,
    airResistance: 0.95,
    maxFallSpeed: 12,
    groundHeight: 80,
    jumpVelocity: -12,
  },
  web: {
    maxLength: 300,
    duration: 5000,
    thickness: 2,
    maxActive: 5,
    energy: {
      max: 100,
      regenRate: 0.1,
      shootCost: 20,
    },
  },
  prey: {
    speed: 2,
    size: 16,
    value: 100,
    spawnRate: 3000,
  },
};
