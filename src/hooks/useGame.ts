import { useState, useEffect, useRef, useCallback } from "react";
import { GameState, Web, Prey as PreyType } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

// Helper function to generate unique IDs
const generateUniqueId = (): string => {
  return (
    Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9)
  );
};

const getInitialState = (): GameState => ({
  position: {
    x: (typeof window !== "undefined" ? window.innerWidth : 1000) / 2,
    y: (typeof window !== "undefined" ? window.innerHeight : 500) / 2,
  },
  velocity: { x: 0, y: 0 },
  direction: "right",
  isJumping: false,
  isRunning: false,
  isCrawling: false,
  isWebShooting: false,
  score: 0,
  webEnergy: GAME_CONFIG.web.energy.max,
});

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState());
  const [isPaused, setIsPaused] = useState(false);
  const [webs, setWebs] = useState<Web[]>([]);
  const [preyList, setPreyList] = useState<PreyType[]>([]);
  const lastWebUpdateTime = useRef<number>(0);

  // Initialize webs
  useEffect(() => {
    setWebs([]);
  }, []);

  // Game loop
  useEffect(() => {
    if (isPaused) return;

    const gameLoop = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };

        // Update position based on velocity
        newState.position.x += newState.velocity.x;
        newState.position.y += newState.velocity.y;

        // Apply gravity if jumping
        if (
          newState.isJumping ||
          newState.position.y <
            window.innerHeight - GAME_CONFIG.physics.groundHeight
        ) {
          newState.velocity.y += GAME_CONFIG.physics.gravity;

          // Apply terminal velocity
          newState.velocity.y = Math.min(
            newState.velocity.y,
            GAME_CONFIG.physics.maxFallSpeed
          );
        }

        // Constrain to window bounds
        const spiderRadius =
          (GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale) / 2;

        newState.position.x = Math.max(
          spiderRadius,
          Math.min(newState.position.x, window.innerWidth - spiderRadius)
        );

        newState.position.y = Math.max(
          spiderRadius,
          Math.min(
            newState.position.y,
            window.innerHeight - GAME_CONFIG.physics.groundHeight
          )
        );

        // Ground collision
        if (
          newState.position.y >=
          window.innerHeight - GAME_CONFIG.physics.groundHeight
        ) {
          newState.position.y =
            window.innerHeight - GAME_CONFIG.physics.groundHeight;
          newState.velocity.y = 0;
          newState.isJumping = false;
        }

        // Regenerate web energy
        if (newState.webEnergy < GAME_CONFIG.web.energy.max) {
          newState.webEnergy = Math.min(
            newState.webEnergy + GAME_CONFIG.web.energy.regenRate,
            GAME_CONFIG.web.energy.max
          );
        }

        return newState;
      });

      // Update webs periodically
      const now = Date.now();
      if (now - lastWebUpdateTime.current > 100) {
        lastWebUpdateTime.current = now;
        setWebs((prevWebs) => {
          if (!prevWebs || prevWebs.length === 0) return [];
          return prevWebs.filter((web) => {
            const timeRemaining = web.lifetime - (now - web.createdAt);
            return timeRemaining > 0;
          });
        });
      }
      
      // Update Prey Logic
      setPreyList((prevPreyList) => {
         // Check if we have no webs - if so, all prey should be free
         const noActiveWebs = !webs || webs.length === 0;

         return prevPreyList.map((prey) => {
           // If no webs, automatically free all prey
           if (noActiveWebs && prey.isTrapped) {
             const freedPrey = {
               ...prey,
               isTrapped: false,
               velocity: {
                 x: (Math.random() - 0.5) * GAME_CONFIG.prey.speed * 2,
                 y: (Math.random() - 0.5) * GAME_CONFIG.prey.speed * 2,
               },
             };
             const { position, velocity } = updatePreyPosition(freedPrey);
             return { ...freedPrey, position, velocity };
           }

           // Process free prey
           if (!prey.isTrapped) {
             // Get updated position with wall bouncing
             const { position, velocity } = updatePreyPosition(prey);

             // Check collision with spider (handled in separate effect/callback usually, but can be here for simple state update)
             // Actually, collision with spider updates SCORE, which is in gameState. 
             // We need to handle that carefully. For now, let's just move them.
             // The collision logic needs access to gameState, which we have in the outer scope, 
             // but inside setPreyList we only have prevPreyList.
             // We'll handle spider collision in a separate effect or check it here using the ref/latest state if needed.
             // For now, let's just do movement.
             
             // Create updated prey object with new position
             const updatedPrey = {
               ...prey,
               position,
               velocity,
             };

             // Check if the prey got caught in a web
             const isCaughtInWeb = checkWebCollision(updatedPrey, webs);

             if (isCaughtInWeb) {
               // Just caught - reduce speed
               return {
                 ...updatedPrey,
                 isTrapped: true,
                 velocity: {
                   x: updatedPrey.velocity.x * 0.4,
                   y: updatedPrey.velocity.y * 0.4,
                 },
               };
             }

             // Not trapped - continue with normal movement
             return updatedPrey;
           } else {
             // Already trapped prey
             // Check if still in web
             const stillCaughtInWeb = checkWebCollision(prey, webs);

             if (!stillCaughtInWeb) {
               // Escaped from web
               return {
                 ...prey,
                 isTrapped: false,
                 velocity: {
                   x: (Math.random() - 0.5) * GAME_CONFIG.prey.speed,
                   y: (Math.random() - 0.5) * GAME_CONFIG.prey.speed,
                 },
               };
             } else {
               // Still trapped - struggle with minimal movement
               return {
                 ...prey,
                 velocity: {
                   x: prey.velocity.x * 0.98 + (Math.random() - 0.5) * 0.1,
                   y: prey.velocity.y * 0.98 + (Math.random() - 0.5) * 0.1,
                 },
                 position: {
                   x: prey.position.x + prey.velocity.x * 0.2,
                   y: prey.position.y + prey.velocity.y * 0.2,
                 },
               };
             }
           }
         });
      });

    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [isPaused, webs]); // Added webs to dependency array because we use it in prey update

  // Separate effect for spawning prey
  useEffect(() => {
      if (isPaused) return;
      const spawnPrey = () => {
        if (typeof window === "undefined") return;
  
        // Generate random speed components that aren't too close to zero
        const getRandomSpeed = () => {
          const speed = GAME_CONFIG.prey.speed;
          const minSpeed = speed * 0.3; // Minimum 30% of max speed
          let randomSpeed = (Math.random() - 0.5) * 2 * speed; // -speed to +speed
  
          // Ensure speed is not too small
          if (Math.abs(randomSpeed) < minSpeed) {
            randomSpeed = randomSpeed >= 0 ? minSpeed : -minSpeed;
          }
  
          return randomSpeed;
        };
  
        const newPrey: PreyType = {
          id: generateUniqueId(),
          position: {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          },
          velocity: {
            x: getRandomSpeed(),
            y: getRandomSpeed(),
          },
          isTrapped: false,
        };
  
        setPreyList((prev) => [...prev, newPrey]);
      };
  
      const interval = setInterval(spawnPrey, GAME_CONFIG.prey.spawnRate);
      return () => clearInterval(interval);
  }, [isPaused]);

  // Check for Spider-Prey Collision
  useEffect(() => {
      if (isPaused) return;
      
      setPreyList(prevList => {
          let scoreIncrement = 0;
          const remainingPrey = prevList.filter(prey => {
               // Check collision with spider
               const distance = Math.hypot(
                prey.position.x - gameState.position.x,
                prey.position.y - gameState.position.y
              );
  
              if (
                distance <
                GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale * 0.7
              ) {
                scoreIncrement += GAME_CONFIG.prey.value;
                return false; // Remove prey
              }
              return true; // Keep prey
          });

          if (scoreIncrement > 0) {
              setGameState(prev => ({
                  ...prev,
                  score: prev.score + scoreIncrement
              }));
          }

          return remainingPrey;
      });
  }, [gameState.position, isPaused]);


  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setGameState((prev) => ({
        ...prev,
        position: {
          x: Math.min(prev.position.x, window.innerWidth),
          y: Math.min(prev.position.y, window.innerHeight),
        },
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    gameState,
    setGameState,
    isPaused,
    setIsPaused,
    webs,
    setWebs,
    preyList,
    setPreyList
  };
};

// Helper functions moved outside to avoid recreation
const updatePreyPosition = (prey: PreyType) => {
    // Calculate new position using current velocity
    const newPos = {
      x: prey.position.x + prey.velocity.x,
      y: prey.position.y + prey.velocity.y,
    };

    // Bounce off walls
    let newVelX = prey.velocity.x;
    let newVelY = prey.velocity.y;

    if (newPos.x < 0 || newPos.x > window.innerWidth) {
      newVelX *= -1;
      newPos.x = Math.max(0, Math.min(newPos.x, window.innerWidth));
    }
    if (newPos.y < 0 || newPos.y > window.innerHeight) {
      newVelY *= -1;
      newPos.y = Math.max(0, Math.min(newPos.y, window.innerHeight));
    }

    return {
      position: newPos,
      velocity: { x: newVelX, y: newVelY },
    };
};

const checkWebCollision = (prey: PreyType, webs: Web[]): boolean => {
    // If no webs, can't be trapped
    if (!webs || webs.length === 0) {
      return false;
    }

    // Check each web
    for (const web of webs) {
      // Skip invalid webs
      if (!web || !web.startPos || !web.endPos) {
        continue;
      }

      // Calculate if prey is close to the web line
      const webVector = {
        x: web.endPos.x - web.startPos.x,
        y: web.endPos.y - web.startPos.y,
      };

      const webLength = Math.hypot(webVector.x, webVector.y);

      // If web length is too short, ignore
      if (webLength < 10) {
        continue;
      }

      // Vector from web start to prey
      const toPrey = {
        x: prey.position.x - web.startPos.x,
        y: prey.position.y - web.startPos.y,
      };

      // Calculate projection of toPrey onto the web direction
      const webDirX = webVector.x / webLength;
      const webDirY = webVector.y / webLength;

      const dotProduct = toPrey.x * webDirX + toPrey.y * webDirY;

      // If projection is outside the web's endpoints, prey is not on the web
      if (dotProduct < 0 || dotProduct > webLength) {
        continue;
      }

      // Find the closest point on the web line to the prey
      const closestX = web.startPos.x + webDirX * dotProduct;
      const closestY = web.startPos.y + webDirY * dotProduct;

      // Calculate distance from prey to the closest point on web
      const distanceToWeb = Math.hypot(
        prey.position.x - closestX,
        prey.position.y - closestY
      );

      // Collision threshold based on prey size and web thickness
      const collisionThreshold =
        GAME_CONFIG.prey.size / 2 + GAME_CONFIG.web.thickness / 2;

      // Prey is caught if it's close enough to the web
      if (distanceToWeb < collisionThreshold) {
        return true;
      }
    }

    // Not caught in any web
    return false;
};
