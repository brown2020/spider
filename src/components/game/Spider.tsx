// components/game/Spider.tsx
"use client";

import React from "react";
import { GameState } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import { useSpriteAnimation } from "@/hooks/useSpriteAnimation";

interface SpiderProps {
  gameState: GameState;
}

const Spider: React.FC<SpiderProps> = ({ gameState }) => {
  const currentFrame = useSpriteAnimation(
    GAME_CONFIG.spider.animationFrames,
    GAME_CONFIG.spider.animationSpeed,
    gameState.isCrawling
  );

  const getBackgroundPosition = () => {
    const frameWidth = GAME_CONFIG.spider.spriteSize;
    const frameHeight = GAME_CONFIG.spider.spriteSize;

    // X offset based on current animation frame
    const xOffset = currentFrame * frameWidth;

    // Y offset based on direction
    const yOffset = {
      down: 0,
      left: frameHeight,
      right: 2 * frameHeight,
      up: 3 * frameHeight,
    }[gameState.direction];

    return `-${xOffset}px -${yOffset}px`;
  };

  const getRotation = () => {
    if (!gameState.isJumping) return 0;

    // Add rotation based on horizontal velocity
    const rotationFromVelocity = gameState.velocity.x * 2;
    return rotationFromVelocity;
  };

  return (
    <>
      <div
        className="absolute spider"
        style={{
          top: `${gameState.position.y}px`,
          left: `${gameState.position.x}px`,
          width: `${GAME_CONFIG.spider.spriteSize}px`,
          height: `${GAME_CONFIG.spider.spriteSize}px`,
          backgroundImage: "url('/spider-sprite.png')",
          backgroundPosition: getBackgroundPosition(),
          transform: `
            translate(-50%, -50%) 
            scale(${GAME_CONFIG.spider.scale})
            rotate(${getRotation()}deg)
          `,
          filter: "brightness(6) contrast(2)",
          transition: "rotate 0.2s ease-out",
          zIndex: 1001,
        }}
      />

      {/* Shadow */}
      <div
        className="absolute rounded-full bg-black opacity-20"
        style={{
          bottom: `${GAME_CONFIG.physics.groundHeight - 5}px`,
          left: `${gameState.position.x}px`,
          width: `${GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale * 0.8
            }px`,
          height: `${GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale * 0.2
            }px`,
          transform: "translate(-50%, 0)",
          filter: "blur(2px)",
          zIndex: 1000,
        }}
      />
    </>
  );
};

export default Spider;
