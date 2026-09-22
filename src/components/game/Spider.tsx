'use client';

import { memo, useMemo } from "react";
import { GameState } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import { useSpriteAnimation } from "@/hooks/useSpriteAnimation";
import { useGameStore } from "@/stores/gameStore";
import { SpiderVisual } from "./SpiderVisual";

interface SpiderProps {
  gameState: GameState;
}

const Spider = memo(function Spider({ gameState }: SpiderProps) {
  const isAnimating = gameState.isCrawling || gameState.isZipping;
  const frameTime = useGameStore((state) => state.frameTime);
  const mousePosition = useGameStore((state) => state.mousePosition);
  const preyList = useGameStore((state) => state.preyList);

  const currentFrame = useSpriteAnimation(
    GAME_CONFIG.spider.animationFrames,
    GAME_CONFIG.spider.animationSpeed,
    isAnimating
  );

  const backgroundPosition = useMemo(() => {
    const frameWidth = GAME_CONFIG.spider.spriteSize;
    const frameHeight = GAME_CONFIG.spider.spriteSize;
    const xOffset = currentFrame * frameWidth;
    const yOffset = {
      down: 0,
      left: frameHeight,
      right: 2 * frameHeight,
      up: 3 * frameHeight,
    }[gameState.direction];
    return `-${xOffset}px -${yOffset}px`;
  }, [currentFrame, gameState.direction]);

  const rotation = useMemo(() => {
    if (!gameState.isJumping && !gameState.isZipping) return 0;
    const rotationFromVelocity = gameState.velocity.x * 2;
    const maxRotation = 25;
    return Math.max(-maxRotation, Math.min(maxRotation, rotationFromVelocity));
  }, [gameState.isJumping, gameState.isZipping, gameState.velocity.x]);

  const scale = useMemo(() => {
    const baseScale = GAME_CONFIG.spider.scale;
    if (gameState.isJumping) {
      const stretchFactor = 1 + Math.abs(gameState.velocity.y) * 0.01;
      const squashFactor = 1 - Math.abs(gameState.velocity.y) * 0.005;
      return { x: baseScale * squashFactor, y: baseScale * stretchFactor };
    }
    if (gameState.isZipping) {
      const speed = Math.hypot(gameState.velocity.x, gameState.velocity.y);
      const stretchFactor = 1 + speed * 0.02;
      return { x: baseScale * stretchFactor, y: baseScale * (1 / stretchFactor) };
    }
    return { x: baseScale, y: baseScale };
  }, [gameState.isJumping, gameState.isZipping, gameState.velocity]);

  const shadowOpacity = useMemo(() => {
    const groundY =
      typeof window !== "undefined"
        ? window.innerHeight - GAME_CONFIG.physics.groundHeight
        : 500;
    const distanceFromGround = groundY - gameState.position.y;
    const maxDistance = 300;
    return Math.max(0.05, 0.25 * (1 - distanceFromGround / maxDistance));
  }, [gameState.position.y]);

  const shadowScale = useMemo(() => {
    const groundY =
      typeof window !== "undefined"
        ? window.innerHeight - GAME_CONFIG.physics.groundHeight
        : 500;
    const distanceFromGround = groundY - gameState.position.y;
    const maxDistance = 300;
    return Math.max(0.4, 1 - (distanceFromGround / maxDistance) * 0.6);
  }, [gameState.position.y]);

  const spriteSize = GAME_CONFIG.spider.spriteSize;

  const eyeDirection = useMemo(() => {
    let targetX = mousePosition.x;
    let targetY = mousePosition.y;
    if (preyList.length > 0) {
      let nearestDist = Infinity;
      for (const prey of preyList) {
        const dist = Math.hypot(
          prey.position.x - gameState.position.x,
          prey.position.y - gameState.position.y
        );
        if (dist < nearestDist && dist < 200) {
          nearestDist = dist;
          targetX = prey.position.x;
          targetY = prey.position.y;
        }
      }
    }
    const dx = targetX - gameState.position.x;
    const dy = targetY - gameState.position.y;
    const angle = Math.atan2(dy, dx);
    const maxOffset = 2;
    return { x: Math.cos(angle) * maxOffset, y: Math.sin(angle) * maxOffset };
  }, [mousePosition.x, mousePosition.y, preyList, gameState.position.x, gameState.position.y]);

  const activePowerUpTypes = useMemo(
    () => gameState.activePowerUps.map((p) => p.type),
    [gameState.activePowerUps]
  );

  const isMoving =
    gameState.isCrawling ||
    gameState.isZipping ||
    Math.abs(gameState.velocity.x) > 1 ||
    Math.abs(gameState.velocity.y) > 1;

  return (
    <SpiderVisual
      gameState={gameState}
      backgroundPosition={backgroundPosition}
      rotation={rotation}
      scale={scale}
      shadowOpacity={shadowOpacity}
      shadowScale={shadowScale}
      eyeDirection={eyeDirection}
      activePowerUpTypes={activePowerUpTypes}
      isMoving={isMoving}
      frameTime={frameTime}
      spriteSize={spriteSize}
    />
  );
});

export default Spider;
