// lib/constants/sprites.ts
export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationConfig {
  frames: number;
  frameRate: number;
  loop: boolean;
}

export interface SpiderSprites {
  idle: {
    [key: string]: SpriteFrame[];
  };
  walk: {
    [key: string]: SpriteFrame[];
  };
  jump: {
    [key: string]: SpriteFrame[];
  };
}

export const SPIDER_SPRITES: SpiderSprites = {
  idle: {
    down: [{ x: 0, y: 0, width: 32, height: 32 }],
    left: [{ x: 0, y: 32, width: 32, height: 32 }],
    right: [{ x: 0, y: 64, width: 32, height: 32 }],
    up: [{ x: 0, y: 96, width: 32, height: 32 }],
  },
  walk: {
    down: [
      { x: 0, y: 0, width: 32, height: 32 },
      { x: 32, y: 0, width: 32, height: 32 },
      { x: 64, y: 0, width: 32, height: 32 },
    ],
    left: [
      { x: 0, y: 32, width: 32, height: 32 },
      { x: 32, y: 32, width: 32, height: 32 },
      { x: 64, y: 32, width: 32, height: 32 },
    ],
    right: [
      { x: 0, y: 64, width: 32, height: 32 },
      { x: 32, y: 64, width: 32, height: 32 },
      { x: 64, y: 64, width: 32, height: 32 },
    ],
    up: [
      { x: 0, y: 96, width: 32, height: 32 },
      { x: 32, y: 96, width: 32, height: 32 },
      { x: 64, y: 96, width: 32, height: 32 },
    ],
  },
  jump: {
    down: [{ x: 64, y: 0, width: 32, height: 32 }],
    left: [{ x: 64, y: 32, width: 32, height: 32 }],
    right: [{ x: 64, y: 64, width: 32, height: 32 }],
    up: [{ x: 64, y: 96, width: 32, height: 32 }],
  },
};

export const ANIMATION_CONFIGS: { [key: string]: AnimationConfig } = {
  idle: {
    frames: 1,
    frameRate: 0,
    loop: false,
  },
  walk: {
    frames: 3,
    frameRate: 150,
    loop: true,
  },
  jump: {
    frames: 1,
    frameRate: 0,
    loop: false,
  },
};

// Helper function to get the current sprite frame
export const getCurrentFrame = (
  action: "idle" | "walk" | "jump",
  direction: "up" | "down" | "left" | "right",
  frameIndex: number
): SpriteFrame => {
  const frames = SPIDER_SPRITES[action][direction];
  return frames[frameIndex % frames.length];
};
