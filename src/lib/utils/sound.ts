// Sound effects utility with Web Audio API
// Creates procedural sounds without requiring audio files

type SoundType = 
  | 'jump'
  | 'webShoot'
  | 'webHit'
  | 'catch'
  | 'combo'
  | 'powerUp'
  | 'zip'
  | 'menuClick'
  | 'gameOver';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  attack: number;
  decay: number;
  volume: number;
  pitchBend?: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  jump: {
    frequency: 200,
    duration: 0.15,
    type: 'sine',
    attack: 0.01,
    decay: 0.14,
    volume: 0.3,
    pitchBend: 400,
  },
  webShoot: {
    frequency: 800,
    duration: 0.1,
    type: 'sawtooth',
    attack: 0.01,
    decay: 0.09,
    volume: 0.15,
    pitchBend: -300,
  },
  webHit: {
    frequency: 300,
    duration: 0.08,
    type: 'triangle',
    attack: 0.01,
    decay: 0.07,
    volume: 0.2,
  },
  catch: {
    frequency: 523,
    duration: 0.2,
    type: 'sine',
    attack: 0.01,
    decay: 0.19,
    volume: 0.4,
    pitchBend: 200,
  },
  combo: {
    frequency: 659,
    duration: 0.25,
    type: 'sine',
    attack: 0.01,
    decay: 0.24,
    volume: 0.5,
    pitchBend: 300,
  },
  powerUp: {
    frequency: 440,
    duration: 0.4,
    type: 'sine',
    attack: 0.01,
    decay: 0.39,
    volume: 0.35,
    pitchBend: 440,
  },
  zip: {
    frequency: 150,
    duration: 0.3,
    type: 'sawtooth',
    attack: 0.02,
    decay: 0.28,
    volume: 0.25,
    pitchBend: 600,
  },
  menuClick: {
    frequency: 600,
    duration: 0.05,
    type: 'sine',
    attack: 0.005,
    decay: 0.045,
    volume: 0.2,
  },
  gameOver: {
    frequency: 220,
    duration: 0.5,
    type: 'sine',
    attack: 0.01,
    decay: 0.49,
    volume: 0.4,
    pitchBend: -100,
  },
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private initialized: boolean = false;

  constructor() {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('spiderSoundEnabled');
      const savedVolume = localStorage.getItem('spiderSoundVolume');
      
      this.enabled = savedEnabled !== 'false';
      this.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
    }
  }

  private init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private createOscillator(config: SoundConfig): void {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);

    // Pitch bend
    if (config.pitchBend) {
      oscillator.frequency.linearRampToValueAtTime(
        config.frequency + config.pitchBend,
        this.audioContext.currentTime + config.duration
      );
    }

    // Envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(
      config.volume * this.volume,
      now + config.attack
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      now + config.attack + config.decay
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + config.duration);
  }

  play(sound: SoundType) {
    if (!this.enabled) return;
    
    this.init();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    const config = SOUND_CONFIGS[sound];
    if (config) {
      this.createOscillator(config);
      
      // Add harmonics for richer sounds
      if (sound === 'catch' || sound === 'combo' || sound === 'powerUp') {
        setTimeout(() => {
          this.createOscillator({
            ...config,
            frequency: config.frequency * 1.5,
            volume: config.volume * 0.5,
          });
        }, 20);
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('spiderSoundEnabled', String(enabled));
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('spiderSoundVolume', String(this.volume));
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Convenience function
export function playSound(sound: SoundType) {
  soundManager.play(sound);
}
