// lib/hooks/useGameLoop.ts
import { useEffect, useRef, useState } from "react";
import { GameState } from "../types/game";
import { GAME_CONFIG } from "../constants/gameConfig";

export const useGameLoop = (initialState: GameState) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const updateGame = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setGameState((prevState) => {
        const newState = { ...prevState };

        // Apply physics
        if (!prevState.isWebShooting) {
          newState.velocity.y += GAME_CONFIG.physics.gravity * (deltaTime / 16);
          newState.velocity.y = Math.min(
            newState.velocity.y,
            GAME_CONFIG.physics.maxFallSpeed
          );
        }

        // Update position
        newState.position.x += newState.velocity.x * (deltaTime / 16);
        newState.position.y += newState.velocity.y * (deltaTime / 16);

        // Apply friction
        newState.velocity.x *= GAME_CONFIG.physics.friction;
        newState.velocity.y *= GAME_CONFIG.physics.airResistance;

        return newState;
      });

      frameRef.current = requestAnimationFrame(updateGame);
    };

    frameRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return gameState;
};
