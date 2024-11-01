// lib/utils/animation.ts
export type AnimationState = "idle" | "walking" | "jumping";

export interface AnimationFrame {
  duration: number;
  frame: number;
}

export class AnimationController {
  private currentFrame: number = 0;
  private frameTime: number = 0;
  private lastTimestamp: number = 0;

  constructor(private totalFrames: number, private frameDuration: number) {}

  update(timestamp: number): number {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const deltaTime = timestamp - this.lastTimestamp;
    this.frameTime += deltaTime;

    if (this.frameTime >= this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.frameTime = 0;
    }

    this.lastTimestamp = timestamp;
    return this.currentFrame;
  }

  reset() {
    this.currentFrame = 0;
    this.frameTime = 0;
    this.lastTimestamp = 0;
  }
}
