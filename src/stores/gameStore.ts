// stores/gameStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  GameState,
  Web,
  Prey,
  Particle,
  ScorePopup,
  PowerUp,
  Vector2D,
  PreyType,
  PowerUpType,
} from '@/lib/types/game';
import { GAME_CONFIG, PREY_TYPES } from '@/lib/constants/gameConfig';

// Utility function for unique IDs
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Get random prey type based on spawn weights
const getRandomPreyType = (): PreyType => {
  const types = Object.values(PREY_TYPES);
  const totalWeight = types.reduce((sum, t) => sum + t.spawnWeight, 0);
  let random = Math.random() * totalWeight;
  
  for (const type of types) {
    random -= type.spawnWeight;
    if (random <= 0) return type.type;
  }
  return 'moth';
};

interface GameStore {
  // Core game state
  gameState: GameState;
  webs: Web[];
  preyList: Prey[];
  particles: Particle[];
  scorePopups: ScorePopup[];
  powerUps: PowerUp[];
  mousePosition: Vector2D;
  
  // Window dimensions (for responsive design)
  dimensions: { width: number; height: number };
  
  // Actions - Game Flow
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Actions - Movement
  updatePosition: (delta: Partial<Vector2D>) => void;
  setVelocity: (velocity: Partial<Vector2D>) => void;
  setDirection: (direction: GameState['direction']) => void;
  setCrawling: (isCrawling: boolean) => void;
  jump: () => void;
  zipTo: (target: Vector2D) => void;
  
  // Actions - Web
  shootWeb: (target: Vector2D) => void;
  updateWebs: () => void;
  
  // Actions - Prey
  spawnPrey: () => void;
  updatePrey: () => void;
  catchPrey: (preyId: string) => void;
  
  // Actions - Particles & Effects
  addParticles: (particles: Omit<Particle, 'id' | 'createdAt'>[]) => void;
  updateParticles: () => void;
  addScorePopup: (position: Vector2D, value: number, combo?: number) => void;
  updateScorePopups: () => void;
  triggerScreenShake: (intensity: number) => void;
  
  // Actions - Power-ups
  spawnPowerUp: (position: Vector2D) => void;
  collectPowerUp: (powerUpId: string) => void;
  updatePowerUps: () => void;
  
  // Actions - Combo
  updateCombo: () => void;
  
  // Actions - State Updates
  setMousePosition: (position: Vector2D) => void;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  tick: () => void; // Main game loop tick
}

