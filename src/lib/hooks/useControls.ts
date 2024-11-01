// lib/hooks/useControls.ts
import { useEffect } from "react";
import { GameState } from "../types/game";
import { GAME_CONFIG } from "../constants/gameConfig";

export const useControls = (
  gameState: GameState,
  setGameState: (state: GameState) => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = event.shiftKey
        ? GAME_CONFIG.spider.runSpeed
        : GAME_CONFIG.spider.baseSpeed;

      switch (event.key) {
        case "ArrowUp":
          setGameState({
            ...gameState,
            velocity: {
              x: gameState.velocity.x,
              y: -speed,
            },
            direction: "up",
            isCrawling: true,
          });
          break;
        case " ":
          if (!gameState.isJumping) {
            setGameState({
              ...gameState,
              velocity: {
                ...gameState.velocity,
                y: -GAME_CONFIG.spider.jumpForce,
              },
              isJumping: true,
            });
          }
          break;
        // Add other key handlers...
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, setGameState]);
};
