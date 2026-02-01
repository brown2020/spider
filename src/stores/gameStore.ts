// stores/gameStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
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
} from "@/lib/types/game";
import { GAME_CONFIG, PREY_TYPES } from "@/lib/constants/gameConfig";
import { playSound, playSoundWithCombo } from "@/lib/utils/sound";
import {
  createParticles,
  createWebShootParticles,
  createTrailParticle,
  createConfettiParticles,
  createRingBurstParticles,
  createLandingParticles,
} from "@/lib/utils/particles";

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
  return "moth";
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

  // Centralized frame time (updated once per tick)
  frameTime: number;

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
  setDirection: (direction: GameState["direction"]) => void;
  setCrawling: (isCrawling: boolean) => void;
  jump: () => void;
  doubleJump: () => void;
  zipTo: (target: Vector2D) => void;

  // Actions - Web
  shootWeb: (target: Vector2D) => void;
  updateWebs: () => void;

  // Actions - Prey
  spawnPrey: () => void;
  updatePrey: () => void;
  catchPrey: (preyId: string) => void;

  // Actions - Particles & Effects
  addParticles: (particles: Omit<Particle, "id" | "createdAt">[]) => void;
  updateParticles: () => void;
  addScorePopup: (position: Vector2D, value: number, combo?: number) => void;
  updateScorePopups: () => void;
  triggerScreenShake: (intensity: number, direction?: Vector2D) => void;
  triggerScreenFlash: (color: string, intensity: number) => void;
  triggerFreezeFrame: (duration: number) => void;

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
  direction: "right",
  isJumping: false,
  isRunning: false,
  isCrawling: false,
  isWebShooting: false,
  isZipping: false,
  isOnWall: false,
  canDoubleJump: true,
  score: 0,
  highScore:
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("spiderHighScore") || "0", 10)
      : 0,
  webEnergy: GAME_CONFIG.web.energy.max,
  combo: 0,
  comboTimer: 0,
  lastCatchTime: 0,
  gamePhase: "menu",
  difficulty: 1,
  activePowerUps: [],
  screenShake: 0,
  screenShakeDirection: { x: 0, y: 0 },
  screenFlash: null,
  freezeFrame: 0,
  coyoteTime: 0,
  lastGroundedTime: 0,
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
    frameTime: Date.now(),
    dimensions: { width: 1000, height: 600 },

    // Game Flow Actions
    startGame: () => {
      const { dimensions } = get();
      set({
        gameState: {
          ...getInitialGameState(),
          position: { x: dimensions.width / 2, y: dimensions.height / 2 },
          gamePhase: "playing",
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
        gameState: { ...state.gameState, gamePhase: "paused" },
      }));
    },

    resumeGame: () => {
      set((state) => ({
        gameState: { ...state.gameState, gamePhase: "playing" },
      }));
    },

    endGame: () => {
      const { gameState } = get();
      const newHighScore = Math.max(gameState.score, gameState.highScore);

      playSound("gameOver");

      if (typeof window !== "undefined") {
        localStorage.setItem("spiderHighScore", newHighScore.toString());
      }

      set((state) => ({
        gameState: {
          ...state.gameState,
          gamePhase: "gameOver",
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

      playSound("jump");

      set((state) => ({
        gameState: {
          ...state.gameState,
          velocity: {
            ...state.gameState.velocity,
            y: -GAME_CONFIG.spider.jumpForce,
          },
          isJumping: true,
          canDoubleJump: true,
        },
      }));
    },

    doubleJump: () => {
      const { gameState } = get();
      if (!gameState.isJumping || !gameState.canDoubleJump) return;
      if (gameState.webEnergy < GAME_CONFIG.web.energy.shootCost) return;

      playSound("jump", { pitchMultiplier: 1.3 });

      // Add particles for double jump effect
      get().addParticles(
        createParticles("zip", gameState.position, 8, {
          velocityBias: { x: 0, y: 3 },
          color: "rgba(150, 200, 255, 0.8)",
        })
      );

      set((state) => ({
        gameState: {
          ...state.gameState,
          velocity: {
            ...state.gameState.velocity,
            y: -GAME_CONFIG.movement.doubleJumpForce,
          },
          canDoubleJump: false,
          webEnergy: state.gameState.webEnergy - GAME_CONFIG.web.energy.shootCost * 0.5,
        },
      }));
    },

    zipTo: (target) => {
      const { gameState } = get();
      if (gameState.webEnergy < GAME_CONFIG.web.energy.zipCost) return;

      const dx = target.x - gameState.position.x;
      const dy = target.y - gameState.position.y;
      const distance = Math.hypot(dx, dy);

      if (distance < GAME_CONFIG.physics.minZipDistance) return;

      playSound("zip");

      const speed = GAME_CONFIG.physics.zipSpeed;
      const velocity = {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed,
      };

      // Add zip trail particles
      get().addParticles(
        createParticles(
          "zip",
          gameState.position,
          GAME_CONFIG.particles.zipCount
        )
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
      const { gameState, frameTime } = get();
      if (gameState.webEnergy < GAME_CONFIG.web.energy.shootCost) return;

      playSound("webShoot");

      // Check for multiShot power-up
      const hasMultiShot = gameState.activePowerUps.some(p => p.type === 'multiShot');

      const newWebs: Web[] = [];

      if (hasMultiShot) {
        // Calculate angle to target
        const dx = target.x - gameState.position.x;
        const dy = target.y - gameState.position.y;
        const baseAngle = Math.atan2(dy, dx);
        const distance = Math.hypot(dx, dy);

        // Spread angle (15 degrees each side)
        const spreadAngle = Math.PI / 12;

        // Create 3 webs in a spread pattern
        for (let i = -1; i <= 1; i++) {
          const angle = baseAngle + i * spreadAngle;
          const endPos = {
            x: gameState.position.x + Math.cos(angle) * distance,
            y: gameState.position.y + Math.sin(angle) * distance,
          };

          newWebs.push({
            id: generateId(),
            startPos: { ...gameState.position },
            endPos,
            lifetime: GAME_CONFIG.web.duration,
            createdAt: frameTime,
            strength: 1,
          });
        }
      } else {
        // Single web shot
        newWebs.push({
          id: generateId(),
          startPos: { ...gameState.position },
          endPos: { ...target },
          lifetime: GAME_CONFIG.web.duration,
          createdAt: frameTime,
          strength: 1,
        });
      }

      // Add web shooting particles
      get().addParticles(
        createWebShootParticles(
          gameState.position,
          target,
          GAME_CONFIG.particles.webShootCount * (hasMultiShot ? 2 : 1)
        )
      );

      set((state) => ({
        webs: [...state.webs, ...newWebs].slice(-GAME_CONFIG.web.maxActive),
        gameState: {
          ...state.gameState,
          isWebShooting: true,
          webEnergy:
            state.gameState.webEnergy - GAME_CONFIG.web.energy.shootCost,
        },
      }));
    },

    updateWebs: () => {
      const { frameTime } = get();
      set((state) => ({
        webs: state.webs.filter(
          (web) => frameTime - web.createdAt < web.lifetime
        ),
      }));
    },

    // Prey Actions
    spawnPrey: () => {
      const { preyList, dimensions, gameState } = get();
      if (preyList.length >= GAME_CONFIG.prey.maxOnScreen) return;

      const type = getRandomPreyType();
      const config = PREY_TYPES[type];
      const speedMultiplier =
        1 + (gameState.difficulty - 1) * GAME_CONFIG.difficulty.preySpeedBonus;
      const edgeOffset = GAME_CONFIG.prey.spawnEdgeOffset;

      // Spawn from edges
      const edge = Math.floor(Math.random() * 4);
      let position: Vector2D;

      switch (edge) {
        case 0: // Top
          position = { x: Math.random() * dimensions.width, y: -edgeOffset };
          break;
        case 1: // Right
          position = {
            x: dimensions.width + edgeOffset,
            y: Math.random() * dimensions.height,
          };
          break;
        case 2: // Bottom
          position = {
            x: Math.random() * dimensions.width,
            y: dimensions.height + edgeOffset,
          };
          break;
        default: // Left
          position = { x: -edgeOffset, y: Math.random() * dimensions.height };
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
                case "erratic":
                  if (Math.random() < 0.1) {
                    const angle = Math.random() * Math.PI * 2;
                    newVelocity = {
                      x: Math.cos(angle) * config.baseSpeed,
                      y: Math.sin(angle) * config.baseSpeed,
                    };
                  }
                  break;
                case "hovering":
                  newVelocity.y +=
                    Math.sin(Date.now() * 0.005 + prey.wingPhase) * 0.3;
                  break;
                case "fast":
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
              newPosition.x = Math.max(
                0,
                Math.min(dimensions.width, newPosition.x)
              );
            }
            if (
              newPosition.y < 0 ||
              newPosition.y >
                dimensions.height - GAME_CONFIG.physics.groundHeight
            ) {
              newVelocity.y *= -1;
              newPosition.y = Math.max(
                0,
                Math.min(
                  dimensions.height - GAME_CONFIG.physics.groundHeight,
                  newPosition.y
                )
              );
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
      const { preyList, gameState, frameTime } = get();
      const prey = preyList.find((p) => p.id === preyId);
      if (!prey) return;

      const config = PREY_TYPES[prey.type];

      // Calculate combo
      const timeSinceLastCatch = frameTime - gameState.lastCatchTime;
      const newCombo =
        timeSinceLastCatch < GAME_CONFIG.combo.duration
          ? Math.min(gameState.combo + 1, GAME_CONFIG.combo.multiplierCap)
          : 1;

      // Play sound with pitch scaling based on combo
      if (newCombo > 1) {
        playSoundWithCombo("combo", newCombo);
      } else {
        playSound("catch");
      }

      // Calculate score with combo
      const comboMultiplier = 1 + (newCombo - 1) * 0.25;
      const points = Math.floor(config.value * comboMultiplier);

      // Calculate direction from spider to prey for directional effects
      const catchDirection = {
        x: prey.position.x - gameState.position.x,
        y: prey.position.y - gameState.position.y,
      };

      // Add catch particles
      get().addParticles(
        createParticles(
          "catch",
          prey.position,
          GAME_CONFIG.particles.catchCount,
          {
            color: config.glowColor,
          }
        )
      );

      // Add ring burst effect
      get().addParticles(
        createRingBurstParticles(prey.position, config.glowColor, 3)
      );

      // Add combo particles if combo > 1
      if (newCombo > 1) {
        get().addParticles(
          createParticles("combo", prey.position, newCombo * 3, {
            color: `hsl(${50 + newCombo * 10}, 100%, 60%)`,
          })
        );
      }

      // Big combo milestones (5x, 10x) get confetti and screen flash
      if (newCombo === 5 || newCombo === 10 || newCombo % 10 === 0) {
        const intensity = newCombo >= 10 ? 1.5 : 1;
        get().addParticles(
          createConfettiParticles(prey.position, GAME_CONFIG.effects.confettiCount, intensity)
        );
        get().triggerScreenFlash(`hsl(${50 + newCombo * 5}, 100%, 70%)`, 0.3);
        get().triggerFreezeFrame(GAME_CONFIG.effects.freezeFrameDuration);
      }

      // Score popup
      get().addScorePopup(
        prey.position,
        points,
        newCombo > 1 ? newCombo : undefined
      );

      // Directional screen shake - stronger for higher combos
      const shakeIntensity = newCombo > 5 ? 10 : newCombo > 3 ? 8 : 4;
      get().triggerScreenShake(shakeIntensity, catchDirection);

      // Maybe spawn power-up
      if (
        Math.random() <
        GAME_CONFIG.powerUp.spawnChance * (1 + newCombo * 0.1)
      ) {
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
          lastCatchTime: frameTime,
          difficulty: newDifficulty,
        },
      }));
    },

    // Particle Actions
    addParticles: (particles) => {
      const { frameTime } = get();
      const newParticles = particles.map((p) => ({
        ...p,
        id: generateId(),
        createdAt: frameTime,
      }));

      set((state) => ({
        particles: [...state.particles, ...newParticles].slice(
          -GAME_CONFIG.particles.maxCount
        ),
      }));
    },

    updateParticles: () => {
      const { frameTime } = get();
      set((state) => ({
        particles: state.particles
          .filter((p) => frameTime - p.createdAt < p.lifetime)
          .map((p) => {
            // Apply gravity for confetti and particles with gravity property
            const gravity = p.gravity ?? (p.type === "confetti" ? 0.15 : p.type === "catch" ? 0.1 : 0);

            // Update rotation for confetti
            const newRotation = p.rotation !== undefined
              ? p.rotation + (p.rotationSpeed ?? 0)
              : undefined;

            return {
              ...p,
              position: {
                x: p.position.x + p.velocity.x,
                y: p.position.y + p.velocity.y,
              },
              velocity: {
                x: p.velocity.x * 0.98,
                y: p.velocity.y * 0.98 + gravity,
              },
              rotation: newRotation,
            };
          }),
      }));
    },

    addScorePopup: (position, value, combo) => {
      const { frameTime } = get();
      const popup: ScorePopup = {
        id: generateId(),
        position: { ...position },
        value,
        combo,
        createdAt: frameTime,
      };

      set((state) => ({
        scorePopups: [...state.scorePopups, popup],
      }));
    },

    updateScorePopups: () => {
      const { frameTime } = get();
      set((state) => ({
        scorePopups: state.scorePopups.filter(
          (p) =>
            frameTime - p.createdAt < GAME_CONFIG.effects.scorePopupDuration
        ),
      }));
    },

    triggerScreenShake: (intensity, direction?: Vector2D) => {
      // Calculate directional shake if direction provided
      const shakeDir = direction
        ? {
            x: direction.x / (Math.hypot(direction.x, direction.y) || 1),
            y: direction.y / (Math.hypot(direction.x, direction.y) || 1)
          }
        : { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };

      set((state) => ({
        gameState: {
          ...state.gameState,
          screenShake: intensity,
          screenShakeDirection: shakeDir,
        },
      }));

      // Reset after animation
      setTimeout(() => {
        set((state) => ({
          gameState: { ...state.gameState, screenShake: 0, screenShakeDirection: { x: 0, y: 0 } },
        }));
      }, GAME_CONFIG.effects.screenShakeDuration);
    },

    triggerScreenFlash: (color: string, intensity: number) => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          screenFlash: { color, intensity }
        },
      }));

      // Reset after flash duration
      setTimeout(() => {
        set((state) => ({
          gameState: { ...state.gameState, screenFlash: null },
        }));
      }, GAME_CONFIG.effects.screenFlashDuration);
    },

    triggerFreezeFrame: (duration: number) => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          freezeFrame: duration
        },
      }));
    },

    // Power-up Actions
    spawnPowerUp: (position) => {
      const { frameTime } = get();
      const types: PowerUpType[] = ["speed", "webEnergy", "magnet", "slowTime", "multiShot"];
      const type = types[Math.floor(Math.random() * types.length)];

      const powerUp: PowerUp = {
        id: generateId(),
        type,
        position: { ...position },
        createdAt: frameTime,
        lifetime: 10000,
      };

      set((state) => ({
        powerUps: [...state.powerUps, powerUp],
      }));
    },

    collectPowerUp: (powerUpId) => {
      const { powerUps, frameTime } = get();
      const powerUp = powerUps.find((p) => p.id === powerUpId);
      if (!powerUp) return;

      playSound("powerUp");

      // Apply power-up effect
      switch (powerUp.type) {
        case "webEnergy":
          set((state) => ({
            gameState: {
              ...state.gameState,
              webEnergy: Math.min(
                state.gameState.webEnergy +
                  GAME_CONFIG.powerUp.effects.webEnergy,
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
                ...state.gameState.activePowerUps.filter(
                  (p) => p.type !== powerUp.type
                ),
                {
                  type: powerUp.type,
                  expiresAt: frameTime + GAME_CONFIG.powerUp.duration,
                },
              ],
            },
            powerUps: state.powerUps.filter((p) => p.id !== powerUpId),
          }));
      }

      // Visual feedback
      get().addParticles(
        createParticles(
          "powerUp",
          powerUp.position,
          GAME_CONFIG.particles.powerUpCount
        )
      );
    },

    updatePowerUps: () => {
      const { frameTime } = get();

      set((state) => ({
        powerUps: state.powerUps.filter(
          (p) => frameTime - p.createdAt < p.lifetime
        ),
        gameState: {
          ...state.gameState,
          activePowerUps: state.gameState.activePowerUps.filter(
            (p) => p.expiresAt > frameTime
          ),
        },
      }));
    },

    // Combo
    updateCombo: () => {
      const { gameState, frameTime } = get();

      if (
        gameState.combo > 0 &&
        frameTime - gameState.lastCatchTime > GAME_CONFIG.combo.duration
      ) {
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
      if (gameState.gamePhase !== "playing") return;

      // Handle freeze frame - skip physics updates but still update time
      if (gameState.freezeFrame > 0) {
        set((state) => ({
          frameTime: Date.now(),
          gameState: {
            ...state.gameState,
            freezeFrame: Math.max(0, state.gameState.freezeFrame - 16),
          },
        }));
        return;
      }

      // Update frame time once per tick
      const now = Date.now();

      // Check speed power-up
      const hasSpeedBoost = gameState.activePowerUps.some(
        (p) => p.type === "speed"
      );
      const speedMultiplier = hasSpeedBoost
        ? GAME_CONFIG.powerUp.effects.speed
        : 1;

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

        const zipThreshold = GAME_CONFIG.physics.zipStopThreshold;
        if (
          Math.abs(newVelocity.x) < zipThreshold &&
          Math.abs(newVelocity.y) < zipThreshold
        ) {
          isZipping = false;
        }
      } else if (
        isJumping ||
        newY < dimensions.height - GAME_CONFIG.physics.groundHeight
      ) {
        newVelocity.y = Math.min(
          newVelocity.y + GAME_CONFIG.physics.gravity,
          GAME_CONFIG.physics.maxFallSpeed
        );
      }

      // Bounds checking
      const spiderRadius =
        (GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale) / 2;
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
        // Landing detection - create dust particles if falling fast
        const wasAirborne = gameState.isJumping || gameState.isZipping;
        const landingSpeed = Math.abs(gameState.velocity.y);
        if (wasAirborne && landingSpeed > 5) {
          get().addParticles(
            createLandingParticles(
              { x: newX, y: dimensions.height - GAME_CONFIG.physics.groundHeight },
              gameState.velocity,
              Math.min(12, Math.floor(landingSpeed))
            )
          );
        }

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
      const hasMagnet = gameState.activePowerUps.some(
        (p) => p.type === "magnet"
      );
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
          const angle = Math.atan2(
            newY - prey.position.y,
            newX - prey.position.x
          );
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

        if (distance < GAME_CONFIG.powerUp.collectRadius) {
          get().collectPowerUp(powerUp.id);
        }
      }

      // Add trail particles when moving
      if (gameState.isCrawling || isJumping || isZipping) {
        const particleChance = isZipping
          ? 1
          : GAME_CONFIG.particles.trailChance;
        if (Math.random() < particleChance) {
          get().addParticles([
            createTrailParticle({ x: newX, y: newY }, isZipping),
          ]);
        }
      }

      set((state) => ({
        frameTime: now,
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

  const collisionRadius = GAME_CONFIG.web.collisionRadius;

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

    if (distanceToWeb < collisionRadius) return true;
  }

  return false;
}