const getInitialGameState = (): GameState => ({
  position: { x: 500, y: 300 },
  velocity: { x: 0, y: 0 },
  direction: 'right',
  isJumping: false,
  isRunning: false,
  isCrawling: false,
  isWebShooting: false,
  isZipping: false,
  score: 0,
  highScore: typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('spiderHighScore') || '0', 10) 
    : 0,
  webEnergy: GAME_CONFIG.web.energy.max,
  combo: 0,
  comboTimer: 0,
  lastCatchTime: 0,
  gamePhase: 'menu',
  difficulty: 1,
  activePowerUps: [],
  screenShake: 0,
});

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    gameState: getInitialGameState(),
    webs: [],
    preyList: [],
    particles: [],
    scorePopups: [],
    powerUps: [],
    mousePosition: { x: 0, y: 0 },
    dimensions: { width: 1000, height: 600 },
    
    // Game Flow Actions
    startGame: () => {
      const { dimensions } = get();
      set({
        gameState: {
          ...getInitialGameState(),
          position: { x: dimensions.width / 2, y: dimensions.height / 2 },
          gamePhase: 'playing',
          highScore: get().gameState.highScore,
        },
        webs: [],
        preyList: [],
        particles: [],
        scorePopups: [],
        powerUps: [],
      });
    },
    
    pauseGame: () => {
      set((state) => ({
        gameState: { ...state.gameState, gamePhase: 'paused' },
      }));
    },
    
    resumeGame: () => {
      set((state) => ({
        gameState: { ...state.gameState, gamePhase: 'playing' },
      }));
    },
    
    endGame: () => {
      const { gameState } = get();
      const newHighScore = Math.max(gameState.score, gameState.highScore);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('spiderHighScore', newHighScore.toString());
      }
      
      set((state) => ({
        gameState: {
          ...state.gameState,
          gamePhase: 'gameOver',
          highScore: newHighScore,
        },
      }));
    },
    
    resetGame: () => {
      set({
        gameState: {
          ...getInitialGameState(),
          highScore: get().gameState.highScore,
        },
        webs: [],
        preyList: [],
        particles: [],
        scorePopups: [],
        powerUps: [],
      });
    },
    
    // Movement Actions
    updatePosition: (delta) => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          position: {
            x: state.gameState.position.x + (delta.x || 0),
            y: state.gameState.position.y + (delta.y || 0),
          },
        },
      }));
    },
    
    setVelocity: (velocity) => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          velocity: {
            ...state.gameState.velocity,
            ...velocity,
          },
        },
      }));
    },
    
    setDirection: (direction) => {
      set((state) => ({
        gameState: { ...state.gameState, direction },
      }));
    },
    
    setCrawling: (isCrawling) => {
      set((state) => ({
        gameState: { ...state.gameState, isCrawling },
      }));
    },
    
    jump: () => {
      const { gameState } = get();
      if (gameState.isJumping) return;
      
      set((state) => ({
        gameState: {
          ...state.gameState,
          velocity: {
            ...state.gameState.velocity,
            y: -GAME_CONFIG.spider.jumpForce,
          },
          isJumping: true,
        },
      }));
    },
    
    zipTo: (target) => {
      const { gameState } = get();
      if (gameState.webEnergy < GAME_CONFIG.web.energy.zipCost) return;
      
      const dx = target.x - gameState.position.x;
      const dy = target.y - gameState.position.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < 20) return;
      
      const speed = GAME_CONFIG.physics.zipSpeed;
      const velocity = {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed,
      };
      
      // Add zip trail particles
      get().addParticles(
        Array.from({ length: 5 }, () => ({
          position: { ...gameState.position },
          velocity: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
          size: Math.random() * 4 + 2,
          lifetime: 400,
          color: 'rgba(100, 200, 255, 0.9)',
          type: 'web' as const,
        }))
      );
      
      set((state) => ({
        gameState: {
          ...state.gameState,
          velocity,
          isZipping: true,
          isJumping: true,
          webEnergy: state.gameState.webEnergy - GAME_CONFIG.web.energy.zipCost,
        },
      }));
    },
    
    // Web Actions
    shootWeb: (target) => {
      const { gameState } = get();
      if (gameState.webEnergy < GAME_CONFIG.web.energy.shootCost) return;
      
      const newWeb: Web = {
        id: generateId(),
        startPos: { ...gameState.position },
        endPos: { ...target },
        lifetime: GAME_CONFIG.web.duration,
        createdAt: Date.now(),
        strength: 1,
      };
      
      // Add web shooting particles
      get().addParticles(
        Array.from({ length: 8 }, () => ({
          position: { ...gameState.position },
          velocity: {
            x: (target.x - gameState.position.x) * 0.02 + (Math.random() - 0.5) * 2,
            y: (target.y - gameState.position.y) * 0.02 + (Math.random() - 0.5) * 2,
          },
          size: Math.random() * 3 + 1,
          lifetime: 300,
          color: 'rgba(255, 255, 255, 0.8)',
          type: 'web' as const,
        }))
      );
      
      set((state) => ({
        webs: [...state.webs, newWeb].slice(-GAME_CONFIG.web.maxActive),
        gameState: {
          ...state.gameState,
          isWebShooting: true,
          webEnergy: state.gameState.webEnergy - GAME_CONFIG.web.energy.shootCost,
        },
      }));
    },
    
    updateWebs: () => {
      const now = Date.now();
      set((state) => ({
        webs: state.webs.filter((web) => now - web.createdAt < web.lifetime),
      }));
    },
    
    // Prey Actions
    spawnPrey: () => {
      const { preyList, dimensions, gameState } = get();
      if (preyList.length >= GAME_CONFIG.prey.maxOnScreen) return;
      
      const type = getRandomPreyType();
      const config = PREY_TYPES[type];
      const speedMultiplier = 1 + (gameState.difficulty - 1) * GAME_CONFIG.difficulty.preySpeedBonus;
      
      // Spawn from edges
      const edge = Math.floor(Math.random() * 4);
      let position: Vector2D;
      
      switch (edge) {
        case 0: // Top
          position = { x: Math.random() * dimensions.width, y: -20 };
          break;
        case 1: // Right
          position = { x: dimensions.width + 20, y: Math.random() * dimensions.height };
          break;
        case 2: // Bottom
          position = { x: Math.random() * dimensions.width, y: dimensions.height + 20 };
          break;
        default: // Left
          position = { x: -20, y: Math.random() * dimensions.height };
          break;
      }
      
      const speed = config.baseSpeed * speedMultiplier;
      const angle = Math.random() * Math.PI * 2;
      
      const newPrey: Prey = {
        id: generateId(),
        type,
        position,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        isTrapped: false,
        angle: 0,
        wingPhase: Math.random() * Math.PI * 2,
      };
      
      set((state) => ({
        preyList: [...state.preyList, newPrey],
      }));
    },
    
    updatePrey: () => {
      const { gameState, webs, dimensions } = get();
      
      set((state) => ({
        preyList: state.preyList.map((prey) => {
          const config = PREY_TYPES[prey.type];
          let newVelocity = { ...prey.velocity };
          let newPosition = { ...prey.position };
          
          // Check if still trapped
          if (prey.isTrapped) {
            const stillTrapped = checkWebCollision(prey, webs);
            if (!stillTrapped) {
              return {
                ...prey,
                isTrapped: false,
                velocity: {
                  x: (Math.random() - 0.5) * config.baseSpeed * 2,
                  y: (Math.random() - 0.5) * config.baseSpeed * 2,
                },
              };
            }
            
            // Struggle animation
            newVelocity = {
              x: prey.velocity.x * 0.95 + (Math.random() - 0.5) * 0.2,
              y: prey.velocity.y * 0.95 + (Math.random() - 0.5) * 0.2,
            };
            newPosition = {
              x: prey.position.x + newVelocity.x * 0.3,
              y: prey.position.y + newVelocity.y * 0.3,
            };
          } else {
            // Apply behavior
            const distanceToSpider = Math.hypot(
              prey.position.x - gameState.position.x,
              prey.position.y - gameState.position.y
            );
            
            // Flee from spider
            if (distanceToSpider < GAME_CONFIG.prey.fleeRadius) {
              const fleeAngle = Math.atan2(
                prey.position.y - gameState.position.y,
                prey.position.x - gameState.position.x
              );
              const fleeSpeed = config.baseSpeed * 1.8;
              newVelocity = {
                x: Math.cos(fleeAngle) * fleeSpeed,
                y: Math.sin(fleeAngle) * fleeSpeed,
              };
            } else {
              // Type-specific behaviors
              switch (config.behavior) {
                case 'erratic':
                  if (Math.random() < 0.1) {
                    const angle = Math.random() * Math.PI * 2;
                    newVelocity = {
                      x: Math.cos(angle) * config.baseSpeed,
                      y: Math.sin(angle) * config.baseSpeed,
                    };
                  }
                  break;
                case 'hovering':
                  newVelocity.y += Math.sin(Date.now() * 0.005 + prey.wingPhase) * 0.3;
                  break;
                case 'fast':
                  // Maintain speed
                  const currentSpeed = Math.hypot(newVelocity.x, newVelocity.y);
                  if (currentSpeed < config.baseSpeed) {
                    const angle = Math.atan2(newVelocity.y, newVelocity.x);
                    newVelocity = {
                      x: Math.cos(angle) * config.baseSpeed,
                      y: Math.sin(angle) * config.baseSpeed,
                    };
                  }
                  break;
              }
            }
            
            newPosition = {
              x: prey.position.x + newVelocity.x,
              y: prey.position.y + newVelocity.y,
            };
            
            // Bounce off walls
            if (newPosition.x < 0 || newPosition.x > dimensions.width) {
              newVelocity.x *= -1;
              newPosition.x = Math.max(0, Math.min(dimensions.width, newPosition.x));
            }
            if (newPosition.y < 0 || newPosition.y > dimensions.height - GAME_CONFIG.physics.groundHeight) {
              newVelocity.y *= -1;
              newPosition.y = Math.max(0, Math.min(dimensions.height - GAME_CONFIG.physics.groundHeight, newPosition.y));
            }
            
            // Check web collision
            if (checkWebCollision({ ...prey, position: newPosition }, webs)) {
              return {
                ...prey,
                position: newPosition,
                velocity: {
                  x: newVelocity.x * GAME_CONFIG.prey.trapSlowdown,
                  y: newVelocity.y * GAME_CONFIG.prey.trapSlowdown,
                },
                isTrapped: true,
                trapTime: Date.now(),
              };
            }
          }
          
          return {
            ...prey,
            position: newPosition,
            velocity: newVelocity,
            angle: prey.angle + 0.1,
            wingPhase: prey.wingPhase + 0.2,
          };
        }),
      }));
    },
    
    catchPrey: (preyId) => {
      const { preyList, gameState } = get();
      const prey = preyList.find((p) => p.id === preyId);
      if (!prey) return;
      
      const config = PREY_TYPES[prey.type];
      const now = Date.now();
      
      // Calculate combo
      const timeSinceLastCatch = now - gameState.lastCatchTime;
      const newCombo = timeSinceLastCatch < GAME_CONFIG.combo.duration
        ? Math.min(gameState.combo + 1, GAME_CONFIG.combo.multiplierCap)
        : 1;
      
      // Calculate score with combo
      const comboMultiplier = 1 + (newCombo - 1) * 0.25;
      const points = Math.floor(config.value * comboMultiplier);
      
      // Add catch particles
      get().addParticles(
        Array.from({ length: 15 }, () => ({
          position: { ...prey.position },
          velocity: {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8,
          },
          size: Math.random() * 6 + 2,
          lifetime: 600,
          color: config.glowColor,
          type: 'catch' as const,
        }))
      );
      
      // Add combo particles if combo > 1
      if (newCombo > 1) {
        get().addParticles(
          Array.from({ length: newCombo * 3 }, () => ({
            position: { ...prey.position },
            velocity: {
              x: (Math.random() - 0.5) * 10,
              y: -Math.random() * 10 - 5,
            },
            size: Math.random() * 4 + 2,
            lifetime: 800,
            color: `hsl(${50 + newCombo * 10}, 100%, 60%)`,
            type: 'combo' as const,
          }))
        );
      }
      
      // Score popup
      get().addScorePopup(prey.position, points, newCombo > 1 ? newCombo : undefined);
      
      // Screen shake
      get().triggerScreenShake(newCombo > 3 ? 8 : 4);
      
      // Maybe spawn power-up
      if (Math.random() < GAME_CONFIG.powerUp.spawnChance * (1 + newCombo * 0.1)) {
        get().spawnPowerUp(prey.position);
      }
      
      // Update difficulty
      const newScore = gameState.score + points;
      const newDifficulty = Math.min(
        1 + newScore * GAME_CONFIG.difficulty.scaleRate,
        GAME_CONFIG.difficulty.maxMultiplier
      );
      
      set((state) => ({
        preyList: state.preyList.filter((p) => p.id !== preyId),
        gameState: {
          ...state.gameState,
          score: newScore,
          combo: newCombo,
          comboTimer: GAME_CONFIG.combo.duration,
          lastCatchTime: now,
          difficulty: newDifficulty,
        },
      }));
    },
    
    // Particle Actions
    addParticles: (particles) => {
      const now = Date.now();
      const newParticles = particles.map((p) => ({
        ...p,
        id: generateId(),
        createdAt: now,
      }));
      
      set((state) => ({
        particles: [...state.particles, ...newParticles].slice(-100), // Cap particles
      }));
    },
    
    updateParticles: () => {
      const now = Date.now();
      set((state) => ({
        particles: state.particles
          .filter((p) => now - p.createdAt < p.lifetime)
          .map((p) => ({
            ...p,
            position: {
              x: p.position.x + p.velocity.x,
              y: p.position.y + p.velocity.y,
            },
            velocity: {
              x: p.velocity.x * 0.95,
              y: p.velocity.y * 0.95 + (p.type === 'catch' ? 0.1 : 0),
            },
          })),
      }));
    },
    
    addScorePopup: (position, value, combo) => {
      const popup: ScorePopup = {
        id: generateId(),
        position: { ...position },
        value,
        combo,
        createdAt: Date.now(),
      };
      
      set((state) => ({
        scorePopups: [...state.scorePopups, popup],
      }));
    },
    
    updateScorePopups: () => {
      const now = Date.now();
      set((state) => ({
        scorePopups: state.scorePopups.filter((p) => now - p.createdAt < 1500),
      }));
    },
    
    triggerScreenShake: (intensity) => {
      set((state) => ({
        gameState: { ...state.gameState, screenShake: intensity },
      }));
      
      // Reset after animation
      setTimeout(() => {
        set((state) => ({
          gameState: { ...state.gameState, screenShake: 0 },
        }));
      }, 200);
    },
    
    // Power-up Actions
    spawnPowerUp: (position) => {
      const types: PowerUpType[] = ['speed', 'webEnergy', 'magnet', 'slowTime'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const powerUp: PowerUp = {
        id: generateId(),
        type,
        position: { ...position },
        createdAt: Date.now(),
        lifetime: 10000,
      };
      
      set((state) => ({
        powerUps: [...state.powerUps, powerUp],
      }));
    },
    
    collectPowerUp: (powerUpId) => {
      const { powerUps, gameState } = get();
      const powerUp = powerUps.find((p) => p.id === powerUpId);
      if (!powerUp) return;
      
      const now = Date.now();
      
      // Apply power-up effect
      switch (powerUp.type) {
        case 'webEnergy':
          set((state) => ({
            gameState: {
              ...state.gameState,
              webEnergy: Math.min(
                state.gameState.webEnergy + GAME_CONFIG.powerUp.effects.webEnergy,
                GAME_CONFIG.web.energy.max
              ),
            },
            powerUps: state.powerUps.filter((p) => p.id !== powerUpId),
          }));
          break;
        default:
          set((state) => ({
            gameState: {
              ...state.gameState,
              activePowerUps: [
                ...state.gameState.activePowerUps.filter((p) => p.type !== powerUp.type),
                {
                  type: powerUp.type,
                  expiresAt: now + GAME_CONFIG.powerUp.duration,
                },
              ],
            },
            powerUps: state.powerUps.filter((p) => p.id !== powerUpId),
          }));
      }
      
      // Visual feedback
      get().addParticles(
        Array.from({ length: 20 }, () => ({
          position: { ...powerUp.position },
          velocity: {
            x: (Math.random() - 0.5) * 12,
            y: (Math.random() - 0.5) * 12,
          },
          size: Math.random() * 8 + 4,
          lifetime: 800,
          color: 'rgba(255, 215, 0, 0.9)',
          type: 'sparkle' as const,
        }))
      );
    },
    
    updatePowerUps: () => {
      const now = Date.now();
      
      set((state) => ({
        powerUps: state.powerUps.filter((p) => now - p.createdAt < p.lifetime),
        gameState: {
          ...state.gameState,
          activePowerUps: state.gameState.activePowerUps.filter(
            (p) => p.expiresAt > now
          ),
        },
      }));
    },
    
    // Combo
    updateCombo: () => {
      const { gameState } = get();
      const now = Date.now();
      
      if (gameState.combo > 0 && now - gameState.lastCatchTime > GAME_CONFIG.combo.duration) {
        set((state) => ({
          gameState: {
            ...state.gameState,
            combo: 0,
            comboTimer: 0,
          },
        }));
      }
    },
    
    // State Updates
    setMousePosition: (position) => {
      set({ mousePosition: position });
    },
    
    setDimensions: (dimensions) => {
      set({ dimensions });
    },
    
    // Main game tick
    tick: () => {
      const { gameState, dimensions, preyList } = get();
      if (gameState.gamePhase !== 'playing') return;
      
      // Check speed power-up
      const hasSpeedBoost = gameState.activePowerUps.some((p) => p.type === 'speed');
      const speedMultiplier = hasSpeedBoost ? GAME_CONFIG.powerUp.effects.speed : 1;
      
      // Update position based on velocity
      let newX = gameState.position.x + gameState.velocity.x * speedMultiplier;
      let newY = gameState.position.y + gameState.velocity.y;
      
      let newVelocity = { ...gameState.velocity };
      let isJumping = gameState.isJumping;
      let isZipping = gameState.isZipping;
      
      // Apply physics
      if (isZipping) {
        newVelocity.x *= GAME_CONFIG.physics.zipDrag;
        newVelocity.y *= GAME_CONFIG.physics.zipDrag;
        
        if (Math.abs(newVelocity.x) < 1 && Math.abs(newVelocity.y) < 1) {
          isZipping = false;
        }
      } else if (isJumping || newY < dimensions.height - GAME_CONFIG.physics.groundHeight) {
        newVelocity.y = Math.min(
          newVelocity.y + GAME_CONFIG.physics.gravity,
          GAME_CONFIG.physics.maxFallSpeed
        );
      }
      
      // Bounds checking
      const spiderRadius = (GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale) / 2;
      let hitWall = false;
      
      if (newX < spiderRadius) {
        newX = spiderRadius;
        hitWall = true;
      } else if (newX > dimensions.width - spiderRadius) {
        newX = dimensions.width - spiderRadius;
        hitWall = true;
      }
      
      if (newY < spiderRadius) {
        newY = spiderRadius;
        hitWall = true;
      } else if (newY > dimensions.height - GAME_CONFIG.physics.groundHeight) {
        newY = dimensions.height - GAME_CONFIG.physics.groundHeight;
        newVelocity.y = 0;
        isJumping = false;
        isZipping = false;
      }
      
      if (hitWall && isZipping) {
        isZipping = false;
        newVelocity = { x: 0, y: 0 };
      }
      
      // Regenerate web energy
      let webEnergy = gameState.webEnergy;
      if (webEnergy < GAME_CONFIG.web.energy.max) {
        webEnergy = Math.min(
          webEnergy + GAME_CONFIG.web.energy.regenRate,
          GAME_CONFIG.web.energy.max
        );
      }
      
      // Check prey collision
      const catchRadius = GAME_CONFIG.spider.catchRadius;
      const hasMagnet = gameState.activePowerUps.some((p) => p.type === 'magnet');
      const magnetRadius = GAME_CONFIG.powerUp.effects.magnet;
      
      for (const prey of preyList) {
        const distance = Math.hypot(
          prey.position.x - newX,
          prey.position.y - newY
        );
        
        if (distance < catchRadius) {
          get().catchPrey(prey.id);
        } else if (hasMagnet && distance < magnetRadius) {
          // Pull prey toward spider
          const angle = Math.atan2(newY - prey.position.y, newX - prey.position.x);
          prey.velocity.x += Math.cos(angle) * 0.5;
          prey.velocity.y += Math.sin(angle) * 0.5;
        }
      }
      
      // Check power-up collision
      const { powerUps } = get();
      for (const powerUp of powerUps) {
        const distance = Math.hypot(
          powerUp.position.x - newX,
          powerUp.position.y - newY
        );
        
        if (distance < 40) {
          get().collectPowerUp(powerUp.id);
        }
      }
      
      // Add trail particles when moving
      if (gameState.isCrawling || isJumping || isZipping) {
        const particleChance = isZipping ? 1 : 0.3;
        if (Math.random() < particleChance) {
          get().addParticles([{
            position: { x: newX, y: newY },
            velocity: {
              x: (Math.random() - 0.5) * (isZipping ? 4 : 2),
              y: (Math.random() - 0.5) * (isZipping ? 4 : 2),
            },
            size: Math.random() * (isZipping ? 5 : 3) + 1,
            lifetime: isZipping ? 300 : 500,
            color: isZipping ? 'rgba(100, 200, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
            type: 'trail',
          }]);
        }
      }
      
      set((state) => ({
        gameState: {
          ...state.gameState,
          position: { x: newX, y: newY },
          velocity: newVelocity,
          isJumping,
          isZipping,
          webEnergy,
        },
      }));
      
      // Update other systems
      get().updateWebs();
      get().updatePrey();
      get().updateParticles();
      get().updateScorePopups();
      get().updatePowerUps();
      get().updateCombo();
    },
  }))
);

// Helper function for web collision
function checkWebCollision(prey: { position: Vector2D }, webs: Web[]): boolean {
  if (!webs.length) return false;
  
  for (const web of webs) {
    const webVector = {
      x: web.endPos.x - web.startPos.x,
      y: web.endPos.y - web.startPos.y,
    };
    const webLength = Math.hypot(webVector.x, webVector.y);
    if (webLength < 10) continue;
    
    const toPrey = {
      x: prey.position.x - web.startPos.x,
      y: prey.position.y - web.startPos.y,
    };
    
    const webDirX = webVector.x / webLength;
    const webDirY = webVector.y / webLength;
    const dotProduct = toPrey.x * webDirX + toPrey.y * webDirY;
    
    if (dotProduct < 0 || dotProduct > webLength) continue;
    
    const closestX = web.startPos.x + webDirX * dotProduct;
    const closestY = web.startPos.y + webDirY * dotProduct;
    
    const distanceToWeb = Math.hypot(
      prey.position.x - closestX,
      prey.position.y - closestY
    );
    
    if (distanceToWeb < 25) return true;
  }
  
  return false;
}

