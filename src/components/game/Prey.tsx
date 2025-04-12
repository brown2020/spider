// components/game/Prey.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GameState, Prey as PreyType, Web } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

// Helper function for generating unique IDs
const generateUniqueId = (): string => {
  return (
    Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9)
  );
};

interface PreyProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  webs: Web[];
}

const Prey: React.FC<PreyProps> = ({ gameState, setGameState, webs }) => {
  const [preyList, setPreyList] = useState<PreyType[]>([]);

  // When there are no webs, free all trapped prey
  useEffect(() => {
    if (!webs || webs.length === 0) {
      setPreyList((prev) =>
        prev.map((prey) =>
          prey.isTrapped
            ? {
                ...prey,
                isTrapped: false,
                velocity: {
                  x: (Math.random() - 0.5) * GAME_CONFIG.prey.speed,
                  y: (Math.random() - 0.5) * GAME_CONFIG.prey.speed,
                },
              }
            : prey
        )
      );
    }
  }, [webs]);

  // Handle prey collision with spider
  const handlePreyCollision = useCallback(
    (prey: PreyType) => {
      setGameState((prevState: GameState) => ({
        ...prevState,
        score: prevState.score + GAME_CONFIG.prey.value,
      }));

      setPreyList((prevList) => prevList.filter((p) => p.id !== prey.id));
    },
    [setGameState]
  );

  // Spawn new prey periodically
  useEffect(() => {
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
  }, []);

  // Check if prey is caught in any web
  const checkWebCollision = useCallback(
    (prey: PreyType): boolean => {
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
    },
    [webs]
  );

  // Basic movement update function - kept simple to avoid bugs
  const updatePosition = useCallback((prey: PreyType) => {
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
  }, []);

  // Update prey positions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePrey = () => {
      setPreyList((prev) => {
        // Check if we have no webs - if so, all prey should be free
        const noActiveWebs = !webs || webs.length === 0;

        return prev.map((prey) => {
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
            const { position, velocity } = updatePosition(freedPrey);
            return { ...freedPrey, position, velocity };
          }

          // Process free prey
          if (!prey.isTrapped) {
            // Get updated position with wall bouncing
            const { position, velocity } = updatePosition(prey);

            // Check collision with spider
            const distance = Math.hypot(
              position.x - gameState.position.x,
              position.y - gameState.position.y
            );

            if (
              distance <
              GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale * 0.7
            ) {
              setTimeout(() => handlePreyCollision(prey), 0);
              return { ...prey, isTrapped: true };
            }

            // Create updated prey object with new position
            const updatedPrey = {
              ...prey,
              position,
              velocity,
            };

            // Check if the prey got caught in a web
            const isCaughtInWeb = checkWebCollision(updatedPrey);

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
            const stillCaughtInWeb = checkWebCollision(prey);

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
    };

    const interval = setInterval(updatePrey, 16);
    return () => clearInterval(interval);
  }, [
    gameState.position,
    handlePreyCollision,
    checkWebCollision,
    updatePosition,
    webs,
  ]);

  return (
    <>
      {preyList.map((prey) => (
        <div
          key={prey.id}
          className={`absolute transition-all ${
            prey.isTrapped ? "scale-75 opacity-75" : "scale-100 opacity-100"
          }`}
          style={{
            left: prey.position.x,
            top: prey.position.y,
            transform: "translate(-50%, -50%)",
            width: `${GAME_CONFIG.prey.size}px`,
            height: `${GAME_CONFIG.prey.size}px`,
            transition: "opacity 0.2s, transform 0.2s",
          }}
        >
          <div
            className={`w-full h-full rounded-full ${
              prey.isTrapped ? "bg-gray-400" : "bg-white"
            } ${prey.isTrapped ? "" : "animate-pulse"}`}
            style={{
              boxShadow: prey.isTrapped
                ? "0 0 4px rgba(200, 200, 200, 0.5)"
                : "0 0 8px rgba(255, 255, 255, 0.8)",
            }}
          />
        </div>
      ))}

      {/* Debug info to show web count */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs p-1 z-50">
        Webs: {webs?.length || 0} | Prey: {preyList.length} | Trapped:{" "}
        {preyList.filter((p) => p.isTrapped).length}
      </div>
    </>
  );
};

export default Prey;
