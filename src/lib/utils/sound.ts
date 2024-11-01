// lib/utils/sound.ts
export class SoundManager {
  private static sounds: Map<string, HTMLAudioElement> = new Map();
  private static initialized: boolean = false;

  static initialize() {
    if (this.initialized) return;

    // Add your sound effects here
    this.loadSound("jump", "/sounds/jump.mp3");
    this.loadSound("land", "/sounds/land.mp3");
    this.loadSound("walk", "/sounds/walk.mp3");
    this.loadSound("web", "/sounds/web.mp3");

    this.initialized = true;
  }

  private static loadSound(id: string, path: string) {
    const audio = new Audio(path);
    audio.preload = "auto";
    this.sounds.set(id, audio);
  }

  static play(id: string) {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log("Sound play failed:", e));
    }
  }

  static stop(id: string) {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
}

// Optional sound effects in public/sounds:
// jump.mp3 - Short jump sound
// land.mp3 - Impact sound
// walk.mp3 - Soft footstep sound
// web.mp3 - Web shooting sound
