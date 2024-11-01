// lib/hooks/useCollision.ts
import { useEffect, useCallback } from "react";
import { GameState, Vector2D } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

export const useCollision = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const checkBoundaryCollision = useCallback((position: Vector2D) => {
    if (typeof window === "undefined") return position;

    const spiderRadius =
      (GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale) / 2;

    return {
      x: Math.max(
        spiderRadius,
        Math.min(position.x, window.innerWidth - spiderRadius)
      ),
      y: Math.max(
        spiderRadius,
        Math.min(
          position.y,
          window.innerHeight - GAME_CONFIG.physics.groundHeight
        )
      ),
    };
  }, []);

  const checkGroundCollision = useCallback(
    (position: Vector2D, velocity: Vector2D) => {
      if (typeof window === "undefined")
        return { position, velocity, isGrounded: false };

      const groundY = window.innerHeight - GAME_CONFIG.physics.groundHeight;
      const isGrounded = position.y >= groundY;

      if (isGrounded) {
        return {
          position: { ...position, y: groundY },
          velocity: { ...velocity, y: 0 },
          isGrounded: true,
        };
      }

      return { position, velocity, isGrounded: false };
    },
    []
  );

  useEffect(() => {
    // Apply collision checks
    const boundedPosition = checkBoundaryCollision(gameState.position);
    const {
      position: groundedPosition,
      velocity: groundedVelocity,
      isGrounded,
    } = checkGroundCollision(boundedPosition, gameState.velocity);

    // Only update state if position or velocity changed
    if (
      groundedPosition.x !== gameState.position.x ||
      groundedPosition.y !== gameState.position.y ||
      groundedVelocity.x !== gameState.velocity.x ||
      groundedVelocity.y !== gameState.velocity.y
    ) {
      setGameState((prev) => ({
        ...prev,
        position: groundedPosition,
        velocity: groundedVelocity,
        isJumping: prev.isJumping && !isGrounded,
      }));
    }
  }, [
    gameState.position,
    gameState.velocity,
    checkBoundaryCollision,
    checkGroundCollision,
    setGameState,
  ]);

  return {
    checkBoundaryCollision,
    checkGroundCollision,
  };
};
